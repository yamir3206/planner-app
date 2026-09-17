import { BaseRepository } from './baseRepository'
import { StudyTask } from '../domain/models/Task'
import { STORES } from '@/lib/constants'

export class TaskRepository extends BaseRepository<StudyTask> {
  constructor() {
    super(STORES.TASKS as any)
  }

  async getByDate(date: string): Promise<StudyTask[]> {
    const all = await this.getAll()
    return all.filter((t) => t.date === date).sort((a, b) => {
      if (a.startTime && b.startTime) return a.startTime.localeCompare(b.startTime)
      return 0
    })
  }

  async getBySubject(subjectId: string): Promise<StudyTask[]> {
    const all = await this.getAll()
    return all.filter((t) => t.subjectId === subjectId)
  }

  async getByStatus(status: StudyTask['status']): Promise<StudyTask[]> {
    const all = await this.getAll()
    return all.filter((t) => t.status === status)
  }

  async getByDateRange(start: string, end: string): Promise<StudyTask[]> {
    const all = await this.getAll()
    return all.filter((t) => t.date >= start && t.date <= end)
  }

  async getToday(): Promise<StudyTask[]> {
    const today = new Date().toISOString().split('T')[0]
    return this.getByDate(today)
  }

  async getUpcoming(days: number = 7): Promise<StudyTask[]> {
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    const future = new Date()
    future.setDate(today.getDate() + days)
    const futureStr = future.toISOString().split('T')[0]
    return this.getByDateRange(todayStr, futureStr)
  }
}

export const taskRepository = new TaskRepository()
