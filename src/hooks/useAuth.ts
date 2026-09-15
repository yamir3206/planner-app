import { create } from 'zustand'
import { authService } from '@/core/services/authService'
import { AuthSession } from '@/core/domain/models/Auth'
import { LocalUser } from '@/core/domain/models/Auth'

interface AuthStore {
  session: AuthSession | null
  user: LocalUser | null
  loading: boolean
  isLoggedIn: boolean
  login: (username: string, password: string) => Promise<void>
  register: (data: { username: string; password: string; displayName: string; email?: string; field?: LocalUser['field'] }) => Promise<void>
  logout: () => Promise<void>
  loadSession: () => Promise<void>
  error: string | null
}

export const useAuth = create<AuthStore>((set, get) => ({
  session: null,
  user: null,
  loading: true,
  isLoggedIn: false,
  error: null,

  loadSession: async () => {
    set({ loading: true })
    try {
      const session = authService.getCurrentSession()
      if (session) {
        const user = await authService.getCurrentUser()
        set({ session, user, isLoggedIn: true, loading: false })
      } else {
        set({ session: null, user: null, isLoggedIn: false, loading: false })
      }
    } catch (e) {
      set({ loading: false, isLoggedIn: false })
    }
  },

  login: async (username: string, password: string) => {
    set({ loading: true, error: null })
    try {
      const session = await authService.login(username, password)
      const user = await authService.getCurrentUser()
      set({ session, user, isLoggedIn: true, loading: false, error: null })
    } catch (e: any) {
      set({ loading: false, error: e.message })
      throw e
    }
  },

  register: async (data) => {
    set({ loading: true, error: null })
    try {
      await authService.register(data)
      // Auto login after register
      const session = await authService.login(data.username, data.password)
      const user = await authService.getCurrentUser()
      set({ session, user, isLoggedIn: true, loading: false, error: null })
    } catch (e: any) {
      set({ loading: false, error: e.message })
      throw e
    }
  },

  logout: async () => {
    await authService.logout()
    set({ session: null, user: null, isLoggedIn: false })
  }
}))
