import { BaseRepository } from './baseRepository'
import { StudySession } from '../domain/models/Session'
import { STORES } from '@/lib/constants'

export class SessionRepository extends BaseRepository<StudySession> {
  constructor() {
    super(STORES.SESSIONS as any)
  }

  async getBySubject(subjectId: string): Promise<StudySession[]> {
    const all = await this.getAll()
    return all.filter((s) => s.subjectId === subjectId)
  }

  async getByTask(taskId: string): Promise<StudySession[]> {
    const all = await this.getAll()
    return all.filter((s) => s.taskId === taskId)
  }

  async getByDate(date: string): Promise<StudySession[]> {
    const all = await this.getAll()
    return all.filter((s) => {
      const sessionDate = new Date(s.startTime).toISOString().split('T')[0]
      return sessionDate === date
    })
  }

  async getByDateRange(start: string, end: string): Promise<StudySession[]> {
    const all = await this.getAll()
    return all.filter((s) => {
      const sessionDate = new Date(s.startTime).toISOString().split('T')[0]
      return sessionDate >= start && sessionDate <= end
    })
  }

  async getActive(): Promise<StudySession | null> {
    const all = await this.getAll()
    return all.find((s) => s.status === 'active' || s.status === 'paused') || null
  }

  async getTotalDurationByDate(date: string): Promise<number> {
    const sessions = await this.getByDate(date)
    return sessions.filter((s) => s.status === 'completed').reduce((sum, s) => sum + s.duration, 0)
  }

  async getTotalDurationBySubject(subjectId: string): Promise<number> {
    const sessions = await this.getBySubject(subjectId)
    return sessions.filter((s) => s.status === 'completed').reduce((sum, s) => sum + s.duration, 0)
  }
}

export const sessionRepository = new SessionRepository()
