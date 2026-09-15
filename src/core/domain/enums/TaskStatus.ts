export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'partial' | 'cancelled'

export const TaskStatusLabels: Record<TaskStatus, string> = {
  todo: 'انجام نشده',
  in_progress: 'در حال انجام',
  done: 'انجام شده',
  partial: 'نیمه‌کاره',
  cancelled: 'لغو شده'
}

export const TaskStatusColors: Record<TaskStatus, string> = {
  todo: '#94A3B8',
  in_progress: '#6366F1',
  done: '#10B981',
  partial: '#F59E0B',
  cancelled: '#EF4444'
}
