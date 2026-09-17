import { create } from 'zustand'
import { Goal } from '@/core/domain/models/Goal'
import { goalService } from '@/core/services/goalService'

interface GoalStore {
  goals: Goal[]
  loading: boolean
  load: () => Promise<void>
  add: (data: Partial<Goal> & { title: string; targetValue: number }) => Promise<Goal>
  update: (id: string, updates: Partial<Goal>) => Promise<void>
  remove: (id: string) => Promise<void>
}

export const useGoals = create<GoalStore>((set, get) => ({
  goals: [],
  loading: false,
  load: async () => {
    set({ loading: true })
    try {
      const goals = await goalService.getActive()
      set({ goals, loading: false })
    } catch {
      set({ loading: false })
    }
  },
  add: async (data) => {
    const goal = await goalService.create(data)
    set({ goals: [...get().goals, goal] })
    return goal
  },
  update: async (id, updates) => {
    const updated = await goalService.update(id, updates)
    if (updated) set({ goals: get().goals.map(g => g.id === id ? updated : g) })
  },
  remove: async (id) => {
    await goalService.delete(id)
    set({ goals: get().goals.filter(g => g.id !== id) })
  }
}))
