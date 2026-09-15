import * as React from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AppSettings, createDefaultSettings } from '@/core/domain/models/Settings'
import { settingsRepository } from '@/core/repositories'
import { ThemeId } from '@/lib/constants'

// Theme store - light/dark + color theme
type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeState {
  mode: ThemeMode
  colorTheme: ThemeId
  setMode: (mode: ThemeMode) => void
  setColorTheme: (theme: ThemeId) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'system',
      colorTheme: 'axon',
      setMode: (mode) => set({ mode }),
      setColorTheme: (colorTheme) => set({ colorTheme })
    }),
    { name: 'axon_theme' }
  )
)

// For backward compatibility
export const useThemeModeStore = useThemeStore

// Settings store
interface SettingsState {
  settings: AppSettings
  loading: boolean
  loadSettings: () => Promise<void>
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: createDefaultSettings(),
  loading: true,
  loadSettings: async () => {
    try {
      const s = await settingsRepository.getSettings()
      set({ settings: s, loading: false })
      // Sync theme stores
      useThemeStore.getState().setMode(s.theme as ThemeMode)
      if ((s as any).colorTheme) {
        useThemeStore.getState().setColorTheme((s as any).colorTheme)
      }
    } catch (e) {
      console.error('Failed to load settings', e)
      set({ loading: false })
    }
  },
  updateSettings: async (updates) => {
    const current = get().settings
    const updated = { ...current, ...updates, updatedAt: new Date().toISOString() }
    set({ settings: updated })
    try {
      await settingsRepository.updateSettings(updates)
    } catch (e) {
      console.error('Failed to save settings', e)
    }
  }
}))

// Theme provider component - handles both mode and color theme
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { mode, colorTheme } = useThemeStore()

  React.useEffect(() => {
    const root = window.document.documentElement
    
    // Remove all theme classes
    root.classList.remove('light', 'dark')
    root.classList.remove('theme-axon', 'theme-forest', 'theme-ocean', 'theme-sunset', 'theme-lavender', 'theme-midnight', 'theme-rose', 'theme-emerald')
    
    // Add color theme
    if (colorTheme !== 'axon') {
      root.classList.add(`theme-${colorTheme}`)
    } else {
      root.classList.add('theme-axon')
    }

    // Add mode
    if (mode === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      root.classList.add(systemTheme)
    } else {
      root.classList.add(mode)
    }
  }, [mode, colorTheme])

  // Listen to system changes
  React.useEffect(() => {
    if (mode !== 'system') return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      const root = window.document.documentElement
      root.classList.remove('light', 'dark')
      root.classList.add(media.matches ? 'dark' : 'light')
    }
    media.addEventListener('change', handler)
    return () => media.removeEventListener('change', handler)
  }, [mode])

  return <>{children}</>
}

// App providers wrapper
export function AppProviders({ children }: { children: React.ReactNode }) {
  const loadSettings = useSettingsStore((s) => s.loadSettings)

  React.useEffect(() => {
    loadSettings()
  }, [loadSettings])

  return <ThemeProvider>{children}</ThemeProvider>
}
