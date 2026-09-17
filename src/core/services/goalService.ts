import { goalRepository } from '../repositories'
import { Goal, createGoal } from '../domain/models/Goal'

export class GoalService {
  async getAll(): Promise<Goal[]> {
    return goalRepository.getAll()
  }

  async getActive(): Promise<Goal[]> {
    return goalRepository.getActive()
  }

  async create(data: Partial<Goal> & { title: string; targetValue: number }): Promise<Goal> {
    const goal = createGoal(data)
    return goalRepository.create(goal)
  }

  async update(id: string, updates: Partial<Goal>): Promise<Goal | null> {
    return goalRepository.update(id, updates)
  }

  async delete(id: string): Promise<void> {
    return goalRepository.delete(id)
  }

  calculateProgress(goal: Goal): number {
    if (goal.targetValue === 0) return 0
    return Math.min(100, (goal.currentValue / goal.targetValue) * 100)
  }
}

export const goalService = new GoalService()
