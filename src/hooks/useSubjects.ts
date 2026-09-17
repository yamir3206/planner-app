import { create } from 'zustand'
import { Subject } from '@/core/domain/models/Subject'
import { subjectService, FieldType } from '@/core/services/subjectService'

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

let cachedSubjects: Subject[] | null = null

export const useSubjects = create<SubjectStore>((set, get) => ({
  subjects: cachedSubjects || [],
  loading: !cachedSubjects,
  load: async () => {
    if (cachedSubjects && cachedSubjects.length > 0) {
      set({ subjects: cachedSubjects, loading: false })
      // بک‌گراند آپدیت
      subjectService.getActive().then(s => {
        if (s.length > 0) {
          cachedSubjects = s
          set({ subjects: s })
        }
      }).catch(() => {})
      return
    }
    
    set({ loading: true })
    try {
      const subjects = await subjectService.getActive()
      if (subjects.length === 0) {
        await subjectService.seedDefaults('tajrobi')
        const seeded = await subjectService.getActive()
        cachedSubjects = seeded
        set({ subjects: seeded, loading: false })
      } else {
        cachedSubjects = subjects
        set({ subjects, loading: false })
      }
    } catch {
      set({ loading: false })
    }
  },
  loadWithField: async (field: FieldType) => {
    set({ loading: true })
    try {
      await subjectService.seedDefaults(field)
      const subjects = await subjectService.getActive()
      cachedSubjects = subjects
      set({ subjects, loading: false })
    } catch {
      set({ loading: false })
    }
  },
  add: async (data) => {
    const subject = await subjectService.create(data)
    const updated = [...get().subjects, subject].sort((a,b) => a.order - b.order)
    cachedSubjects = updated
    set({ subjects: updated })
    return subject
  },
  update: async (id, updates) => {
    const updated = await subjectService.update(id, updates)
    if (updated) {
      const list = get().subjects.map(s => s.id === id ? updated : s)
      cachedSubjects = list
      set({ subjects: list })
    }
  },
  remove: async (id) => {
    await subjectService.delete(id)
    const list = get().subjects.filter(s => s.id !== id)
    cachedSubjects = list
    set({ subjects: list })
  },
  getById: (id) => get().subjects.find(s => s.id === id)
}))
