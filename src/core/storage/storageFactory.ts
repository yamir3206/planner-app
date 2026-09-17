import { IStorage } from './IStorage'
import { IndexedDBAdapter } from './indexedDBAdapter'
import { LocalStorageAdapter } from './localStorageAdapter'
import { MemoryAdapter } from './memoryAdapter'
import { SupabaseAdapter } from './adapters/supabaseAdapter'
import { getCurrentDatabaseConfig, DatabaseType } from './databaseConfig'

export type StorageType = DatabaseType

class StorageFactory {
  private instance: IStorage | null = null
  private indexedInstance: IndexedDBAdapter | null = null
  private type: StorageType = 'auto'

  constructor() {
    try {
      const config = getCurrentDatabaseConfig()
      this.type = config.type
    } catch {
      this.type = 'auto'
    }
  }

  setType(type: StorageType) {
    this.type = type
    this.instance = null
    this.indexedInstance = null
  }

  getStorage(): IStorage {
    if (this.instance) return this.instance

    const config = getCurrentDatabaseConfig()
    const effectiveType = this.type === 'auto' ? config.type : this.type

    if (effectiveType === 'auto') {
      if (typeof window !== 'undefined' && 'indexedDB' in window) {
        try {
          this.instance = this.getIndexedDBAdapter()
          return this.instance
        } catch {}
      }
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        try {
          this.instance = new LocalStorageAdapter()
          return this.instance
        } catch {}
      }
      this.instance = new MemoryAdapter()
      return this.instance
    }

    switch (effectiveType) {
      case 'memory':
        this.instance = new MemoryAdapter()
        break
      case 'localstorage':
        this.instance = new LocalStorageAdapter()
        break
      case 'indexeddb':
        this.instance = this.getIndexedDBAdapter()
        break
      case 'supabase':
      case 'firebase':
      case 'rest':
        this.instance = new SupabaseAdapter({
          url: config.url || '',
          apiKey: config.apiKey,
          enabled: !!config.url,
        })
        break
      default:
        this.instance = this.getIndexedDBAdapter()
    }

    return this.instance
  }

  getIndexedDBAdapter(): IndexedDBAdapter {
    if (this.indexedInstance) return this.indexedInstance
    if (this.instance instanceof IndexedDBAdapter) {
      this.indexedInstance = this.instance
      return this.instance
    }
    this.indexedInstance = new IndexedDBAdapter()
    if (!this.instance) this.instance = this.indexedInstance
    return this.indexedInstance
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const storage = this.getStorage()
      const testKey = '__test_connection__'
      await storage.set(testKey, { test: true, time: Date.now() })
      const retrieved = await storage.get(testKey)
      await storage.remove(testKey)
      return retrieved ? { success: true, message: 'اتصال موفق' } : { success: false, message: 'ذخیره نشد' }
    } catch (e) {
      return { success: false, message: (e as Error).message }
    }
  }

  getCurrentType(): StorageType {
    return this.type
  }
}

export const storageFactory = new StorageFactory()
export const storage: IStorage = storageFactory.getStorage()
