import { BaseEntity } from './Base'

export interface Subject extends BaseEntity {
  name: string
  nameEn?: string
  color: string // hex
  icon: string // lucide icon name
  order: number
  isArchived: boolean
}

export function createSubject(partial: Partial<Subject> & { name: string }): Subject {
  const now = new Date().toISOString()
  return {
    id: partial.id || (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`),
    name: partial.name,
    nameEn: partial.nameEn,
    color: partial.color || '#6366F1',
    icon: partial.icon || 'BookOpen',
    order: partial.order ?? 0,
    isArchived: partial.isArchived ?? false,
    createdAt: partial.createdAt || now,
    updatedAt: partial.updatedAt || now
  }
}
