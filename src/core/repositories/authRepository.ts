import { BaseRepository } from './baseRepository'
import { LocalUser } from '../domain/models/Auth'
import { STORES } from '@/lib/constants'

export class AuthRepository extends BaseRepository<LocalUser> {
  constructor() {
    super(STORES.USERS as any)
  }

  async getByUsername(username: string): Promise<LocalUser | null> {
    const all = await this.getAll()
    return all.find(u => u.username.toLowerCase() === username.toLowerCase()) || null
  }

  async getByEmail(email: string): Promise<LocalUser | null> {
    if (!email) return null
    const all = await this.getAll()
    return all.find(u => u.email?.toLowerCase() === email.toLowerCase()) || null
  }

  async exists(username: string): Promise<boolean> {
    const user = await this.getByUsername(username)
    return !!user
  }
}

export const authRepository = new AuthRepository()
