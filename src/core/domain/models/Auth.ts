import { BaseEntity } from './Base'

export interface LocalUser extends BaseEntity {
  username: string
  email?: string
  passwordHash: string // hex of derived bits
  salt: string // hex
  displayName: string
  avatar?: string
  field?: 'riazi' | 'tajrobi' | 'ensani' | 'honar' | 'zaban' | 'other'
}

export interface AuthSession {
  userId: string
  username: string
  displayName: string
  loggedInAt: string // ISO
  expiresAt?: string
}

export function createLocalUser(partial: Partial<LocalUser> & { username: string; passwordHash: string; salt: string; displayName: string }): LocalUser {
  const now = new Date().toISOString()
  return {
    id: partial.id || (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`),
    username: partial.username.toLowerCase().trim(),
    email: partial.email?.toLowerCase().trim(),
    passwordHash: partial.passwordHash,
    salt: partial.salt,
    displayName: partial.displayName,
    avatar: partial.avatar,
    field: partial.field || 'tajrobi',
    createdAt: partial.createdAt || now,
    updatedAt: partial.updatedAt || now
  }
}
