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
      return items.sort((a, b) => {
        try { return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime() }
        catch { return 0 }
      })
    } catch {
      return []
    }
  }

  async getById(id: string): Promise<T | null> {
    try {
      return await this.db.getStoreItem<T>(this.storeName, id)
    } catch {
      return null
    }
  }

  async create(item: T): Promise<T> {
    const now = new Date().toISOString()
    const toSave = {
      ...item,
      createdAt: item.createdAt || now,
      updatedAt: now
    }
    await this.db.putStoreItem(this.storeName, toSave as any)
    return toSave
  }

  async update(id: string, updates: Partial<T>): Promise<T | null> {
    const existing = await this.getById(id)
    if (!existing) return null
    const updated = updateTimestamp({ ...existing, ...updates, id } as T)
    await this.db.putStoreItem(this.storeName, updated as any)
    return updated
  }

  async delete(id: string): Promise<void> {
    await this.db.deleteStoreItem(this.storeName, id)
  }

  async clear(): Promise<void> {
    await this.db.clearStore(this.storeName)
  }

  async count(): Promise<number> {
    try {
      const items = await this.getAll()
      return items.length
    } catch { return 0 }
  }

  async exists(id: string): Promise<boolean> {
    const item = await this.getById(id)
    return item !== null
  }
}
