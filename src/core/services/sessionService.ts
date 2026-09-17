import { sessionRepository } from '../repositories'
import { StudySession, createSession } from '../domain/models/Session'

export class SessionService {
  async getAll(): Promise<StudySession[]> {
    return sessionRepository.getAll()
  }

  async getByDate(date: string): Promise<StudySession[]> {
    return sessionRepository.getByDate(date)
  }

  async getBySubject(subjectId: string): Promise<StudySession[]> {
    return sessionRepository.getBySubject(subjectId)
  }

  async create(data: Partial<StudySession> & { subjectId: string }): Promise<StudySession> {
    const session = createSession(data)
    return sessionRepository.create(session)
  }

  async update(id: string, updates: Partial<StudySession>): Promise<StudySession | null> {
    return sessionRepository.update(id, updates)
  }

  async delete(id: string): Promise<void> {
    return sessionRepository.delete(id)
  }

  async getTotalDurationByDate(date: string): Promise<number> {
    return sessionRepository.getTotalDurationByDate(date)
  }
}

export const sessionService = new SessionService()
