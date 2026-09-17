import * as React from 'react'
import { PageContainer } from '@/components/layout/AppShell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { gamificationService } from '@/core/services/gamificationService'
import { UserStats, Achievement, DailyChallenge, LEVELS, getLevelFromXp } from '@/core/domain/models/Gamification'
import { LevelBadge, LevelProgress } from '@/components/gamification/LevelBadge'
import { AchievementGrid } from '@/components/gamification/AchievementCard'
import { DailyChallenges } from '@/components/gamification/ChallengeCard'
import { useSettingsStore } from '@/app/providers'
import { toPersianDigits } from '@/core/utils/persian/numbers'
import { Trophy, Flame, Clock, Coins, Star, Zap, Award } from 'lucide-react'

export function GamificationPage() {
  const { settings } = useSettingsStore()
  const [stats, setStats] = React.useState<UserStats | null>(null)
  const [achievements, setAchievements] = React.useState<Achievement[]>([])
  const [challenges, setChallenges] = React.useState<DailyChallenge[]>([])
  const [activeTab, setActiveTab] = React.useState<'overview' | 'achievements' | 'challenges' | 'levels'>('overview')

  React.useEffect(() => {
    gamificationService.getStats().then(setStats).catch(() => {})
    gamificationService.getAchievements().then(setAchievements).catch(() => {})
    gamificationService.getDailyChallenges().then(setChallenges).catch(() => {})
  }, [])

  if (!stats) {
    return (
      <PageContainer>
        <div className="space-y-4">
          <div className="h-8 bg-secondary rounded w-1/3 animate-pulse"></div>
          <div className="h-32 bg-secondary rounded-2xl animate-pulse"></div>
        </div>
      </PageContainer>
    )
  }

  const level = getLevelFromXp(stats.totalXp)
  const unlockedCount = achievements.filter(a => a.unlockedAt).length
  const totalHours = Math.floor(stats.totalStudySeconds / 3600)

  return (
    <PageContainer>
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-black flex items-center gap-2"><Trophy className="h-6 w-6 text-amber-500" />گیمیفیکیشن</h1><p className="text-sm text-muted-foreground">امتیاز بگیر، سطح بالا برو</p></div>
        <Badge variant="secondary" className="gap-1"><Star className="h-3 w-3" />{settings.persianNumbers ? toPersianDigits(`${stats.totalXp} XP`) : `${stats.totalXp} XP`}</Badge>
      </div>
      <Card className="overflow-hidden border-0 shadow-medium bg-gradient-to-br from-card via-card to-primary/5"><div className="h-1 w-full bg-gradient-to-r from-primary via-accent to-primary" /><CardContent className="p-6"><div className="flex flex-col md:flex-row gap-6 items-start"><div className="flex-1"><LevelBadge xp={stats.totalXp} size="lg" persianNumbers={settings.persianNumbers} /><div className="mt-4"><LevelProgress xp={stats.totalXp} persianNumbers={settings.persianNumbers} /></div></div><div className="grid grid-cols-2 gap-3 w-full md:w-auto"><div className="rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 p-4 text-white text-center"><Coins className="h-5 w-5 mx-auto mb-1" /><div className="font-black text-lg">{settings.persianNumbers ? toPersianDigits(stats.coins.toString()) : stats.coins}</div><div className="text-[11px] opacity-90">سکه</div></div><div className="rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 p-4 text-white text-center"><Award className="h-5 w-5 mx-auto mb-1" /><div className="font-black text-lg">{settings.persianNumbers ? toPersianDigits(unlockedCount.toString()) : unlockedCount}</div><div className="text-[11px] opacity-90">دستاورد</div></div><div className="rounded-2xl bg-secondary border p-4 text-center"><Clock className="h-5 w-5 mx-auto mb-1 text-primary" /><div className="font-black text-lg">{settings.persianNumbers ? toPersianDigits(totalHours.toString()) : totalHours}</div><div className="text-[11px] text-muted-foreground">ساعت</div></div><div className="rounded-2xl bg-secondary border p-4 text-center"><Flame className="h-5 w-5 mx-auto mb-1 text-orange-500" /><div className="font-black text-lg">{settings.persianNumbers ? toPersianDigits(stats.longestStreak.toString()) : stats.longestStreak}</div><div className="text-[11px] text-muted-foreground">بهترین استریک</div></div></div></div></CardContent></Card>
      <div className="flex gap-2 overflow-x-auto pb-2">{[{ id: 'overview', label: 'خلاصه', icon: '📊' }, { id: 'challenges', label: 'چالش‌ها', icon: '🎯' }, { id: 'achievements', label: 'دستاوردها', icon: '🏆' }, { id: 'levels', label: 'سطح‌ها', icon: '⭐' }].map(tab => (<button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap border-2 ${activeTab === tab.id ? 'bg-primary text-white border-primary shadow-soft' : 'bg-card border-border hover:border-primary/30'}`}><span>{tab.icon}</span>{tab.label}</button>))}</div>
      {activeTab === 'overview' && (<div className="space-y-4"><DailyChallenges challenges={challenges} persianNumbers={settings.persianNumbers} /><Card><CardHeader><CardTitle className="text-base flex items-center gap-2"><Zap className="h-4 w-4 text-primary" />آمار کلی</CardTitle></CardHeader><CardContent><div className="grid grid-cols-2 md:grid-cols-4 gap-3"><div className="rounded-xl bg-secondary/50 border p-3 text-center"><div className="text-2xl font-black text-primary">{settings.persianNumbers ? toPersianDigits(stats.totalSessions.toString()) : stats.totalSessions}</div><div className="text-xs text-muted-foreground mt-1">جلسه</div></div><div className="rounded-xl bg-secondary/50 border p-3 text-center"><div className="text-2xl font-black">{settings.persianNumbers ? toPersianDigits(`${Math.floor(stats.totalStudySeconds/60)}`) : Math.floor(stats.totalStudySeconds/60)}</div><div className="text-xs text-muted-foreground mt-1">دقیقه</div></div><div className="rounded-xl bg-secondary/50 border p-3 text-center"><div className="text-2xl font-black text-success">{settings.persianNumbers ? toPersianDigits(stats.totalTasksCompleted.toString()) : stats.totalTasksCompleted}</div><div className="text-xs text-muted-foreground mt-1">کار انجام شده</div></div><div className="rounded-xl bg-secondary/50 border p-3 text-center"><div className="text-2xl font-black text-orange-500">{settings.persianNumbers ? toPersianDigits(stats.currentStreak.toString()) : stats.currentStreak}</div><div className="text-xs text-muted-foreground mt-1">استریک فعلی</div></div></div></CardContent></Card></div>)}
      {activeTab === 'challenges' && <DailyChallenges challenges={challenges} persianNumbers={settings.persianNumbers} />}
      {activeTab === 'achievements' && <div className="space-y-6"><AchievementGrid achievements={achievements} persianNumbers={settings.persianNumbers} /><AchievementGrid achievements={achievements} filter="study" persianNumbers={settings.persianNumbers} /><AchievementGrid achievements={achievements} filter="time" persianNumbers={settings.persianNumbers} /><AchievementGrid achievements={achievements} filter="streak" persianNumbers={settings.persianNumbers} /><AchievementGrid achievements={achievements} filter="tasks" persianNumbers={settings.persianNumbers} /><AchievementGrid achievements={achievements} filter="special" persianNumbers={settings.persianNumbers} /></div>}
      {activeTab === 'levels' && <div className="space-y-3">{LEVELS.map(lvl => { const isCurrent = lvl.level === level.level; const isPast = lvl.level < level.level; return (<div key={lvl.level} className={`rounded-2xl border p-4 flex items-center gap-4 ${isCurrent ? 'border-primary bg-primary/5 shadow-medium scale-[1.02]' : isPast ? 'border-success/20 bg-success/5' : 'border-border bg-card opacity-60'}`}><div className="h-14 w-14 rounded-2xl flex items-center justify-center text-2xl text-white shadow-soft" style={{ background: `linear-gradient(135deg, ${lvl.color}, ${lvl.color}CC)` }}>{lvl.icon}</div><div className="flex-1"><div className="flex items-center gap-2"><span className="font-black">{lvl.title}</span><Badge variant={isCurrent ? 'default' : isPast ? 'success' : 'secondary'} className="text-[10px]">سطح {settings.persianNumbers ? toPersianDigits(lvl.level.toString()) : lvl.level}</Badge></div><div className="text-xs text-muted-foreground mt-1">{settings.persianNumbers ? toPersianDigits(`${lvl.minXp} XP`) : `${lvl.minXp} XP`} • {lvl.benefits.join(' • ')}</div></div></div>) })}</div>}
    </PageContainer>
  )
}
