import { sessionRepository } from '../repositories'
import { getLocalDateString, parseDateString, addDays } from '../utils/date/jalali'

export class StreakService {
  async calculateStreak(): Promise<{ current: number; longest: number; lastDate: string | null }> {
    const sessions = await sessionRepository.getAll()
    const completed = sessions.filter(s => s.status === 'completed')
    
    if (completed.length === 0) {
      return { current: 0, longest: 0, lastDate: null }
    }

    // Get unique dates with study
    const dates = new Set<string>()
    completed.forEach(s => {
      const dateStr = new Date(s.startTime).toISOString().split('T')[0]
      // Only count if duration > 5 minutes
      if (s.duration > 300) {
        dates.add(dateStr)
      }
    })

    const sortedDates = Array.from(dates).sort().reverse() // newest first
    if (sortedDates.length === 0) return { current: 0, longest: 0, lastDate: null }

    // Calculate current streak
    let current = 0
    let checkDate = new Date()
    let checkStr = getLocalDateString(checkDate)
    
    // If today has study, start from today, else from yesterday
    if (!dates.has(checkStr)) {
      checkDate = addDays(checkDate, -1)
      checkStr = getLocalDateString(checkDate)
    }

    while (dates.has(checkStr)) {
      current++
      checkDate = addDays(checkDate, -1)
      checkStr = getLocalDateString(checkDate)
    }

    // Calculate longest streak
    let longest = 0
    let tempStreak = 1
    const sortedAsc = Array.from(dates).sort()
    
    for (let i = 1; i < sortedAsc.length; i++) {
      const prev = parseDateString(sortedAsc[i-1])
      const curr = parseDateString(sortedAsc[i])
      const diff = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24))
      
      if (diff === 1) {
        tempStreak++
      } else {
        longest = Math.max(longest, tempStreak)
        tempStreak = 1
      }
    }
    longest = Math.max(longest, tempStreak, current)

    return {
      current,
      longest,
      lastDate: sortedDates[0]
    }
  }
}

export const streakService = new StreakService()
