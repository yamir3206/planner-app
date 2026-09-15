import { sessionRepository, taskRepository } from '../repositories'
import { getTodayString, parseDateString, addDays } from '../utils/date/jalali'

export interface DailyStat {
  date: string
  duration: number // seconds
  sessions: number
  tasks: number
}

export class AnalyticsService {
  async getDailyStats(days: number = 7): Promise<DailyStat[]> {
    const stats: DailyStat[] = []
    const today = new Date()
    
    for (let i = days - 1; i >= 0; i--) {
      const date = addDays(today, -i)
      const dateStr = date.toISOString().split('T')[0]
      
      const sessions = await sessionRepository.getByDate(dateStr)
      const tasks = await taskRepository.getByDate(dateStr)
      
      const completedSessions = sessions.filter(s => s.status === 'completed')
      const totalDuration = completedSessions.reduce((sum, s) => sum + s.duration, 0)
      
      stats.push({
        date: dateStr,
        duration: totalDuration,
        sessions: completedSessions.length,
        tasks: tasks.filter(t => t.status === 'done').length
      })
    }
    
    return stats
  }

  async getSubjectDistribution(): Promise<{ subjectId: string; duration: number; sessions: number }[]> {
    const sessions = await sessionRepository.getAll()
    const completed = sessions.filter(s => s.status === 'completed')
    
    const map = new Map<string, { duration: number; sessions: number }>()
    
    completed.forEach(s => {
      const existing = map.get(s.subjectId) || { duration: 0, sessions: 0 }
      existing.duration += s.duration
      existing.sessions += 1
      map.set(s.subjectId, existing)
    })
    
    return Array.from(map.entries()).map(([subjectId, data]) => ({
      subjectId,
      ...data
    }))
  }

  async getBestDay(): Promise<{ date: string; duration: number } | null> {
    const stats = await this.getDailyStats(30)
    if (stats.length === 0) return null
    return stats.reduce((best, curr) => curr.duration > best.duration ? curr : best, stats[0])
  }

  async getAverageStudyTime(): Promise<number> {
    const stats = await this.getDailyStats(7)
    if (stats.length === 0) return 0
    const total = stats.reduce((sum, s) => sum + s.duration, 0)
    return Math.round(total / stats.length)
  }
}

export const analyticsService = new AnalyticsService()
