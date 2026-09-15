import { BaseEntity, updateTimestamp } from '../domain/models/Base'
import { IndexedDBAdapter } from '../storage/indexedDBAdapter'
import { storageFactory } from '../storage/storageFactory'
import { STORES } from '@/lib/constants'

export abstract class BaseRepository<T extends BaseEntity> {
  protected db: IndexedDBAdapter
  protected storeName: keyof typeof STORES

  constructor(storeName: keyof typeof STORES) {
    this.storeName = storeName
    this.db = storageFactory.getIndexedDBAdapter()
  }

  async getAll(): Promise<T[]> {
    try {
      const items = await this.db.getStoreAll<T>(this.storeName)
      return items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    } catch (error) {
      console.error(`[${this.storeName}] getAll failed:`, error)
      return []
    }
  }

  async getById(id: string): Promise<T | null> {
    try {
      return await this.db.getStoreItem<T>(this.storeName, id)
    } catch (error) {
      console.error(`[${this.storeName}] getById failed:`, error)
      return null
    }
  }

  async create(item: T): Promise<T> {
    try {
      const now = new Date().toISOString()
      const toSave = {
        ...item,
        createdAt: item.createdAt || now,
        updatedAt: now
      }
      await this.db.putStoreItem(this.storeName, toSave as any)
      return toSave
    } catch (error) {
      console.error(`[${this.storeName}] create failed:`, error)
      throw error
    }
  }

  async update(id: string, updates: Partial<T>): Promise<T | null> {
    try {
      const existing = await this.getById(id)
      if (!existing) return null
      const updated = updateTimestamp({
        ...existing,
        ...updates,
        id
      } as T)
      await this.db.putStoreItem(this.storeName, updated as any)
      return updated
    } catch (error) {
      console.error(`[${this.storeName}] update failed:`, error)
      throw error
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.db.deleteStoreItem(this.storeName, id)
    } catch (error) {
      console.error(`[${this.storeName}] delete failed:`, error)
      throw error
    }
  }

  async clear(): Promise<void> {
    try {
      await this.db.clearStore(this.storeName)
    } catch (error) {
      console.error(`[${this.storeName}] clear failed:`, error)
      throw error
    }
  }

  async count(): Promise<number> {
    const items = await this.getAll()
    return items.length
  }

  async exists(id: string): Promise<boolean> {
    const item = await this.getById(id)
    return item !== null
  }
}
