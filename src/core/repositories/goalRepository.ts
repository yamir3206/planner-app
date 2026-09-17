import { BaseRepository } from './baseRepository'
import { Goal } from '../domain/models/Goal'
import { STORES } from '@/lib/constants'

export class GoalRepository extends BaseRepository<Goal> {
  constructor() {
    super(STORES.GOALS as any)
  }

  async getActive(): Promise<Goal[]> {
    const all = await this.getAll()
    return all.filter((g) => !g.isArchived)
  }

  async getByType(type: Goal['type']): Promise<Goal[]> {
    const all = await this.getAll()
    return all.filter((g) => g.type === type && !g.isArchived)
  }

  async getBySubject(subjectId: string): Promise<Goal[]> {
    const all = await this.getAll()
    return all.filter((g) => g.subjectId === subjectId && !g.isArchived)
  }
}

export const goalRepository = new GoalRepository()
