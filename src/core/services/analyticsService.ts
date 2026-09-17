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
    try {
      const stats: DailyStat[] = []
      const today = new Date()
      
      // لود همه جلسات و کارها یکباره برای سرعت
      const [allSessions, allTasks] = await Promise.all([
        sessionRepository.getAll().catch(() => []),
        taskRepository.getAll().catch(() => [])
      ])
      
      for (let i = days - 1; i >= 0; i--) {
        const date = addDays(today, -i)
        const dateStr = date.toISOString().split('T')[0]
        
        const sessionsForDay = allSessions.filter(s => {
          try {
            const d = new Date(s.startTime).toISOString().split('T')[0]
            return d === dateStr
          } catch { return false }
        })
        const tasksForDay = allTasks.filter(t => t.date === dateStr)
        
        const completedSessions = sessionsForDay.filter(s => s.status === 'completed')
        const totalDuration = completedSessions.reduce((sum, s) => sum + (s.duration || 0), 0)
        
        stats.push({
          date: dateStr,
          duration: totalDuration,
          sessions: completedSessions.length,
          tasks: tasksForDay.filter(t => t.status === 'done').length
        })
      }
      
      return stats
    } catch (e) {
      console.warn('[Analytics] getDailyStats failed', e)
      // برگرداندن آرایه خالی به جای گیر کردن
      const fallback: DailyStat[] = []
      const today = new Date()
      for (let i = days - 1; i >= 0; i--) {
        const date = addDays(today, -i)
        fallback.push({
          date: date.toISOString().split('T')[0],
          duration: 0,
          sessions: 0,
          tasks: 0
        })
      }
      return fallback
    }
  }

  async getSubjectDistribution(): Promise<{ subjectId: string; duration: number; sessions: number }[]> {
    try {
      const sessions = await sessionRepository.getAll()
      const completed = sessions.filter(s => s.status === 'completed')
      
      const map = new Map<string, { duration: number; sessions: number }>()
      
      completed.forEach(s => {
        const existing = map.get(s.subjectId) || { duration: 0, sessions: 0 }
        existing.duration += s.duration || 0
        existing.sessions += 1
        map.set(s.subjectId, existing)
      })
      
      return Array.from(map.entries()).map(([subjectId, data]) => ({
        subjectId,
        ...data
      }))
    } catch (e) {
      console.warn('[Analytics] getSubjectDistribution failed', e)
      return []
    }
  }

  async getBestDay(): Promise<{ date: string; duration: number } | null> {
    try {
      const stats = await this.getDailyStats(30)
      if (stats.length === 0) return null
      return stats.reduce((best, curr) => curr.duration > best.duration ? curr : best, stats[0])
    } catch {
      return null
    }
  }

  async getAverageStudyTime(): Promise<number> {
    try {
      const stats = await this.getDailyStats(7)
      if (stats.length === 0) return 0
      const total = stats.reduce((sum, s) => sum + s.duration, 0)
      return Math.round(total / stats.length)
    } catch {
      return 0
    }
  }
}

export const analyticsService = new AnalyticsService()
