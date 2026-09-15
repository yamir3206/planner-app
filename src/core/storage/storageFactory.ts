import { IStorage } from './IStorage'
import { IndexedDBAdapter } from './indexedDBAdapter'
import { LocalStorageAdapter } from './localStorageAdapter'
import { MemoryAdapter } from './memoryAdapter'

export type StorageType = 'indexeddb' | 'localstorage' | 'memory' | 'auto'

class StorageFactory {
  private instance: IStorage | null = null
  private type: StorageType = 'auto'

  setType(type: StorageType) {
    this.type = type
    this.instance = null
  }

  getStorage(): IStorage {
    if (this.instance) return this.instance

    if (this.type === 'memory') {
      this.instance = new MemoryAdapter()
      return this.instance
    }

    if (this.type === 'localstorage') {
      this.instance = new LocalStorageAdapter()
      return this.instance
    }

    if (this.type === 'indexeddb') {
      this.instance = new IndexedDBAdapter()
      return this.instance
    }

    // auto: try indexedDB, fallback to localStorage, fallback to memory
    if (typeof window !== 'undefined' && 'indexedDB' in window) {
      try {
        this.instance = new IndexedDBAdapter()
        return this.instance
      } catch (e) {
        console.warn('[StorageFactory] IndexedDB failed, fallback to localStorage', e)
      }
    }

    if (typeof window !== 'undefined' && 'localStorage' in window) {
      try {
        this.instance = new LocalStorageAdapter()
        return this.instance
      } catch (e) {
        console.warn('[StorageFactory] localStorage failed, fallback to memory', e)
      }
    }

    this.instance = new MemoryAdapter()
    return this.instance
  }

  // For repositories that need direct IndexedDB access
  getIndexedDBAdapter(): IndexedDBAdapter {
    if (this.instance instanceof IndexedDBAdapter) {
      return this.instance
    }
    // Create new one if current is not IndexedDB
    return new IndexedDBAdapter()
  }
}

export const storageFactory = new StorageFactory()

// Convenience exports
export const storage: IStorage = storageFactory.getStorage()
