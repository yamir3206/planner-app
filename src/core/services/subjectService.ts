import { subjectRepository } from '../repositories'
import { Subject, createSubject } from '../domain/models/Subject'
import { SUBJECTS_BY_FIELD } from '@/lib/constants'

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
    
    // ایجاد دسته‌جمعی سریع
    const toCreate = subjects.map((def: any, i: number) => createSubject({
      name: def.name,
      nameEn: def.nameEn,
      color: def.color,
      icon: def.icon,
      order: def.order ?? i
    }))
    
    // ذخیره موازی برای سرعت
    await Promise.all(toCreate.map(s => subjectRepository.create(s)))
  }

  async seedForField(field: FieldType): Promise<void> {
    await subjectRepository.clear()
    const subjects = SUBJECTS_BY_FIELD[field] || SUBJECTS_BY_FIELD.tajrobi
    const toCreate = subjects.map((def: any, i: number) => createSubject({
      name: def.name,
      nameEn: def.nameEn,
      color: def.color,
      icon: def.icon,
      order: def.order ?? i
    }))
    await Promise.all(toCreate.map(s => subjectRepository.create(s)))
  }

  async getSubjectsByField(field: FieldType) {
    return SUBJECTS_BY_FIELD[field] || SUBJECTS_BY_FIELD.tajrobi
  }
}

export const subjectService = new SubjectService()
