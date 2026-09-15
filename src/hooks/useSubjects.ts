import { create } from 'zustand'
import { Subject } from '@/core/domain/models/Subject'
import { subjectService, FieldType } from '@/core/services/subjectService'
import { profileRepository } from '@/core/repositories'

interface SubjectStore {
  subjects: Subject[]
  loading: boolean
  load: () => Promise<void>
  loadWithField: (field: FieldType) => Promise<void>
  add: (data: Partial<Subject> & { name: string }) => Promise<Subject>
  update: (id: string, updates: Partial<Subject>) => Promise<void>
  remove: (id: string) => Promise<void>
  getById: (id: string) => Subject | undefined
}

export const useSubjects = create<SubjectStore>((set, get) => ({
  subjects: [],
  loading: true,
  load: async () => {
    set({ loading: true })
    try {
      // Try to get field from profile
      const profile = await profileRepository.getProfile()
      const field = (profile?.field as FieldType) || 'tajrobi'
      await subjectService.seedDefaults(field)
      const subjects = await subjectService.getActive()
      set({ subjects, loading: false })
    } catch (e) {
      console.error(e)
      set({ loading: false })
    }
  },
  loadWithField: async (field: FieldType) => {
    set({ loading: true })
    try {
      await subjectService.seedDefaults(field)
      const subjects = await subjectService.getActive()
      set({ subjects, loading: false })
    } catch (e) {
      console.error(e)
      set({ loading: false })
    }
  },
  add: async (data) => {
    const subject = await subjectService.create(data)
    set({ subjects: [...get().subjects, subject].sort((a,b) => a.order - b.order) })
    return subject
  },
  update: async (id, updates) => {
    const updated = await subjectService.update(id, updates)
    if (updated) {
      set({ subjects: get().subjects.map(s => s.id === id ? updated : s) })
    }
  },
  remove: async (id) => {
    await subjectService.delete(id)
    set({ subjects: get().subjects.filter(s => s.id !== id) })
  },
  getById: (id) => get().subjects.find(s => s.id === id)
}))
