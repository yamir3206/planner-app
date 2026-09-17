import * as React from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AppSettings, createDefaultSettings } from '@/core/domain/models/Settings'
import { settingsRepository } from '@/core/repositories'
import { THEMES, ThemeId } from '@/lib/constants'

type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeState {
  mode: ThemeMode
  colorTheme: ThemeId
  setMode: (mode: ThemeMode) => void
  setColorTheme: (theme: ThemeId) => void
}

function applyThemeToDOM(colorTheme: string, mode: ThemeMode) {
  try {
    const root = document.documentElement
    // حذف سریع فقط کلاس‌های تم، نه همه
    const toRemove: string[] = []
    root.classList.forEach(c => {
      if (c.startsWith('theme-') || c === 'light' || c === 'dark') toRemove.push(c)
    })
    toRemove.forEach(c => root.classList.remove(c))
    
    root.classList.add(`theme-${colorTheme}`)
    root.setAttribute('data-theme', colorTheme)
    
    if (mode === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.add(isDark ? 'dark' : 'light')
    } else {
      root.classList.add(mode)
    }
    
    try {
      localStorage.setItem('axon_theme_color', colorTheme)
      localStorage.setItem('axon_theme_mode', mode)
    } catch {}
  } catch {}
}

// اعمال فوری از localStorage
try {
  const c = localStorage.getItem('axon_theme_color') || 'axon'
  const m = (localStorage.getItem('axon_theme_mode') as ThemeMode) || 'system'
  if (typeof document !== 'undefined' && document.documentElement) {
    applyThemeToDOM(c, m)
  }
} catch {}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'system' as ThemeMode,
      colorTheme: 'axon' as ThemeId,
      setMode: (mode) => {
        set({ mode })
        applyThemeToDOM(get().colorTheme, mode)
      },
      setColorTheme: (colorTheme) => {
        set({ colorTheme })
        applyThemeToDOM(colorTheme, get().mode)
      }
    }),
    { 
      name: 'axon_theme',
      onRehydrateStorage: () => (state) => {
        if (state) {
          try { applyThemeToDOM(state.colorTheme, state.mode) } catch {}
        }
      }
    }
  )
)

export const useThemeModeStore = useThemeStore

interface SettingsState {
  settings: AppSettings
  loading: boolean
  loadSettings: () => Promise<void>
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: createDefaultSettings(),
  loading: false,
  loadSettings: async () => {
    try {
      const s = await settingsRepository.getSettings()
      set({ settings: s, loading: false })
      const current = useThemeStore.getState()
      // فقط اگر متفاوت است اعمال کن تا رندر اضافه نشود
      if (s.theme !== current.mode) current.setMode(s.theme as ThemeMode)
      if ((s as any).colorTheme !== current.colorTheme) {
        current.setColorTheme((s as any).colorTheme as ThemeId)
      }
    } catch {
      set({ loading: false })
    }
  },
  updateSettings: async (updates) => {
    const current = get().settings
    const updated = { ...current, ...updates, updatedAt: new Date().toISOString() }
    set({ settings: updated })
    settingsRepository.updateSettings(updates).catch(() => {})
  }
}))

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { mode, colorTheme } = useThemeStore()

  React.useEffect(() => {
    applyThemeToDOM(colorTheme, mode)
  }, [mode, colorTheme])

  React.useEffect(() => {
    if (mode !== 'system') return
    try {
      const media = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = () => applyThemeToDOM(colorTheme, 'system')
      media.addEventListener('change', handler)
      return () => media.removeEventListener('change', handler)
    } catch { return }
  }, [mode, colorTheme])

  return <>{children}</>
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const loadSettings = useSettingsStore((s) => s.loadSettings)

  React.useEffect(() => {
    // بدون تاخیر - فوری لود کن
    loadSettings()
  }, [loadSettings])

  return <ThemeProvider>{children}</ThemeProvider>
}
