export interface UserStats {
  id: string
  totalStudySeconds: number
  totalSessions: number
  totalTasksCompleted: number
  currentStreak: number
  longestStreak: number
  level: number
  xp: number
  totalXp: number
  coins: number
  lastStudyDate: string | null
  createdAt: string
  updatedAt: string
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  category: 'study' | 'streak' | 'tasks' | 'time' | 'special'
  requirement: number
  xpReward: number
  coinReward: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  unlockedAt?: string
  progress?: number
}

export interface Level {
  level: number
  title: string
  minXp: number
  maxXp: number
  icon: string
  color: string
  benefits: string[]
}

export interface DailyChallenge {
  id: string
  title: string
  description: string
  icon: string
  target: number
  progress: number
  xpReward: number
  coinReward: number
  type: 'study_minutes' | 'sessions' | 'tasks' | 'subjects'
  date: string
  completed: boolean
  completedAt?: string
}

export interface XpEvent {
  id: string
  amount: number
  reason: string
  timestamp: string
  icon: string
}

export const LEVELS: Level[] = [
  { level: 1, title: 'تازه‌کار', minXp: 0, maxXp: 100, icon: '🌱', color: '#10B981', benefits: ['شروع مسیر'] },
  { level: 2, title: 'جویای دانش', minXp: 100, maxXp: 300, icon: '📚', color: '#06B6D4', benefits: ['۲۰٪ امتیاز بیشتر'] },
  { level: 3, title: 'پرتلاش', minXp: 300, maxXp: 600, icon: '💪', color: '#6366F1', benefits: ['نشان ویژه'] },
  { level: 4, title: 'متمرکز', minXp: 600, maxXp: 1000, icon: '🎯', color: '#8B5CF6', benefits: ['چالش‌های بیشتر'] },
  { level: 5, title: 'متعهد', minXp: 1000, maxXp: 1500, icon: '⭐', color: '#F59E0B', benefits: ['۵۰٪ امتیاز بیشتر'] },
  { level: 6, title: 'حرفه‌ای', minXp: 1500, maxXp: 2200, icon: '🚀', color: '#EF4444', benefits: ['تم ویژه'] },
  { level: 7, title: 'استاد', minXp: 2200, maxXp: 3000, icon: '👑', color: '#EC4899', benefits: ['لقب استاد'] },
  { level: 8, title: 'نابغه', minXp: 3000, maxXp: 4000, icon: '🧠', color: '#14B8A6', benefits: ['دو برابر سکه'] },
  { level: 9, title: 'افسانه‌ای', minXp: 4000, maxXp: 5500, icon: '🔥', color: '#F97316', benefits: ['همه جوایز'] },
  { level: 10, title: 'کنکوری برتر', minXp: 5500, maxXp: 999999, icon: '🏆', color: '#FFD700', benefits: ['قهرمان آکسون'] },
]

export const ACHIEVEMENTS: Omit<Achievement, 'unlockedAt' | 'progress'>[] = [
  // مطالعه
  { id: 'first_session', title: 'اولین قدم', description: 'اولین جلسه مطالعه را کامل کن', icon: '🎬', category: 'study', requirement: 1, xpReward: 20, coinReward: 10, rarity: 'common' },
  { id: 'sessions_10', title: 'ده‌تایی', description: '۱۰ جلسه مطالعه', icon: '📖', category: 'study', requirement: 10, xpReward: 50, coinReward: 25, rarity: 'common' },
  { id: 'sessions_50', title: 'پنجاه‌تایی', description: '۵۰ جلسه مطالعه', icon: '📚', category: 'study', requirement: 50, xpReward: 150, coinReward: 75, rarity: 'rare' },
  { id: 'sessions_100', title: 'صدتایی', description: '۱۰۰ جلسه مطالعه', icon: '🏅', category: 'study', requirement: 100, xpReward: 300, coinReward: 150, rarity: 'epic' },
  { id: 'sessions_250', title: 'افسانه مطالعه', description: '۲۵۰ جلسه', icon: '👑', category: 'study', requirement: 250, xpReward: 500, coinReward: 300, rarity: 'legendary' },
  
  // زمان
  { id: 'time_1h', title: 'یک ساعته', description: '۱ ساعت مطالعه', icon: '⏰', category: 'time', requirement: 3600, xpReward: 30, coinReward: 15, rarity: 'common' },
  { id: 'time_10h', title: 'ده ساعته', description: '۱۰ ساعت مطالعه', icon: '⏳', category: 'time', requirement: 36000, xpReward: 100, coinReward: 50, rarity: 'common' },
  { id: 'time_50h', title: 'پنجاه ساعته', description: '۵۰ ساعت', icon: '⌛', category: 'time', requirement: 180000, xpReward: 250, coinReward: 125, rarity: 'rare' },
  { id: 'time_100h', title: 'صد ساعته', description: '۱۰۰ ساعت', icon: '🔥', category: 'time', requirement: 360000, xpReward: 500, coinReward: 250, rarity: 'epic' },
  { id: 'time_200h', title: 'دویست ساعته', description: '۲۰۰ ساعت', icon: '💎', category: 'time', requirement: 720000, xpReward: 800, coinReward: 400, rarity: 'legendary' },
  
  // استریک
  { id: 'streak_3', title: 'سه روزه', description: '۳ روز پیاپی', icon: '🔥', category: 'streak', requirement: 3, xpReward: 40, coinReward: 20, rarity: 'common' },
  { id: 'streak_7', title: 'هفتگی', description: '۷ روز پیاپی', icon: '⚡', category: 'streak', requirement: 7, xpReward: 100, coinReward: 50, rarity: 'rare' },
  { id: 'streak_14', title: 'دو هفته‌ای', description: '۱۴ روز پیاپی', icon: '🌟', category: 'streak', requirement: 14, xpReward: 200, coinReward: 100, rarity: 'epic' },
  { id: 'streak_30', title: 'ماهانه', description: '۳۰ روز پیاپی', icon: '🏆', category: 'streak', requirement: 30, xpReward: 400, coinReward: 200, rarity: 'legendary' },
  
  // کارها
  { id: 'tasks_10', title: 'برنامه‌ریز', description: '۱۰ کار انجام شده', icon: '✅', category: 'tasks', requirement: 10, xpReward: 30, coinReward: 15, rarity: 'common' },
  { id: 'tasks_50', title: 'منظم', description: '۵۰ کار', icon: '📋', category: 'tasks', requirement: 50, xpReward: 100, coinReward: 50, rarity: 'rare' },
  { id: 'tasks_100', title: 'دقیق', description: '۱۰۰ کار', icon: '🎯', category: 'tasks', requirement: 100, xpReward: 200, coinReward: 100, rarity: 'epic' },
  
  // ویژه
  { id: 'early_bird', title: 'سحرخیز', description: 'مطالعه قبل از ۶ صبح', icon: '🌅', category: 'special', requirement: 1, xpReward: 50, coinReward: 30, rarity: 'rare' },
  { id: 'night_owl', title: 'شب‌زنده‌دار', description: 'مطالعه بعد از ۱۲ شب', icon: '🦉', category: 'special', requirement: 1, xpReward: 50, coinReward: 30, rarity: 'rare' },
  { id: 'weekend_warrior', title: 'آخر هفته', description: 'مطالعه در جمعه', icon: '💪', category: 'special', requirement: 1, xpReward: 40, coinReward: 20, rarity: 'common' },
  { id: 'pomodoro_master', title: 'استاد پومودورو', description: '۲۰ جلسه پومودورو', icon: '🍅', category: 'special', requirement: 20, xpReward: 120, coinReward: 60, rarity: 'rare' },
]

export function getLevelFromXp(xp: number): Level {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXp) return LEVELS[i]
  }
  return LEVELS[0]
}

export function getNextLevel(currentXp: number): Level | null {
  const current = getLevelFromXp(currentXp)
  const nextIndex = LEVELS.findIndex(l => l.level === current.level) + 1
  return nextIndex < LEVELS.length ? LEVELS[nextIndex] : null
}

export function calculateXpForSession(durationSeconds: number, mode: string, streak: number): number {
  const minutes = Math.floor(durationSeconds / 60)
  let baseXp = Math.floor(minutes * 1.5) // هر دقیقه 1.5 XP
  
  // پاداش نوع جلسه
  if (mode === 'pomodoro') baseXp = Math.floor(baseXp * 1.2)
  if (mode === 'countdown') baseXp = Math.floor(baseXp * 1.1)
  
  // پاداش استریک
  if (streak >= 3) baseXp = Math.floor(baseXp * 1.1)
  if (streak >= 7) baseXp = Math.floor(baseXp * 1.2)
  if (streak >= 14) baseXp = Math.floor(baseXp * 1.3)
  if (streak >= 30) baseXp = Math.floor(baseXp * 1.5)
  
  // حداقل 5 XP
  return Math.max(5, baseXp)
}
