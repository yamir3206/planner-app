import { BaseEntity } from './Base'
import { GoalType, GoalUnit } from '../enums/GoalType'

export interface Goal extends BaseEntity {
  title: string
  type: GoalType
  targetValue: number
  currentValue: number
  unit: GoalUnit
  subjectId?: string
  deadline?: string // YYYY-MM-DD
  period?: {
    start: string
    end: string
  }
  isArchived: boolean
}

export function createGoal(partial: Partial<Goal> & { title: string; targetValue: number }): Goal {
  const now = new Date().toISOString()
  return {
    id: partial.id || (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`),
    title: partial.title,
    type: partial.type || 'daily',
    targetValue: partial.targetValue,
    currentValue: partial.currentValue ?? 0,
    unit: partial.unit || 'minutes',
    subjectId: partial.subjectId,
    deadline: partial.deadline,
    period: partial.period,
    isArchived: partial.isArchived ?? false,
    createdAt: partial.createdAt || now,
    updatedAt: partial.updatedAt || now
  }
}
