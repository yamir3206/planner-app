import { BaseRepository } from './baseRepository'
import { AppSettings, createDefaultSettings } from '../domain/models/Settings'
import { STORES } from '@/lib/constants'

export class SettingsRepository extends BaseRepository<AppSettings> {
  constructor() {
    super(STORES.SETTINGS as any)
  }

  async getSettings(): Promise<AppSettings> {
    const all = await this.getAll()
    if (all.length === 0) {
      const defaults = createDefaultSettings()
      await this.create(defaults)
      return defaults
    }
    return all[0]
  }

  async updateSettings(updates: Partial<AppSettings>): Promise<AppSettings> {
    const current = await this.getSettings()
    const updated = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString()
    }
    await this.db.putStoreItem(this.storeName, updated as any)
    return updated
  }
}

export const settingsRepository = new SettingsRepository()
