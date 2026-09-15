import { BaseEntity } from './Base'

export type FieldType = 'riazi' | 'tajrobi' | 'ensani' | 'honar' | 'zaban' | 'other'
export type GradeType = '10' | '11' | '12' | 'graduate'

export const FieldLabels: Record<FieldType, string> = {
  riazi: 'ریاضی فیزیک',
  tajrobi: 'علوم تجربی',
  ensani: 'علوم انسانی',
  honar: 'هنر',
  zaban: 'زبان',
  other: 'سایر'
}

export const GradeLabels: Record<GradeType, string> = {
  '10': 'دهم',
  '11': 'یازدهم',
  '12': 'دوازدهم',
  graduate: 'فارغ‌التحصیل'
}

export interface UserProfile extends BaseEntity {
  name: string
  field: FieldType
  grade: GradeType
  target: string
  dailyTargetMinutes: number
  avatar?: string
}

export function createUserProfile(partial: Partial<UserProfile> & { name: string }): UserProfile {
  const now = new Date().toISOString()
  return {
    id: partial.id || 'default',
    name: partial.name,
    field: partial.field || 'tajrobi',
    grade: partial.grade || '12',
    target: partial.target || '',
    dailyTargetMinutes: partial.dailyTargetMinutes ?? 360,
    avatar: partial.avatar,
    createdAt: partial.createdAt || now,
    updatedAt: partial.updatedAt || now
  }
}
