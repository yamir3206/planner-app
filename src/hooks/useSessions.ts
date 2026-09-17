import { create } from 'zustand'
import { StudySession } from '@/core/domain/models/Session'
import { sessionService } from '@/core/services/sessionService'

interface SessionStore {
  sessions: StudySession[]
  loading: boolean
  load: () => Promise<void>
  add: (data: Partial<StudySession> & { subjectId: string }) => Promise<StudySession>
  remove: (id: string) => Promise<void>
  getTotalToday: () => number
}

export const useSessions = create<SessionStore>((set, get) => ({
  sessions: [],
  loading: false,
  load: async () => {
    set({ loading: true })
    try {
      const sessions = await sessionService.getAll()
      set({ sessions, loading: false })
    } catch {
      set({ loading: false })
    }
  },
  add: async (data) => {
    const session = await sessionService.create(data)
    set({ sessions: [...get().sessions, session] })
    return session
  },
  remove: async (id) => {
    await sessionService.delete(id)
    set({ sessions: get().sessions.filter(s => s.id !== id) })
  },
  getTotalToday: () => {
    const today = new Date().toISOString().split('T')[0]
    return get().sessions
      .filter(s => {
        try { return new Date(s.startTime).toISOString().split('T')[0] === today && s.status === 'completed' }
        catch { return false }
      })
      .reduce((sum, s) => sum + (s.duration || 0), 0)
  }
}))
