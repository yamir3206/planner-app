import { UserStats, Achievement, ACHIEVEMENTS, DailyChallenge, XpEvent, getLevelFromXp, calculateXpForSession } from '@/core/domain/models/Gamification'
import { getTodayString } from '@/core/utils/date/jalali'

const GAMIFICATION_KEY = 'axon_gamification'
const ACHIEVEMENTS_KEY = 'axon_achievements'
const CHALLENGES_KEY = 'axon_challenges'
const XP_HISTORY_KEY = 'axon_xp_history'

class GamificationService {
  private getStoredStats(): UserStats | null {
    try {
      const raw = localStorage.getItem(GAMIFICATION_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }

  private saveStats(stats: UserStats): void {
    localStorage.setItem(GAMIFICATION_KEY, JSON.stringify(stats))
  }

  private getStoredAchievements(): Achievement[] {
    try {
      const raw = localStorage.getItem(ACHIEVEMENTS_KEY)
      if (raw) return JSON.parse(raw)
    } catch {}
    // پیش‌فرض: همه دستاوردها قفل
    return ACHIEVEMENTS.map(a => ({ ...a, progress: 0 }))
  }

  private saveAchievements(achievements: Achievement[]): void {
    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements))
  }

  private getStoredChallenges(): DailyChallenge[] {
    try {
      const raw = localStorage.getItem(CHALLENGES_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  }

  private saveChallenges(challenges: DailyChallenge[]): void {
    localStorage.setItem(CHALLENGES_KEY, JSON.stringify(challenges))
  }

  private getStoredXpHistory(): XpEvent[] {
    try {
      const raw = localStorage.getItem(XP_HISTORY_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  }

  private saveXpHistory(history: XpEvent[]): void {
    // فقط 50 آخری
    const trimmed = history.slice(-50)
    localStorage.setItem(XP_HISTORY_KEY, JSON.stringify(trimmed))
  }

  private addXpEvent(amount: number, reason: string, icon: string): void {
    const history = this.getStoredXpHistory()
    history.push({
      id: Date.now().toString(),
      amount,
      reason,
      timestamp: new Date().toISOString(),
      icon,
    })
    this.saveXpHistory(history)
  }

  async getStats(): Promise<UserStats> {
    let stats = this.getStoredStats()
    if (!stats) {
      stats = {
        id: 'main',
        totalStudySeconds: 0,
        totalSessions: 0,
        totalTasksCompleted: 0,
        currentStreak: 0,
        longestStreak: 0,
        level: 1,
        xp: 0,
        totalXp: 0,
        coins: 0,
        lastStudyDate: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      this.saveStats(stats)
    }
    return stats
  }

  async addStudySession(durationSeconds: number, mode: string, subjectId?: string): Promise<{ xpGained: number; newAchievements: Achievement[]; levelUp: boolean; newLevel?: number }> {
    const stats = await this.getStats()
    const oldLevel = getLevelFromXp(stats.totalXp)
    
    const xpGained = calculateXpForSession(durationSeconds, mode, stats.currentStreak)
    const coinGained = Math.floor(xpGained * 0.5)
    
    stats.totalStudySeconds += durationSeconds
    stats.totalSessions += 1
    stats.xp += xpGained
    stats.totalXp += xpGained
    stats.coins += coinGained
    stats.lastStudyDate = getTodayString()
    stats.updatedAt = new Date().toISOString()
    
    const newLevel = getLevelFromXp(stats.totalXp)
    stats.level = newLevel.level
    
    const levelUp = newLevel.level > oldLevel.level
    
    this.saveStats(stats)
    this.addXpEvent(xpGained, `مطالعه ${Math.floor(durationSeconds/60)} دقیقه`, '📚')
    
    // بررسی دستاوردها
    const newAchievements = await this.checkAchievements()
    
    // به‌روزرسانی چالش روزانه
    await this.updateDailyChallenges('study_minutes', Math.floor(durationSeconds/60))
    await this.updateDailyChallenges('sessions', 1)
    
    // بررسی دستاوردهای ویژه زمانی
    const hour = new Date().getHours()
    if (hour < 6) await this.unlockSpecialAchievement('early_bird')
    if (hour >= 0 && hour < 4) await this.unlockSpecialAchievement('night_owl')
    if (new Date().getDay() === 5) await this.unlockSpecialAchievement('weekend_warrior')
    if (mode === 'pomodoro') {
      const pomodoroCount = stats.totalSessions // ساده‌سازی
      if (pomodoroCount >= 20) await this.unlockSpecialAchievement('pomodoro_master')
    }
    
    return { xpGained, newAchievements, levelUp, newLevel: levelUp ? newLevel.level : undefined }
  }

  async completeTask(): Promise<{ xpGained: number; newAchievements: Achievement[] }> {
    const stats = await this.getStats()
    const xpGained = 10
    stats.totalTasksCompleted += 1
    stats.xp += xpGained
    stats.totalXp += xpGained
    stats.coins += 5
    stats.updatedAt = new Date().toISOString()
    stats.level = getLevelFromXp(stats.totalXp).level
    this.saveStats(stats)
    this.addXpEvent(xpGained, 'انجام کار', '✅')
    
    const newAchievements = await this.checkAchievements()
    await this.updateDailyChallenges('tasks', 1)
    
    return { xpGained, newAchievements }
  }

  async updateStreak(currentStreak: number, longestStreak: number): Promise<void> {
    const stats = await this.getStats()
    stats.currentStreak = currentStreak
    stats.longestStreak = Math.max(stats.longestStreak, longestStreak)
    stats.updatedAt = new Date().toISOString()
    this.saveStats(stats)
    await this.checkAchievements()
  }

  async getAchievements(): Promise<Achievement[]> {
    const stored = this.getStoredAchievements()
    const stats = await this.getStats()
    
    // به‌روزرسانی پیشرفت
    return stored.map(ach => {
      let progress = 0
      switch (ach.category) {
        case 'study':
          progress = stats.totalSessions
          break
        case 'time':
          progress = stats.totalStudySeconds
          break
        case 'streak':
          progress = stats.longestStreak
          break
        case 'tasks':
          progress = stats.totalTasksCompleted
          break
        case 'special':
          progress = ach.unlockedAt ? 1 : 0
          break
      }
      
      // اگر قبلاً باز شده، پیشرفت کامل
      if (ach.unlockedAt) progress = ach.requirement
      
      return { ...ach, progress: Math.min(progress, ach.requirement) }
    })
  }

  private async checkAchievements(): Promise<Achievement[]> {
    const achievements = await this.getAchievements()
    const stats = await this.getStats()
    const newlyUnlocked: Achievement[] = []
    
    const updated = achievements.map(ach => {
      if (ach.unlockedAt) return ach // قبلاً باز شده
      
      let shouldUnlock = false
      if (ach.category === 'special') {
        // ویژه‌ها جداگانه بررسی می‌شوند
        return ach
      }
      
      if (ach.progress !== undefined && ach.progress >= ach.requirement) {
        shouldUnlock = true
      }
      
      if (shouldUnlock) {
        const unlocked: Achievement = {
          ...ach,
          unlockedAt: new Date().toISOString(),
        }
        newlyUnlocked.push(unlocked)
        
        // پاداش
        stats.xp += ach.xpReward
        stats.totalXp += ach.xpReward
        stats.coins += ach.coinReward
        this.addXpEvent(ach.xpReward, `دستاورد: ${ach.title}`, ach.icon)
        
        return unlocked
      }
      
      return ach
    })
    
    if (newlyUnlocked.length > 0) {
      stats.level = getLevelFromXp(stats.totalXp).level
      stats.updatedAt = new Date().toISOString()
      this.saveStats(stats)
      this.saveAchievements(updated)
    } else {
      this.saveAchievements(updated)
    }
    
    return newlyUnlocked
  }

  private async unlockSpecialAchievement(id: string): Promise<void> {
    const achievements = this.getStoredAchievements()
    const existing = achievements.find(a => a.id === id)
    if (existing?.unlockedAt) return // قبلاً باز شده
    
    const template = ACHIEVEMENTS.find(a => a.id === id)
    if (!template) return
    
    const stats = await this.getStats()
    const unlocked: Achievement = {
      ...template,
      progress: 1,
      unlockedAt: new Date().toISOString(),
    }
    
    const updated = achievements.map(a => a.id === id ? unlocked : a)
    this.saveAchievements(updated)
    
    stats.xp += template.xpReward
    stats.totalXp += template.xpReward
    stats.coins += template.coinReward
    stats.level = getLevelFromXp(stats.totalXp).level
    stats.updatedAt = new Date().toISOString()
    this.saveStats(stats)
    this.addXpEvent(template.xpReward, `دستاورد ویژه: ${template.title}`, template.icon)
  }

  async getDailyChallenges(): Promise<DailyChallenge[]> {
    const today = getTodayString()
    let challenges = this.getStoredChallenges().filter(c => c.date === today)
    
    if (challenges.length === 0) {
      // ساخت چالش‌های امروز
      challenges = this.generateDailyChallenges(today)
      const all = this.getStoredChallenges().filter(c => c.date !== today)
      this.saveChallenges([...all, ...challenges])
    }
    
    return challenges
  }

  private generateDailyChallenges(date: string): DailyChallenge[] {
    const templates = [
      { title: '۳۰ دقیقه مطالعه', description: 'نیم ساعت مطالعه کن', icon: '⏰', target: 30, xp: 20, coin: 10, type: 'study_minutes' as const },
      { title: '۲ جلسه', description: 'دو جلسه کامل', icon: '📚', target: 2, xp: 30, coin: 15, type: 'sessions' as const },
      { title: '۳ کار', description: 'سه کار انجام بده', icon: '✅', target: 3, xp: 25, coin: 12, type: 'tasks' as const },
      { title: '۱ ساعت', description: 'یک ساعت مطالعه', icon: '🔥', target: 60, xp: 40, coin: 20, type: 'study_minutes' as const },
      { title: 'مطالعه متنوع', description: '۲ درس مختلف', icon: '📖', target: 2, xp: 35, coin: 18, type: 'subjects' as const },
    ]
    
    // انتخاب تصادفی 3 چالش
    const shuffled = [...templates].sort(() => Math.random() - 0.5).slice(0, 3)
    
    return shuffled.map((t, i) => ({
      id: `${date}_${i}`,
      title: t.title,
      description: t.description,
      icon: t.icon,
      target: t.target,
      progress: 0,
      xpReward: t.xp,
      coinReward: t.coin,
      type: t.type,
      date,
      completed: false,
    }))
  }

  private async updateDailyChallenges(type: DailyChallenge['type'], amount: number): Promise<DailyChallenge[]> {
    const today = getTodayString()
    const allChallenges = this.getStoredChallenges()
    let todayChallenges = allChallenges.filter(c => c.date === today)
    const newlyCompleted: DailyChallenge[] = []
    
    todayChallenges = todayChallenges.map(ch => {
      if (ch.completed) return ch
      if (ch.type !== type) return ch
      
      const newProgress = Math.min(ch.target, ch.progress + amount)
      const completed = newProgress >= ch.target
      
      if (completed && !ch.completed) {
        const completedChallenge = {
          ...ch,
          progress: newProgress,
          completed: true,
          completedAt: new Date().toISOString(),
        }
        newlyCompleted.push(completedChallenge)
        
        // پاداش
        this.getStats().then(stats => {
          stats.xp += ch.xpReward
          stats.totalXp += ch.xpReward
          stats.coins += ch.coinReward
          stats.level = getLevelFromXp(stats.totalXp).level
          stats.updatedAt = new Date().toISOString()
          this.saveStats(stats)
          this.addXpEvent(ch.xpReward, `چالش: ${ch.title}`, ch.icon)
        })
        
        return completedChallenge
      }
      
      return { ...ch, progress: newProgress }
    })
    
    const otherChallenges = allChallenges.filter(c => c.date !== today)
    this.saveChallenges([...otherChallenges, ...todayChallenges])
    
    return newlyCompleted
  }

  async getXpHistory(): Promise<XpEvent[]> {
    return this.getStoredXpHistory()
  }

  async reset(): Promise<void> {
    localStorage.removeItem(GAMIFICATION_KEY)
    localStorage.removeItem(ACHIEVEMENTS_KEY)
    localStorage.removeItem(CHALLENGES_KEY)
    localStorage.removeItem(XP_HISTORY_KEY)
  }

  async exportData(): Promise<string> {
    const stats = await this.getStats()
    const achievements = await this.getAchievements()
    const challenges = this.getStoredChallenges()
    const history = this.getStoredXpHistory()
    
    return JSON.stringify({
      stats,
      achievements,
      challenges,
      history,
      exportedAt: new Date().toISOString(),
    })
  }

  async importData(json: string): Promise<void> {
    try {
      const data = JSON.parse(json)
      if (data.stats) localStorage.setItem(GAMIFICATION_KEY, JSON.stringify(data.stats))
      if (data.achievements) localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(data.achievements))
      if (data.challenges) localStorage.setItem(CHALLENGES_KEY, JSON.stringify(data.challenges))
      if (data.history) localStorage.setItem(XP_HISTORY_KEY, JSON.stringify(data.history))
    } catch (e) {
      throw new Error('فایل نامعتبر')
    }
  }
}

export const gamificationService = new GamificationService()
