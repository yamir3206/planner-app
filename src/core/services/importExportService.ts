import { z } from 'zod'
import { subjectRepository, taskRepository, sessionRepository, goalRepository, settingsRepository, profileRepository, authRepository } from '../repositories'

const exportSchema = z.object({
  version: z.string(),
  exportedAt: z.string(),
  data: z.object({
    subjects: z.array(z.any()),
    tasks: z.array(z.any()),
    sessions: z.array(z.any()),
    goals: z.array(z.any()),
    settings: z.any().optional(),
    profile: z.any().optional(),
    users: z.array(z.any()).optional()
  })
})

export class ImportExportService {
  async exportData(): Promise<string> {
    const [subjects, tasks, sessions, goals, settingsArr, profileArr, users] = await Promise.all([
      subjectRepository.getAll(),
      taskRepository.getAll(),
      sessionRepository.getAll(),
      goalRepository.getAll(),
      settingsRepository.getAll(),
      profileRepository.getAll(),
      authRepository.getAll()
    ])
    return JSON.stringify({ version: '1.2.1', exportedAt: new Date().toISOString(), data: { subjects, tasks, sessions, goals, settings: settingsArr[0], profile: profileArr[0], users } }, null, 2)
  }

  async importData(jsonString: string): Promise<{ success: boolean; errors?: string[] }> {
    try {
      const parsed = JSON.parse(jsonString)
      const result = exportSchema.safeParse(parsed)
      if (!result.success) return { success: false, errors: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`) }
      const { data } = result.data
      try {
        if (data.users && Array.isArray(data.users)) {
          for (const user of data.users) {
            try {
              const existing = await authRepository.getById(user.id)
              if (!existing) {
                const byUsername = await authRepository.getByUsername(user.username)
                if (!byUsername) await authRepository.create(user)
              } else await authRepository.create(user)
            } catch {}
          }
        }
        for (const subject of data.subjects) { try { const ex = await subjectRepository.getById(subject.id); if (!ex) await subjectRepository.create(subject) } catch {} }
        for (const task of data.tasks) { try { const ex = await taskRepository.getById(task.id); if (!ex) await taskRepository.create(task) } catch {} }
        for (const session of data.sessions) { try { const ex = await sessionRepository.getById(session.id); if (!ex) await sessionRepository.create(session) } catch {} }
        for (const goal of data.goals) { try { const ex = await goalRepository.getById(goal.id); if (!ex) await goalRepository.create(goal) } catch {} }
        if (data.settings) { try { await settingsRepository.create(data.settings) } catch {} }
        if (data.profile) { try { await profileRepository.create(data.profile) } catch {} }
      } catch (e) { return { success: false, errors: ['خطا در ذخیره داده‌ها: ' + (e as Error).message] } }
      return { success: true }
    } catch (e) { return { success: false, errors: ['فایل JSON نامعتبر است: ' + (e as Error).message] } }
  }

  async validateImport(jsonString: string): Promise<{ valid: boolean; errors?: string[]; data?: any }> {
    try {
      const parsed = JSON.parse(jsonString)
      const result = exportSchema.safeParse(parsed)
      if (!result.success) return { valid: false, errors: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`) }
      return { valid: true, data: result.data }
    } catch (e) { return { valid: false, errors: ['JSON نامعتبر: ' + (e as Error).message] } }
  }

  async getExportSummary(): Promise<{ subjects: number; tasks: number; sessions: number; goals: number; users: number }> {
    const [subjects, tasks, sessions, goals, users] = await Promise.all([subjectRepository.getAll(), taskRepository.getAll(), sessionRepository.getAll(), goalRepository.getAll(), authRepository.getAll()])
    return { subjects: subjects.length, tasks: tasks.length, sessions: sessions.length, goals: goals.length, users: users.length }
  }
}

export const importExportService = new ImportExportService()
