import { subjectRepository } from '../repositories'
import { Subject, createSubject } from '../domain/models/Subject'
import { DEFAULT_SUBJECTS, SUBJECTS_BY_FIELD } from '@/lib/constants'

export type FieldType = 'riazi' | 'tajrobi' | 'ensani' | 'other'

export class SubjectService {
  async getAll(): Promise<Subject[]> {
    return subjectRepository.getAll()
  }

  async getActive(): Promise<Subject[]> {
    return subjectRepository.getActive()
  }

  async create(data: Partial<Subject> & { name: string }): Promise<Subject> {
    const subject = createSubject(data)
    return subjectRepository.create(subject)
  }

  async update(id: string, updates: Partial<Subject>): Promise<Subject | null> {
    return subjectRepository.update(id, updates)
  }

  async delete(id: string): Promise<void> {
    return subjectRepository.delete(id)
  }

  async seedDefaults(field: FieldType = 'tajrobi'): Promise<void> {
    const existing = await subjectRepository.getAll()
    if (existing.length > 0) return

    const subjects = SUBJECTS_BY_FIELD[field] || SUBJECTS_BY_FIELD.tajrobi

    for (let i = 0; i < subjects.length; i++) {
      const def = subjects[i]
      await this.create({
        name: def.name,
        nameEn: (def as any).nameEn,
        color: def.color,
        icon: def.icon,
        order: (def as any).order ?? i
      })
    }
  }

  async seedForField(field: FieldType): Promise<void> {
    // Clear and reseed (for when user changes field)
    await subjectRepository.clear()
    const subjects = SUBJECTS_BY_FIELD[field] || SUBJECTS_BY_FIELD.tajrobi
    for (let i = 0; i < subjects.length; i++) {
      const def = subjects[i]
      await this.create({
        name: def.name,
        nameEn: (def as any).nameEn,
        color: def.color,
        icon: def.icon,
        order: (def as any).order ?? i
      })
    }
  }

  async getSubjectsByField(field: FieldType) {
    return SUBJECTS_BY_FIELD[field] || SUBJECTS_BY_FIELD.tajrobi
  }
}

export const subjectService = new SubjectService()
