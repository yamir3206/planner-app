import { IStorage, StorageError } from './IStorage'

export class LocalStorageAdapter implements IStorage {
  private prefix: string

  constructor(prefix: string = 'axon_') {
    this.prefix = prefix
  }

  private getFullKey(key: string): string {
    return `${this.prefix}${key}`
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return null
      const raw = localStorage.getItem(this.getFullKey(key))
      if (raw === null) return null
      return JSON.parse(raw) as T
    } catch (error) {
      console.warn(`[LocalStorage] get failed for ${key}:`, error)
      return null
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        throw new StorageError('localStorage not available', 'UNKNOWN')
      }
      const raw = JSON.stringify(value)
      localStorage.setItem(this.getFullKey(key), raw)
    } catch (error: any) {
      if (error?.name === 'QuotaExceededError' || error?.code === 22) {
        throw new StorageError('حافظه پر شده است', 'QUOTA_EXCEEDED', error)
      }
      throw new StorageError('خطا در ذخیره‌سازی', 'UNKNOWN', error)
    }
  }

  async remove(key: string): Promise<void> {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return
      localStorage.removeItem(this.getFullKey(key))
    } catch (error) {
      console.warn(`[LocalStorage] remove failed for ${key}:`, error)
    }
  }

  async clear(): Promise<void> {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return
      const keys = await this.keys()
      for (const key of keys) {
        localStorage.removeItem(this.getFullKey(key))
      }
    } catch (error) {
      console.warn('[LocalStorage] clear failed:', error)
    }
  }

  async keys(): Promise<string[]> {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return []
      const result: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith(this.prefix)) {
          result.push(key.slice(this.prefix.length))
        }
      }
      return result
    } catch {
      return []
    }
  }

  async getAll<T>(prefix?: string): Promise<Record<string, T>> {
    const result: Record<string, T> = {}
    const keys = await this.keys()
    for (const key of keys) {
      if (prefix && !key.startsWith(prefix)) continue
      const value = await this.get<T>(key)
      if (value !== null) result[key] = value
    }
    return result
  }
}
