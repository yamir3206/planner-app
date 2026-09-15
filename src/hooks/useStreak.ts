import { create } from 'zustand'
import { streakService } from '@/core/services/streakService'

interface StreakStore {
  current: number
  longest: number
  lastDate: string | null
  loading: boolean
  load: () => Promise<void>
}

export const useStreak = create<StreakStore>((set) => ({
  current: 0,
  longest: 0,
  lastDate: null,
  loading: true,
  load: async () => {
    set({ loading: true })
    const result = await streakService.calculateStreak()
    set({ ...result, loading: false })
  }
}))
