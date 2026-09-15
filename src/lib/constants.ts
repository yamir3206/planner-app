export const APP_NAME = 'آکسون'
export const APP_NAME_EN = 'Axon'
export const APP_DESCRIPTION = 'برنامه‌ریز کنکور آکسون - حرفه‌ای، فارسی، آفلاین'
export const APP_VERSION = '1.2.2'

export const STORAGE_KEYS = {
  SETTINGS: 'axon_settings',
  PROFILE: 'axon_profile',
  ACTIVE_TIMER: 'axon_active_timer',
  THEME: 'axon_theme',
  PERSIAN_NUMBERS: 'axon_persian_numbers',
  AUTH_USER: 'axon_auth_user',
  AUTH_TOKEN: 'axon_auth_token'
} as const

export const DB_NAME = 'axon_planner_db'
export const DB_VERSION = 2 // Increased for users store
export const STORES = {
  SUBJECTS: 'subjects',
  TASKS: 'tasks',
  SESSIONS: 'sessions',
  GOALS: 'goals',
  SETTINGS: 'settings',
  PROFILE: 'profile',
  USERS: 'users'
} as const

// کنکور تجربی - دروس تخصصی + عمومی (قابل گسترش)
export const TAJROBI_SUBJECTS = [
  { name: 'زیست‌شناسی', nameEn: 'Biology', color: '#10B981', icon: 'Dna', order: 0, isMain: true },
  { name: 'شیمی', nameEn: 'Chemistry', color: '#06B6D4', icon: 'FlaskConical', order: 1, isMain: true },
  { name: 'فیزیک', nameEn: 'Physics', color: '#6366F1', icon: 'Atom', order: 2, isMain: true },
  { name: 'ریاضی تجربی', nameEn: 'Math', color: '#F59E0B', icon: 'Calculator', order: 3, isMain: true },
  { name: 'زمین‌شناسی', nameEn: 'Geology', color: '#8B5CF6', icon: 'Mountain', order: 4, isMain: true },
  { name: 'فارسی', nameEn: 'Persian', color: '#EF4444', icon: 'BookOpen', order: 5, isMain: false },
  { name: 'عربی', nameEn: 'Arabic', color: '#EC4899', icon: 'Languages', order: 6, isMain: false },
  { name: 'دینی', nameEn: 'Religion', color: '#14B8A6', icon: 'Heart', order: 7, isMain: false },
  { name: 'زبان انگلیسی', nameEn: 'English', color: '#F97316', icon: 'Globe', order: 8, isMain: false }
] as const

export const RIAZI_SUBJECTS = [
  { name: 'ریاضیات', color: '#6366F1', icon: 'Calculator', order: 0, isMain: true },
  { name: 'فیزیک', color: '#06B6D4', icon: 'Atom', order: 1, isMain: true },
  { name: 'شیمی', color: '#10B981', icon: 'FlaskConical', order: 2, isMain: true },
  { name: 'هندسه', color: '#8B5CF6', icon: 'Shapes', order: 3, isMain: true },
  { name: 'گسسته', color: '#F59E0B', icon: 'Binary', order: 4, isMain: true },
  { name: 'فارسی', color: '#EF4444', icon: 'BookOpen', order: 5, isMain: false },
  { name: 'عربی', color: '#EC4899', icon: 'Languages', order: 6, isMain: false },
  { name: 'دینی', color: '#14B8A6', icon: 'Heart', order: 7, isMain: false },
  { name: 'زبان', color: '#F97316', icon: 'Globe', order: 8, isMain: false }
] as const

export const ENSANI_SUBJECTS = [
  { name: 'ریاضی انسانی', color: '#6366F1', icon: 'Calculator', order: 0, isMain: true },
  { name: 'اقتصاد', color: '#10B981', icon: 'TrendingUp', order: 1, isMain: true },
  { name: 'ادبیات تخصصی', color: '#EF4444', icon: 'BookOpen', order: 2, isMain: true },
  { name: 'عربی تخصصی', color: '#EC4899', icon: 'Languages', order: 3, isMain: true },
  { name: 'تاریخ', color: '#F59E0B', icon: 'Clock', order: 4, isMain: true },
  { name: 'جغرافیا', color: '#06B6D4', icon: 'Map', order: 5, isMain: true },
  { name: 'جامعه‌شناسی', color: '#8B5CF6', icon: 'Users', order: 6, isMain: true },
  { name: 'فلسفه و منطق', color: '#14B8A6', icon: 'Brain', order: 7, isMain: true },
  { name: 'روان‌شناسی', color: '#F97316', icon: 'Heart', order: 8, isMain: true }
] as const

export const SUBJECTS_BY_FIELD = {
  tajrobi: TAJROBI_SUBJECTS,
  riazi: RIAZI_SUBJECTS,
  ensani: ENSANI_SUBJECTS,
  other: TAJROBI_SUBJECTS
} as const

// برای سازگاری با کد قدیمی
export const DEFAULT_SUBJECTS = TAJROBI_SUBJECTS

export const POMODORO_DEFAULTS = {
  work: 25,
  shortBreak: 5,
  longBreak: 15,
  longBreakInterval: 4
} as const

export const DAILY_TARGET_DEFAULT = 360 // 6 hours in minutes

// تم‌های زیبا
export const THEMES = [
  { id: 'axon', name: 'آکسون', nameEn: 'Axon', primary: '#6366F1', accent: '#06B6D4', description: 'بنفش هوشمند' },
  { id: 'forest', name: 'جنگل', nameEn: 'Forest', primary: '#10B981', accent: '#059669', description: 'سبز آرامش‌بخش' },
  { id: 'ocean', name: 'اقیانوس', nameEn: 'Ocean', primary: '#0EA5E9', accent: '#06B6D4', description: 'آبی عمیق' },
  { id: 'sunset', name: 'غروب', nameEn: 'Sunset', primary: '#F59E0B', accent: '#EF4444', description: 'نارنجی گرم' },
  { id: 'lavender', name: 'اسطوخودوس', nameEn: 'Lavender', primary: '#8B5CF6', accent: '#EC4899', description: 'بنفش ملایم' },
  { id: 'midnight', name: 'نیمه‌شب', nameEn: 'Midnight', primary: '#1E293B', accent: '#6366F1', description: 'تاریک حرفه‌ای' },
  { id: 'rose', name: 'رز', nameEn: 'Rose', primary: '#EC4899', accent: '#F43F5E', description: 'صورتی انرژی‌بخش' },
  { id: 'emerald', name: 'زمرد', nameEn: 'Emerald', primary: '#059669', accent: '#10B981', description: 'سبز زمردی' }
] as const

export type ThemeId = typeof THEMES[number]['id']
