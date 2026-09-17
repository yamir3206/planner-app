import { BaseRepository } from './baseRepository'
import { UserProfile, createUserProfile } from '../domain/models/UserProfile'
import { STORES } from '@/lib/constants'

export class ProfileRepository extends BaseRepository<UserProfile> {
  constructor() {
    super(STORES.PROFILE as any)
  }

  async getProfile(): Promise<UserProfile | null> {
    const all = await this.getAll()
    return all[0] || null
  }

  async saveProfile(profile: Partial<UserProfile> & { name: string }): Promise<UserProfile> {
    const existing = await this.getProfile()
    if (existing) {
      const updated = {
        ...existing,
        ...profile,
        updatedAt: new Date().toISOString()
      }
      await this.db.putStoreItem(this.storeName, updated as any)
      return updated
    } else {
      const newProfile = createUserProfile(profile)
      await this.create(newProfile)
      return newProfile
    }
  }
}

export const profileRepository = new ProfileRepository()
