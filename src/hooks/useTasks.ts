import { create } from 'zustand'
import { StudyTask } from '@/core/domain/models/Task'
import { taskService } from '@/core/services/taskService'

interface TaskStore {
  tasks: StudyTask[]
  loading: boolean
  load: () => Promise<void>
  loadByDate: (date: string) => Promise<StudyTask[]>
  add: (data: Partial<StudyTask> & { subjectId: string; topic: string }) => Promise<StudyTask>
  update: (id: string, updates: Partial<StudyTask>) => Promise<void>
  remove: (id: string) => Promise<void>
  toggleStatus: (id: string) => Promise<void>
  getByDate: (date: string) => StudyTask[]
}

export const useTasks = create<TaskStore>((set, get) => ({
  tasks: [],
  loading: false,
  load: async () => {
    set({ loading: true })
    try {
      const tasks = await taskService.getAll()
      set({ tasks, loading: false })
    } catch {
      set({ loading: false })
    }
  },
  loadByDate: async (date: string) => {
    try { return await taskService.getByDate(date) } catch { return [] }
  },
  add: async (data) => {
    const task = await taskService.create(data)
    set({ tasks: [...get().tasks, task] })
    return task
  },
  update: async (id, updates) => {
    const updated = await taskService.update(id, updates)
    if (updated) set({ tasks: get().tasks.map(t => t.id === id ? updated : t) })
  },
  remove: async (id) => {
    await taskService.delete(id)
    set({ tasks: get().tasks.filter(t => t.id !== id) })
  },
  toggleStatus: async (id) => {
    const updated = await taskService.toggleStatus(id)
    if (updated) set({ tasks: get().tasks.map(t => t.id === id ? updated : t) })
  },
  getByDate: (date: string) => get().tasks.filter(t => t.date === date)
}))
