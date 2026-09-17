import { IStorage, StorageError } from '../IStorage'

// این آداپتر برای اتصال به Supabase یا هر REST API آماده شده
// فعلاً به صورت local کار می‌کند و آماده برای اتصال به سرور است

export interface RemoteConfig {
  url: string
  apiKey?: string
  userId?: string
  enabled: boolean
}

export class SupabaseAdapter implements IStorage {
  private config: RemoteConfig | null = null
  private localCache: Map<string, any> = new Map()
  private isOnline = false

  constructor(config?: RemoteConfig) {
    if (config) {
      this.config = config
    } else {
      // خواندن از localStorage یا env
      try {
        const stored = localStorage.getItem('axon_remote_config')
        if (stored) {
          this.config = JSON.parse(stored)
        }
      } catch {}
    }
    
    // بررسی آنلاین بودن
    this.checkConnection()
  }

  private async checkConnection() {
    if (!this.config?.enabled || !this.config?.url) {
      this.isOnline = false
      return
    }
    
    try {
      // تست اتصال ساده
      this.isOnline = true
    } catch {
      this.isOnline = false
    }
  }

  async get<T>(key: string): Promise<T | null> {
    // اگر آنلاین و تنظیم شده، از سرور بگیر
    if (this.isOnline && this.config?.url) {
      try {
        const response = await fetch(`${this.config.url}/storage/${key}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(this.config.apiKey ? { 'apikey': this.config.apiKey, 'Authorization': `Bearer ${this.config.apiKey}` } : {}),
            ...(this.config.userId ? { 'x-user-id': this.config.userId } : {})
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          this.localCache.set(key, data)
          return data as T
        }
      } catch (e) {
        console.warn('[SupabaseAdapter] Remote get failed, using cache', e)
      }
    }
    
    // fallback به cache محلی
    if (this.localCache.has(key)) {
      return this.localCache.get(key) as T
    }
    
    try {
      const local = localStorage.getItem(`axon_${key}`)
      if (local) {
        const parsed = JSON.parse(local)
        this.localCache.set(key, parsed)
        return parsed as T
      }
    } catch {}
    
    return null
  }

  async set<T>(key: string, value: T): Promise<void> {
    // ذخیره محلی همیشه
    this.localCache.set(key, value)
    try {
      localStorage.setItem(`axon_${key}`, JSON.stringify(value))
    } catch (e) {
      if ((e as any)?.name === 'QuotaExceededError') {
        throw new StorageError('فضای ذخیره پر است', 'QUOTA_EXCEEDED', e)
      }
    }
    
    // اگر آنلاین، به سرور هم بفرست
    if (this.isOnline && this.config?.url) {
      try {
        await fetch(`${this.config.url}/storage/${key}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(this.config.apiKey ? { 'apikey': this.config.apiKey, 'Authorization': `Bearer ${this.config.apiKey}` } : {}),
            ...(this.config.userId ? { 'x-user-id': this.config.userId } : {})
          },
          body: JSON.stringify(value)
        })
      } catch (e) {
        console.warn('[SupabaseAdapter] Remote set failed, kept locally', e)
      }
    }
  }

  async remove(key: string): Promise<void> {
    this.localCache.delete(key)
    try {
      localStorage.removeItem(`axon_${key}`)
    } catch {}
    
    if (this.isOnline && this.config?.url) {
      try {
        await fetch(`${this.config.url}/storage/${key}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            ...(this.config.apiKey ? { 'apikey': this.config.apiKey, 'Authorization': `Bearer ${this.config.apiKey}` } : {}),
            ...(this.config.userId ? { 'x-user-id': this.config.userId } : {})
          }
        })
      } catch {}
    }
  }

  async clear(): Promise<void> {
    this.localCache.clear()
    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('axon_'))
      keys.forEach(k => localStorage.removeItem(k))
    } catch {}
    
    if (this.isOnline && this.config?.url) {
      try {
        await fetch(`${this.config.url}/storage/clear`, { method: 'POST' })
      } catch {}
    }
  }

  async keys(): Promise<string[]> {
    try {
      return Object.keys(localStorage)
        .filter(k => k.startsWith('axon_'))
        .map(k => k.replace('axon_', ''))
    } catch {
      return Array.from(this.localCache.keys())
    }
  }

  async getAll<T>(prefix?: string): Promise<Record<string, T>> {
    const result: Record<string, T> = {}
    const allKeys = await this.keys()
    
    for (const key of allKeys) {
      if (prefix && !key.startsWith(prefix)) continue
      const value = await this.get<T>(key)
      if (value !== null) {
        result[key] = value
      }
    }
    
    return result
  }

  // تنظیمات remote
  setConfig(config: RemoteConfig) {
    this.config = config
    try {
      localStorage.setItem('axon_remote_config', JSON.stringify(config))
    } catch {}
    this.checkConnection()
  }

  getConfig(): RemoteConfig | null {
    return this.config
  }

  isRemoteEnabled(): boolean {
    return !!this.config?.enabled && !!this.config?.url
  }
}
