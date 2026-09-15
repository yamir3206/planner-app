export interface IStorage {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T): Promise<void>
  remove(key: string): Promise<void>
  clear(): Promise<void>
  keys(): Promise<string[]>
  getAll<T>(prefix?: string): Promise<Record<string, T>>
}

export interface IKeyValueStorage {
  getItem<T>(key: string): Promise<T | null>
  setItem<T>(key: string, value: T): Promise<void>
  removeItem(key: string): Promise<void>
  clear(): Promise<void>
  keys(): Promise<string[]>
}

export class StorageError extends Error {
  constructor(
    message: string,
    public code: 'QUOTA_EXCEEDED' | 'NOT_FOUND' | 'BLOCKED' | 'UNKNOWN',
    public originalError?: unknown
  ) {
    super(message)
    this.name = 'StorageError'
  }
}
