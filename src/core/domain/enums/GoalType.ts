export type GoalType = 'daily' | 'weekly' | 'monthly' | 'subject' | 'test'
export type GoalUnit = 'minutes' | 'hours' | 'questions' | 'pages' | 'sessions'

export const GoalTypeLabels: Record<GoalType, string> = {
  daily: 'روزانه',
  weekly: 'هفتگی',
  monthly: 'ماهانه',
  subject: 'درسی',
  test: 'تستی'
}

export const GoalUnitLabels: Record<GoalUnit, string> = {
  minutes: 'دقیقه',
  hours: 'ساعت',
  questions: 'تست',
  pages: 'صفحه',
  sessions: 'جلسه'
}
