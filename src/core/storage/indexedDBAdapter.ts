import { openDB, DBSchema, IDBPDatabase } from 'idb'
import { IStorage, StorageError } from './IStorage'
import { DB_NAME, DB_VERSION, STORES } from '@/lib/constants'

interface AxonDB extends DBSchema {
  subjects: { key: string; value: any }
  tasks: { key: string; value: any }
  sessions: { key: string; value: any }
  goals: { key: string; value: any }
  settings: { key: string; value: any }
  profile: { key: string; value: any }
  users: { key: string; value: any }
  keyvalue: { key: string; value: any }
}

export class IndexedDBAdapter implements IStorage {
  private dbPromise: Promise<IDBPDatabase<AxonDB>> | null = null
  private prefix: string

  constructor(prefix: string = 'axon_') {
    this.prefix = prefix
    if (typeof window !== 'undefined' && 'indexedDB' in window) {
      this.dbPromise = this.initDB()
    }
  }

  private async initDB(): Promise<IDBPDatabase<AxonDB>> {
    return openDB<AxonDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        // Create stores if not exist
        if (!db.objectStoreNames.contains(STORES.SUBJECTS)) {
          db.createObjectStore(STORES.SUBJECTS, { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains(STORES.TASKS)) {
          db.createObjectStore(STORES.TASKS, { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains(STORES.SESSIONS)) {
          db.createObjectStore(STORES.SESSIONS, { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains(STORES.GOALS)) {
          db.createObjectStore(STORES.GOALS, { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
          db.createObjectStore(STORES.SETTINGS, { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains(STORES.PROFILE)) {
          db.createObjectStore(STORES.PROFILE, { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains(STORES.USERS)) {
          db.createObjectStore(STORES.USERS, { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains('keyvalue')) {
          db.createObjectStore('keyvalue')
        }

        // Migration from v1 to v2
        if (oldVersion < 2) {
          if (!db.objectStoreNames.contains(STORES.USERS)) {
            db.createObjectStore(STORES.USERS, { keyPath: 'id' })
          }
        }
      },
      blocked() {
        console.warn('[IndexedDB] upgrade blocked')
      },
      blocking() {
        console.warn('[IndexedDB] blocking')
      }
    })
  }

  private async getDB(): Promise<IDBPDatabase<AxonDB>> {
    if (!this.dbPromise) {
      throw new StorageError('IndexedDB در دسترس نیست', 'BLOCKED')
    }
    return this.dbPromise
  }

  private getFullKey(key: string): string {
    return `${this.prefix}${key}`
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const db = await this.getDB()
      const tx = db.transaction('keyvalue', 'readonly')
      const store = tx.objectStore('keyvalue')
      const value = await store.get(this.getFullKey(key))
      await tx.done
      return (value as T) ?? null
    } catch (error) {
      console.warn(`[IndexedDB] get failed for ${key}:`, error)
      return null
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    try {
      const db = await this.getDB()
      const tx = db.transaction('keyvalue', 'readwrite')
      const store = tx.objectStore('keyvalue')
      await store.put(value, this.getFullKey(key))
      await tx.done
    } catch (error: any) {
      if (error?.name === 'QuotaExceededError') {
        throw new StorageError('حافظه پر شده است', 'QUOTA_EXCEEDED', error)
      }
      throw new StorageError('خطا در ذخیره‌سازی IndexedDB', 'UNKNOWN', error)
    }
  }

  async remove(key: string): Promise<void> {
    try {
      const db = await this.getDB()
      const tx = db.transaction('keyvalue', 'readwrite')
      await tx.objectStore('keyvalue').delete(this.getFullKey(key))
      await tx.done
    } catch (error) {
      console.warn(`[IndexedDB] remove failed for ${key}:`, error)
    }
  }

  async clear(): Promise<void> {
    try {
      const db = await this.getDB()
      const tx = db.transaction('keyvalue', 'readwrite')
      const store = tx.objectStore('keyvalue')
      const keys = await store.getAllKeys()
      for (const k of keys) {
        const keyStr = String(k)
        if (keyStr.startsWith(this.prefix)) {
          await store.delete(k)
        }
      }
      await tx.done
    } catch (error) {
      console.warn('[IndexedDB] clear failed:', error)
    }
  }

  async keys(): Promise<string[]> {
    try {
      const db = await this.getDB()
      const tx = db.transaction('keyvalue', 'readonly')
      const allKeys = await tx.objectStore('keyvalue').getAllKeys()
      await tx.done
      return allKeys
        .map((k) => String(k))
        .filter((k) => k.startsWith(this.prefix))
        .map((k) => k.slice(this.prefix.length))
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

  // Direct store access for repositories
  async getStoreAll<T>(storeName: keyof typeof STORES): Promise<T[]> {
    try {
      const db = await this.getDB()
      const tx = db.transaction(storeName as any, 'readonly')
      const store = tx.objectStore(storeName as any)
      const all = await store.getAll()
      await tx.done
      return all as T[]
    } catch (error) {
      console.warn(`[IndexedDB] getStoreAll failed for ${storeName}:`, error)
      return []
    }
  }

  async getStoreItem<T>(storeName: keyof typeof STORES, id: string): Promise<T | null> {
    try {
      const db = await this.getDB()
      const tx = db.transaction(storeName as any, 'readonly')
      const store = tx.objectStore(storeName as any)
      const item = await store.get(id)
      await tx.done
      return (item as T) ?? null
    } catch {
      return null
    }
  }

  async putStoreItem<T extends { id: string }>(storeName: keyof typeof STORES, item: T): Promise<void> {
    const db = await this.getDB()
    const tx = db.transaction(storeName as any, 'readwrite')
    await tx.objectStore(storeName as any).put(item)
    await tx.done
  }

  async deleteStoreItem(storeName: keyof typeof STORES, id: string): Promise<void> {
    const db = await this.getDB()
    const tx = db.transaction(storeName as any, 'readwrite')
    await tx.objectStore(storeName as any).delete(id)
    await tx.done
  }

  async clearStore(storeName: keyof typeof STORES): Promise<void> {
    const db = await this.getDB()
    const tx = db.transaction(storeName as any, 'readwrite')
    await tx.objectStore(storeName as any).clear()
    await tx.done
  }

  // For users: get by username/email
  async getStoreByIndex<T>(storeName: keyof typeof STORES, indexName: string, value: any): Promise<T | null> {
    try {
      const db = await this.getDB()
      const tx = db.transaction(storeName as any, 'readonly')
      const store = tx.objectStore(storeName as any)
      // Since we don't have indexes, fallback to getAll and filter
      const all = await store.getAll()
      await tx.done
      return (all as any[]).find((item: any) => item[indexName] === value || item.username === value || item.email === value) || null
    } catch {
      return null
    }
  }
}
