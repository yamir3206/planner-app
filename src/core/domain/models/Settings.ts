import { BaseEntity } from './Base'
import { ThemeId } from '@/lib/constants'

export interface AppSettings extends BaseEntity {
  theme: 'light' | 'dark' | 'system'
  colorTheme: ThemeId
  persianNumbers: boolean
  language: 'fa'
  dailyTargetMinutes: number
  pomodoro: {
    work: number
    shortBreak: number
    longBreak: number
    longBreakInterval: number
  }
  notifications: boolean
  syncEnabled: boolean
  weekStartsOn: 0 | 1 | 6 // 0=Sunday, 1=Monday, 6=Saturday (Iran)
}

export function createDefaultSettings(): AppSettings {
  const now = new Date().toISOString()
  return {
    id: 'settings',
    theme: 'system',
    colorTheme: 'axon',
    persianNumbers: true,
    language: 'fa',
    dailyTargetMinutes: 360,
    pomodoro: {
      work: 25,
      shortBreak: 5,
      longBreak: 15,
      longBreakInterval: 4
    },
    notifications: false,
    syncEnabled: false,
    weekStartsOn: 6, // شنبه
    createdAt: now,
    updatedAt: now
  }
}
