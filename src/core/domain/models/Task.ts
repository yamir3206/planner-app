import { BaseEntity } from './Base'
import { TaskType, TaskStatus, Priority } from '../enums'

export interface StudyTask extends BaseEntity {
  subjectId: string
  topic: string
  type: TaskType
  date: string // YYYY-MM-DD local
  startTime?: string // HH:mm
  endTime?: string // HH:mm
  plannedDuration: number // minutes
  actualDuration?: number // minutes aggregated from sessions
  pages?: {
    from?: number
    to?: number
  }
  questions?: {
    target: number
    done?: number
  }
  priority: Priority
  status: TaskStatus
  notes?: string
}

export function createTask(partial: Partial<StudyTask> & { subjectId: string; topic: string }): StudyTask {
  const now = new Date().toISOString()
  const today = new Date().toISOString().split('T')[0]
  return {
    id: partial.id || (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`),
    subjectId: partial.subjectId,
    topic: partial.topic,
    type: partial.type || 'study',
    date: partial.date || today,
    startTime: partial.startTime,
    endTime: partial.endTime,
    plannedDuration: partial.plannedDuration ?? 60,
    actualDuration: partial.actualDuration,
    pages: partial.pages,
    questions: partial.questions,
    priority: partial.priority || 'medium',
    status: partial.status || 'todo',
    notes: partial.notes,
    createdAt: partial.createdAt || now,
    updatedAt: partial.updatedAt || now
  }
}
