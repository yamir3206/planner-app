import { BaseEntity } from './Base'
import { SessionType, SessionStatus } from '../enums/SessionType'

export interface TimelineEvent {
  action: 'start' | 'pause' | 'resume' | 'stop'
  at: string // ISO
}

export interface StudySession extends BaseEntity {
  taskId?: string
  subjectId: string
  startTime: string // ISO
  endTime?: string // ISO
  duration: number // seconds actual (elapsed - paused)
  pausedDuration: number // seconds
  type: SessionType
  status: SessionStatus
  notes?: string
  timeline: TimelineEvent[]
}

export function createSession(partial: Partial<StudySession> & { subjectId: string }): StudySession {
  const now = new Date().toISOString()
  return {
    id: partial.id || (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`),
    taskId: partial.taskId,
    subjectId: partial.subjectId,
    startTime: partial.startTime || now,
    endTime: partial.endTime,
    duration: partial.duration ?? 0,
    pausedDuration: partial.pausedDuration ?? 0,
    type: partial.type || 'free',
    status: partial.status || 'active',
    notes: partial.notes,
    timeline: partial.timeline || [{ action: 'start', at: partial.startTime || now }],
    createdAt: partial.createdAt || now,
    updatedAt: partial.updatedAt || now
  }
}
