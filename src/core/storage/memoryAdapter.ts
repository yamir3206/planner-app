import { IStorage } from './IStorage'

export class MemoryAdapter implements IStorage {
  private store: Map<string, any> = new Map()
  private prefix: string

  constructor(prefix: string = 'axon_') {
    this.prefix = prefix
  }

  private getFullKey(key: string): string {
    return `${this.prefix}${key}`
  }

  async get<T>(key: string): Promise<T | null> {
    return this.store.get(this.getFullKey(key)) ?? null
  }

  async set<T>(key: string, value: T): Promise<void> {
    this.store.set(this.getFullKey(key), value)
  }

  async remove(key: string): Promise<void> {
    this.store.delete(this.getFullKey(key))
  }

  async clear(): Promise<void> {
    const keys = await this.keys()
    for (const key of keys) {
      this.store.delete(this.getFullKey(key))
    }
  }

  async keys(): Promise<string[]> {
    const result: string[] = []
    for (const key of this.store.keys()) {
      if (key.startsWith(this.prefix)) {
        result.push(key.slice(this.prefix.length))
      }
    }
    return result
  }

  async getAll<T>(prefix?: string): Promise<Record<string, T>> {
    const result: Record<string, T> = {}
    for (const [fullKey, value] of this.store.entries()) {
      if (!fullKey.startsWith(this.prefix)) continue
      const key = fullKey.slice(this.prefix.length)
      if (prefix && !key.startsWith(prefix)) continue
      result[key] = value
    }
    return result
  }
}
