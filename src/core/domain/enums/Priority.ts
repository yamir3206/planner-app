export type Priority = 'low' | 'medium' | 'high' | 'urgent'

export const PriorityLabels: Record<Priority, string> = {
  low: 'کم',
  medium: 'متوسط',
  high: 'زیاد',
  urgent: 'فوری'
}

export const PriorityColors: Record<Priority, string> = {
  low: '#94A3B8',
  medium: '#06B6D4',
  high: '#F59E0B',
  urgent: '#EF4444'
}

export const PriorityOrder: Record<Priority, number> = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1
}
