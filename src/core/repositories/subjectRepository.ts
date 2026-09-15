import { BaseRepository } from './baseRepository'
import { Subject } from '../domain/models/Subject'
import { STORES } from '@/lib/constants'

export class SubjectRepository extends BaseRepository<Subject> {
  constructor() {
    super(STORES.SUBJECTS as any)
  }

  async getActive(): Promise<Subject[]> {
    const all = await this.getAll()
    return all.filter((s) => !s.isArchived).sort((a, b) => a.order - b.order)
  }

  async getArchived(): Promise<Subject[]> {
    const all = await this.getAll()
    return all.filter((s) => s.isArchived)
  }

  async reorder(ids: string[]): Promise<void> {
    for (let i = 0; i < ids.length; i++) {
      await this.update(ids[i], { order: i } as any)
    }
  }
}

export const subjectRepository = new SubjectRepository()
