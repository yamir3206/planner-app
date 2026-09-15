import * as React from 'react'
import { PageContainer } from '@/components/layout/AppShell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CircularProgress, Progress } from '@/components/ui/Progress'
import { Badge } from '@/components/ui/Badge'
import { formatJalali, getTodayString } from '@/core/utils/date/jalali'
import { formatMinutes } from '@/core/utils/date/timezone'
import { useSettingsStore } from '@/app/providers'
import { useTasks } from '@/hooks/useTasks'
import { useSubjects } from '@/hooks/useSubjects'
import { useSessions } from '@/hooks/useSessions'
import { useStreak } from '@/hooks/useStreak'
import { analyticsService } from '@/core/services/analyticsService'
import { CrossPlatformInfo } from '@/components/common/CrossPlatformInfo'
import { Play, Flame, BookOpen, Target, Clock, TrendingUp, CheckCircle2, Sparkles, Zap, Award } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toPersianDigits } from '@/core/utils/persian/numbers'

export function DashboardPage() {
  const navigate = useNavigate()
  const { settings } = useSettingsStore()
  const { tasks, load: loadTasks } = useTasks()
  const { subjects, load: loadSubjects } = useSubjects()
  const { sessions, load: loadSessions } = useSessions()
  const { current: streakCurrent, load: loadStreak } = useStreak()
  const [weeklyStats, setWeeklyStats] = React.useState<{ date: string; duration: number }[]>([])
  const today = new Date()
  const todayStr = getTodayString()

  React.useEffect(() => { loadTasks(); loadSubjects(); loadSessions(); loadStreak(); analyticsService.getDailyStats(7).then(setWeeklyStats) }, [loadTasks, loadSubjects, loadSessions, loadStreak])
  const todayTasks = tasks.filter(t => t.date === todayStr)
  const doneToday = todayTasks.filter(t => t.status === 'done').length
  const todaySessions = sessions.filter(s => { const d = new Date(s.startTime).toISOString().split('T')[0]; return d === todayStr && s.status === 'completed' })
  const totalSecondsToday = todaySessions.reduce((sum, s) => sum + s.duration, 0)
  const totalMinutesToday = Math.floor(totalSecondsToday / 60)
  const progressToday = settings.dailyTargetMinutes > 0 ? Math.min(100, (totalMinutesToday / settings.dailyTargetMinutes) * 100) : 0
  const nextTask = todayTasks.find(t => t.status === 'todo' || t.status === 'in_progress')
  const weeklyTotal = weeklyStats.reduce((sum, s) => sum + s.duration, 0)
  const weeklyMinutes = Math.floor(weeklyTotal / 60)

  return (
    <PageContainer>
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-accent p-[1px]">
        <div className="rounded-[23px] bg-gradient-to-br from-card via-card to-primary/5 p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1"><h1 className="text-3xl md:text-4xl font-black flex items-center gap-3">سلام! 👋<Sparkles className="h-7 w-7 text-warning animate-pulse" /></h1><p className="text-muted-foreground mt-2 flex items-center gap-2 flex-wrap">{formatJalali(today, { includeWeekday: true })} — آماده‌ای بترکونی؟<Badge variant="secondary" className="gap-1"><Zap className="h-3 w-3" />تجربی 🧬</Badge><Badge variant="outline" className="gap-1">همگام ✓</Badge></p></div>
            <div className="flex items-center gap-3"><div className="hidden md:flex items-center gap-2 rounded-full bg-success/10 border border-success/20 px-4 py-2"><div className="h-2 w-2 bg-success rounded-full animate-pulse" /><span className="text-xs font-medium text-success">آنلاین • همه دستگاه‌ها</span></div><Button onClick={() => navigate('/timer')} size="lg" className="rounded-2xl shadow-large bg-gradient-to-br from-primary to-accent hover:scale-105 transition-transform"><Play className="h-5 w-5 fill-white" fill="white" />شروع مطالعه</Button></div>
          </div>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2 overflow-hidden shadow-medium border-0 bg-gradient-to-br from-card to-primary/5"><CardHeader><CardTitle className="flex items-center gap-2"><div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white"><Target className="h-4 w-4" /></div>هدف امروز<Badge variant="secondary" className="mr-2">{progressToday >= 100 ? '🎉 کامل' : `${toPersianDigits(Math.round(progressToday).toString())}٪`}</Badge></CardTitle></CardHeader><CardContent><div className="flex items-center justify-between gap-6"><div className="space-y-5 flex-1"><div className="grid grid-cols-2 gap-4"><div className="rounded-2xl bg-secondary/50 border p-4"><p className="text-xs text-muted-foreground">هدف</p><p className="text-xl font-black mt-1">{formatMinutes(settings.dailyTargetMinutes, settings.persianNumbers)}</p></div><div className="rounded-2xl bg-primary/5 border border-primary/10 p-4"><p className="text-xs text-muted-foreground">مطالعه شده</p><p className="text-xl font-black mt-1 text-primary">{formatMinutes(totalMinutesToday, settings.persianNumbers)}</p></div></div><Progress value={progressToday} size="lg" className="mt-2" variant={progressToday >= 100 ? 'success' : 'default'} showLabel /><Button onClick={() => navigate('/timer')} className="w-full rounded-xl shadow-soft bg-gradient-to-br from-primary to-accent"><Play className="h-5 w-5 fill-white" fill="white" />شروع مطالعه</Button></div><div className="hidden sm:block"><CircularProgress value={progressToday} size={140} strokeWidth={10} /></div></div></CardContent></Card>
        <div className="space-y-4"><Card className="shadow-soft border-0 hover:shadow-medium transition-shadow"><CardContent className="p-4 flex items-center gap-3"><div className="rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 p-3 shadow-soft"><Flame className="h-6 w-6 text-white" /></div><div><p className="text-sm text-muted-foreground">پیوستگی</p><p className="font-black">{toPersianDigits(streakCurrent.toString())} روز پیاپی 🔥</p></div></CardContent></Card><Card className="shadow-soft border-0 hover:shadow-medium transition-shadow"><CardContent className="p-4 flex items-center gap-3"><div className="rounded-2xl bg-gradient-to-br from-primary to-accent p-3 shadow-soft"><BookOpen className="h-6 w-6 text-white" /></div><div><p className="text-sm text-muted-foreground">کارهای امروز</p><p className="font-black">{toPersianDigits(doneToday.toString())} از {toPersianDigits(todayTasks.length.toString())} انجام شده</p></div></CardContent></Card><Card className="shadow-soft border-0 hover:shadow-medium transition-shadow"><CardContent className="p-4 flex items-center gap-3"><div className="rounded-2xl bg-gradient-to-br from-success to-emerald-600 p-3 shadow-soft"><Clock className="h-6 w-6 text-white" /></div><div><p className="text-sm text-muted-foreground">جلسات امروز</p><p className="font-black">{toPersianDigits(todaySessions.length.toString())} جلسه</p></div></CardContent></Card></div>
      </div>
      <div className="grid gap-4 md:grid-cols-2"><Card className="shadow-soft border-0"><CardHeader><CardTitle className="flex items-center gap-2 text-base"><div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center"><TrendingUp className="h-4 w-4 text-primary" /></div>هفته گذشته (شنبه تا جمعه)</CardTitle></CardHeader><CardContent><div className="space-y-3"><div className="flex justify-between text-sm"><span className="text-muted-foreground">مجموع مطالعه</span><span className="font-black">{formatMinutes(weeklyMinutes, settings.persianNumbers)}</span></div><div className="flex gap-1 h-16 items-end">{weeklyStats.map((stat) => { const max = Math.max(...weeklyStats.map(s => s.duration), 1); const height = (stat.duration / max) * 100; const isToday = stat.date === todayStr; return <div key={stat.date} className="flex-1 flex flex-col items-center gap-1"><div className={`w-full rounded-full transition-all duration-700 ${isToday ? 'bg-gradient-to-t from-primary to-accent shadow-soft' : 'bg-primary/20'}`} style={{ height: `${height}%`, minHeight: stat.duration > 0 ? '12px' : '4px' }} /><span className="text-[10px] text-muted-foreground font-medium">{formatJalali(new Date(stat.date)).split(' ')[0].slice(0, 2)}</span></div> })}</div></div></CardContent></Card><Card className="shadow-soft border-0 bg-gradient-to-br from-card to-accent/5"><CardHeader><CardTitle className="text-base flex items-center gap-2"><Award className="h-5 w-5 text-primary" />برنامه بعدی</CardTitle></CardHeader><CardContent>{nextTask ? <div className="space-y-3"><div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-primary animate-pulse" /><p className="font-bold">{nextTask.topic}</p></div><div className="flex items-center gap-2 text-sm text-muted-foreground">{subjects.find(s => s.id === nextTask.subjectId) && <><span className="h-2 w-2 rounded-full" style={{ backgroundColor: subjects.find(s => s.id === nextTask.subjectId)?.color }} />{subjects.find(s => s.id === nextTask.subjectId)?.name}</>}<span>•</span><span>{toPersianDigits(nextTask.plannedDuration.toString())} دقیقه</span></div><Button size="sm" className="w-full rounded-xl bg-gradient-to-br from-primary to-accent shadow-soft" onClick={() => navigate('/timer')}><Play className="h-4 w-4 fill-white" fill="white" />شروع مطالعه</Button></div> : <div className="text-center py-8"><div className="mx-auto h-12 w-12 rounded-2xl bg-success/10 flex items-center justify-center mb-3"><CheckCircle2 className="h-6 w-6 text-success" /></div><p className="text-sm font-bold">همه کارهای امروز انجام شد!</p><p className="text-xs text-muted-foreground mt-1">عالی بودی 👏</p></div>}</CardContent></Card></div>
      {subjects.length > 0 && <Card className="shadow-soft border-0 bg-gradient-to-br from-card to-secondary/20"><CardHeader><CardTitle className="text-base flex items-center gap-2"><div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center"><BookOpen className="h-4 w-4 text-primary" /></div>درس‌های تجربی<Badge variant="secondary">{subjects.length} درس</Badge></CardTitle></CardHeader><CardContent><div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">{subjects.map(subject => { const subjectTasks = tasks.filter(t => t.subjectId === subject.id); const done = subjectTasks.filter(t => t.status === 'done').length; const progress = subjectTasks.length > 0 ? (done / subjectTasks.length) * 100 : 0; return <div key={subject.id} className="group rounded-2xl border bg-card p-4 space-y-3 hover:shadow-medium hover:-translate-y-1 transition-all duration-300"><div className="flex items-center gap-2"><div className="h-8 w-8 rounded-xl flex items-center justify-center text-white shadow-soft group-hover:scale-110 transition-transform" style={{ backgroundColor: subject.color }}><BookOpen className="h-4 w-4" /></div><span className="text-sm font-bold truncate flex-1">{subject.name}</span></div><Progress value={progress} size="sm" /><div className="flex justify-between items-center"><p className="text-xs text-muted-foreground">{toPersianDigits(done.toString())}/{toPersianDigits(subjectTasks.length.toString())}</p><Badge variant={progress === 100 ? 'success' : 'secondary'} className="text-[10px] px-1.5">{toPersianDigits(Math.round(progress).toString())}٪</Badge></div></div> })}</div></CardContent></Card>}
      <CrossPlatformInfo />
    </PageContainer>
  )
}
