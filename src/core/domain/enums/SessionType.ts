export type SessionType = 'pomodoro' | 'free' | 'countdown'
export type SessionStatus = 'active' | 'paused' | 'completed' | 'cancelled'

export const SessionTypeLabels: Record<SessionType, string> = {
  pomodoro: 'پومودورو',
  free: 'آزاد',
  countdown: 'معکوس'
}

export const SessionStatusLabels: Record<SessionStatus, string> = {
  active: 'فعال',
  paused: 'متوقف',
  completed: 'تمام شده',
  cancelled: 'لغو شده'
}
