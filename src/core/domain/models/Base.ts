export interface BaseEntity {
  id: string
  createdAt: string // ISO 8601 UTC
  updatedAt: string // ISO 8601 UTC
}

export function createBaseEntity(): Pick<BaseEntity, 'id' | 'createdAt' | 'updatedAt'> {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    createdAt: now,
    updatedAt: now
  }
}

export function updateTimestamp<T extends BaseEntity>(entity: T): T {
  return {
    ...entity,
    updatedAt: new Date().toISOString()
  }
}
