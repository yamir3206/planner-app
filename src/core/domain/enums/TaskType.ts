export type TaskType =
  | 'study'
  | 'test'
  | 'review'
  | 'exam'
  | 'exam_analysis'
  | 'summary'
  | 'troubleshooting'

export const TaskTypeLabels: Record<TaskType, string> = {
  study: 'مطالعه',
  test: 'تست',
  review: 'مرور',
  exam: 'آزمون',
  exam_analysis: 'تحلیل آزمون',
  summary: 'جمع‌بندی',
  troubleshooting: 'رفع اشکال'
}

export const TaskTypeIcons: Record<TaskType, string> = {
  study: 'BookOpen',
  test: 'ClipboardCheck',
  review: 'RotateCcw',
  exam: 'FileText',
  exam_analysis: 'BarChart3',
  summary: 'Layers',
  troubleshooting: 'Wrench'
}

export const TaskTypeColors: Record<TaskType, string> = {
  study: '#6366F1',
  test: '#06B6D4',
  review: '#10B981',
  exam: '#F59E0B',
  exam_analysis: '#8B5CF6',
  summary: '#EC4899',
  troubleshooting: '#EF4444'
}
