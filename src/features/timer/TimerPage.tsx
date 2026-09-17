import * as React from 'react'
import { PageContainer } from '@/components/layout/AppShell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Modal, ModalFooter } from '@/components/ui/Modal'
import { useTimer } from './hooks/useTimer'
import { useSubjects } from '@/hooks/useSubjects'
import { useTasks } from '@/hooks/useTasks'
import { useSessions } from '@/hooks/useSessions'
import { formatDuration } from '@/core/utils/date/timezone'
import { useSettingsStore } from '@/app/providers'
import { Play, Pause, RotateCcw, Square, Timer as TimerIcon, BookOpen, Clock, Plus, Settings2, CheckCircle, Sparkles, Eye, Trophy, Coins, Star } from 'lucide-react'
import { toPersianDigits } from '@/core/utils/persian/numbers'
import { sessionService } from '@/core/services/sessionService'
import { gamificationService } from '@/core/services/gamificationService'
import { CircularTimer } from './components/CircularTimer'
import { useNavigate } from 'react-router-dom'
import { XpToast, LevelUpModal, AchievementUnlock } from '@/components/gamification/XpToast'
import { getLevelFromXp } from '@/core/domain/models/Gamification'

export function TimerPage() {
  const navigate = useNavigate()
  const { state, start, pause, resume, stop, reset, remaining, progress, isRunning, isPaused, isIdle, isCompleted } = useTimer()
  const { subjects, load: loadSubjects } = useSubjects()
  const { tasks, load: loadTasks } = useTasks()
  const { load: loadSessions } = useSessions()
  const { settings, updateSettings } = useSettingsStore()
  const [mode, setMode] = React.useState<'pomodoro' | 'free' | 'countdown'>('pomodoro')
  const [selectedSubject, setSelectedSubject] = React.useState<string>('')
  const [selectedTask, setSelectedTask] = React.useState<string>('')
  const [customMinutes, setCustomMinutes] = React.useState<number>(25)
  const [showSettings, setShowSettings] = React.useState(false)
  const [showManual, setShowManual] = React.useState(false)
  const [hasSavedCompleted, setHasSavedCompleted] = React.useState(false)
  const [timerSize, setTimerSize] = React.useState(320)
  const [pomodoroForm, setPomodoroForm] = React.useState({ work: settings.pomodoro.work, shortBreak: settings.pomodoro.shortBreak, longBreak: settings.pomodoro.longBreak, longBreakInterval: settings.pomodoro.longBreakInterval })
  const [manualForm, setManualForm] = React.useState({ subjectId: '', date: new Date().toISOString().split('T')[0], startTime: '08:00', duration: 60, type: 'free' as 'pomodoro' | 'free' | 'countdown', notes: '' })
  
  // گیمیفیکیشن
  const [xpToast, setXpToast] = React.useState<{ xp: number; reason: string; icon: string } | null>(null)
  const [levelUp, setLevelUp] = React.useState<{ level: number; title: string; icon: string } | null>(null)
  const [achievementToast, setAchievementToast] = React.useState<{ title: string; icon: string; xp: number; coins: number } | null>(null)
  const [sessionXp, setSessionXp] = React.useState<number | null>(null)

  React.useEffect(() => { loadSubjects(); loadTasks() }, [loadSubjects, loadTasks])
  React.useEffect(() => { if (subjects.length > 0 && !selectedSubject) { setSelectedSubject(subjects[0].id); setManualForm(f => ({ ...f, subjectId: subjects[0].id })) } }, [subjects, selectedSubject])
  React.useEffect(() => { setPomodoroForm({ work: settings.pomodoro.work, shortBreak: settings.pomodoro.shortBreak, longBreak: settings.pomodoro.longBreak, longBreakInterval: settings.pomodoro.longBreakInterval }) }, [settings.pomodoro])

  React.useEffect(() => {
    const updateSize = () => {
      if (window.innerWidth < 375) setTimerSize(260)
      else if (window.innerWidth < 640) setTimerSize(290)
      else setTimerSize(340)
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  React.useEffect(() => {
    if (state.status === 'completed' && !hasSavedCompleted && state.elapsedSeconds > 0 && state.subjectId) {
      const saveCompletedSession = async () => {
        try {
          if (hasSavedCompleted) return
          setHasSavedCompleted(true)
          
          await sessionService.create({
            subjectId: state.subjectId!,
            taskId: state.taskId,
            startTime: new Date(state.startTimestamp || Date.now() - state.elapsedSeconds * 1000).toISOString(),
            endTime: new Date().toISOString(),
            duration: state.elapsedSeconds,
            pausedDuration: state.pausedSeconds,
            type: state.mode,
            status: 'completed',
            timeline: state.timeline.map(t => ({ action: t.action, at: new Date(t.at).toISOString() }))
          })
          
          // گیمیفیکیشن - امتیاز
          const result = await gamificationService.addStudySession(state.elapsedSeconds, state.mode, state.subjectId)
          setSessionXp(result.xpGained)
          setXpToast({ xp: result.xpGained, reason: 'جلسه کامل شد', icon: '📚' })
          
          if (result.levelUp && result.newLevel) {
            const lvl = getLevelFromXp((await gamificationService.getStats()).totalXp)
            setTimeout(() => {
              setLevelUp({ level: result.newLevel!, title: lvl.title, icon: lvl.icon })
            }, 1000)
          }
          
          if (result.newAchievements.length > 0) {
            setTimeout(() => {
              const ach = result.newAchievements[0]
              setAchievementToast({ title: ach.title, icon: ach.icon, xp: ach.xpReward, coins: ach.coinReward })
            }, result.levelUp ? 2000 : 1000)
          }
          
          await loadSessions()
        } catch (e) {
          console.error('Failed to save session', e)
          setHasSavedCompleted(false)
        }
      }
      saveCompletedSession()
    }
    if (state.status === 'idle') {
      setHasSavedCompleted(false)
      setSessionXp(null)
    }
  }, [state.status, state.elapsedSeconds, state.subjectId, hasSavedCompleted, loadSessions, state.startTimestamp, state.pausedSeconds, state.mode, state.taskId, state.timeline])

  const todayTasks = tasks.filter(t => t.date === new Date().toISOString().split('T')[0])
  const handleStart = () => { 
    if (!selectedSubject) { alert('لطفاً یک درس انتخاب کنید'); return }
    const target = mode === 'free' ? 0 : mode === 'pomodoro' ? settings.pomodoro.work : customMinutes
    setHasSavedCompleted(false)
    setSessionXp(null)
    start(mode, target, selectedSubject, selectedTask || undefined) 
  }
  const handleStop = async () => { await stop(); await loadSessions() }
  const handleReset = () => { setHasSavedCompleted(false); setSessionXp(null); reset() }
  const handleSavePomodoroSettings = async () => { await updateSettings({ pomodoro: { work: pomodoroForm.work, shortBreak: pomodoroForm.shortBreak, longBreak: pomodoroForm.longBreak, longBreakInterval: pomodoroForm.longBreakInterval } }); setShowSettings(false) }
  const handleManualSubmit = async () => {
    if (!manualForm.subjectId) { alert('درس را انتخاب کنید'); return }
    try {
      const startDate = new Date(`${manualForm.date}T${manualForm.startTime}`)
      const endDate = new Date(startDate.getTime() + manualForm.duration * 60 * 1000)
      await sessionService.create({ 
        subjectId: manualForm.subjectId, 
        startTime: startDate.toISOString(), 
        endTime: endDate.toISOString(), 
        duration: manualForm.duration * 60, 
        pausedDuration: 0, 
        type: manualForm.type, 
        status: 'completed', 
        notes: manualForm.notes || `ثبت دستی - ${manualForm.duration} دقیقه`, 
        timeline: [{ action: 'start', at: startDate.toISOString() }, { action: 'stop', at: endDate.toISOString() }] 
      })
      
      const result = await gamificationService.addStudySession(manualForm.duration * 60, manualForm.type, manualForm.subjectId)
      setXpToast({ xp: result.xpGained, reason: 'ثبت دستی', icon: '✍️' })
      
      await loadSessions()
      setShowManual(false)
      setManualForm({ subjectId: subjects[0]?.id || '', date: new Date().toISOString().split('T')[0], startTime: '08:00', duration: 60, type: 'free', notes: '' })
      alert(`✓ ثبت شد! +${result.xpGained} XP`)
    } catch (e) { alert('خطا: ' + (e as Error).message) }
  }
  const currentSubject = subjects.find(s => s.id === (state.subjectId || selectedSubject))

  return (
    <PageContainer>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-medium">
            <TimerIcon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black">تایمر</h1>
            <p className="text-xs text-muted-foreground">مطالعه کن، امتیاز بگیر</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowManual(true)} className="rounded-xl shadow-soft">
            <Plus className="h-4 w-4" />ثبت دستی
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl" onClick={() => setShowSettings(true)}>
            <Settings2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="grid gap-6 max-w-3xl mx-auto">
        <Card className="overflow-hidden border-0 shadow-medium bg-gradient-to-br from-card to-primary/5">
          <div className="h-1 w-full bg-gradient-to-r from-primary via-accent to-primary" />
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-3">
              <button onClick={() => isIdle && setMode('pomodoro')} disabled={!isIdle} className={`group rounded-2xl p-4 text-sm font-bold transition-all border-2 text-center ${mode === 'pomodoro' ? 'bg-gradient-to-br from-red-500 to-orange-500 text-white border-red-500 shadow-large scale-105' : 'bg-card border-border hover:border-primary/50 hover:shadow-soft hover:-translate-y-0.5'} ${!isIdle ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <div className={`mx-auto h-10 w-10 rounded-xl flex items-center justify-center mb-2 transition-transform group-hover:scale-110 ${mode === 'pomodoro' ? 'bg-white/20' : 'bg-primary/10'}`}>
                  <TimerIcon className={`h-6 w-6 ${mode === 'pomodoro' ? 'text-white' : 'text-primary'}`} />
                </div>
                پومودورو
                <div className={`text-xs mt-1 ${mode === 'pomodoro' ? 'text-white/80' : 'text-muted-foreground'}`}>{toPersianDigits(settings.pomodoro.work.toString())} دقیقه • +20٪ XP</div>
              </button>
              <button onClick={() => isIdle && setMode('countdown')} disabled={!isIdle} className={`group rounded-2xl p-4 text-sm font-bold transition-all border-2 text-center ${mode === 'countdown' ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-blue-500 shadow-large scale-105' : 'bg-card border-border hover:border-primary/50 hover:shadow-soft hover:-translate-y-0.5'} ${!isIdle ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <div className={`mx-auto h-10 w-10 rounded-xl flex items-center justify-center mb-2 transition-transform group-hover:scale-110 ${mode === 'countdown' ? 'bg-white/20' : 'bg-blue-500/10'}`}>
                  <Clock className={`h-6 w-6 ${mode === 'countdown' ? 'text-white' : 'text-blue-500'}`} />
                </div>
                معکوس
                <div className={`text-xs mt-1 ${mode === 'countdown' ? 'text-white/80' : 'text-muted-foreground'}`}>قابل تنظیم • +10٪</div>
              </button>
              <button onClick={() => isIdle && setMode('free')} disabled={!isIdle} className={`group rounded-2xl p-4 text-sm font-bold transition-all border-2 text-center ${mode === 'free' ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white border-green-500 shadow-large scale-105' : 'bg-card border-border hover:border-primary/50 hover:shadow-soft hover:-translate-y-0.5'} ${!isIdle ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <div className={`mx-auto h-10 w-10 rounded-xl flex items-center justify-center mb-2 transition-transform group-hover:scale-110 ${mode === 'free' ? 'bg-white/20' : 'bg-green-500/10'}`}>
                  <BookOpen className={`h-6 w-6 ${mode === 'free' ? 'text-white' : 'text-green-500'}`} />
                </div>
                آزاد
                <div className={`text-xs mt-1 ${mode === 'free' ? 'text-white/80' : 'text-muted-foreground'}`}>بدون محدودیت</div>
              </button>
            </div>
          </CardContent>
        </Card>

        {isIdle && (
          <Card className="border-0 shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>
                تنظیمات جلسه
                <Badge variant="secondary" className="mr-auto">تجربی 🧬</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select label="درس" value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} options={subjects.map(s => ({ value: s.id, label: `${s.name} ${s.nameEn ? `(${s.nameEn})` : ''}`.trim() }))} placeholder="انتخاب درس" />
              {todayTasks.length > 0 && <Select label="کار مرتبط (اختیاری)" value={selectedTask} onChange={(e) => setSelectedTask(e.target.value)} options={[{ value: '', label: 'بدون کار - مطالعه آزاد' }, ...todayTasks.map(t => ({ value: t.id, label: t.topic }))]} />}
              {mode === 'countdown' && (
                <div className="space-y-3">
                  <label className="text-sm font-bold">مدت زمان</label>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                    {[15, 25, 45, 60, 90, 120].map(m => (
                      <Button key={m} variant={customMinutes === m ? 'primary' : 'secondary'} size="sm" onClick={() => setCustomMinutes(m)} className="flex-col h-auto py-3 rounded-xl">
                        <span className="text-base font-black">{toPersianDigits(m.toString())}</span>
                        <span className="text-xs">دقیقه</span>
                      </Button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <Input type="number" placeholder="دقیقه دلخواه" value={customMinutes.toString()} onChange={(e) => setCustomMinutes(parseInt(e.target.value) || 25)} className="flex-1 rounded-xl" />
                    <span className="text-sm text-muted-foreground">دقیقه</span>
                  </div>
                </div>
              )}
              {mode === 'pomodoro' && (
                <div className="rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10 p-4 space-y-3">
                  <p className="text-sm font-bold flex items-center gap-2">🍅 پومودورو<Sparkles className="h-4 w-4 text-primary" /></p>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="rounded-xl bg-card border p-2.5">کار: <strong className="text-primary">{toPersianDigits(settings.pomodoro.work.toString())} دقیقه</strong></div>
                    <div className="rounded-xl bg-card border p-2.5">استراحت کوتاه: <strong>{toPersianDigits(settings.pomodoro.shortBreak.toString())} دقیقه</strong></div>
                    <div className="rounded-xl bg-card border p-2.5">استراحت طولانی: <strong>{toPersianDigits(settings.pomodoro.longBreak.toString())} دقیقه</strong></div>
                    <div className="rounded-xl bg-card border p-2.5">هر <strong className="text-primary">{toPersianDigits(settings.pomodoro.longBreakInterval.toString())}</strong> پومودورو</div>
                  </div>
                  <Button variant="ghost" size="sm" className="w-full mt-2 rounded-xl" onClick={() => setShowSettings(true)}>
                    <Settings2 className="h-4 w-4" />تغییر تنظیمات
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="text-center overflow-hidden shadow-large border-0 bg-gradient-to-br from-card via-card to-primary/5">
          {currentSubject && <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${currentSubject.color}, hsl(var(--accent)))` }} />}
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2 flex-wrap">
              {currentSubject ? (
                <>
                  <span className="h-3 w-3 rounded-full animate-pulse shadow-soft" style={{ backgroundColor: currentSubject.color }} />
                  {currentSubject.name}
                </>
              ) : 'تایمر'}
              <Badge variant="secondary" className="gap-1 rounded-full">{mode === 'pomodoro' ? '🍅 پومودورو' : mode === 'countdown' ? '⏱️ معکوس' : '📚 آزاد'}</Badge>
              {hasSavedCompleted && isCompleted && <Badge variant="success" className="gap-1"><CheckCircle className="h-3 w-3" />ذخیره شد</Badge>}
              {sessionXp && isCompleted && (
                <Badge className="gap-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0">
                  <Star className="h-3 w-3" />+{toPersianDigits(sessionXp.toString())} XP
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 pb-8">
            {/* تایمر اصلی - بدون تداخل */}
            <div className="py-6 flex justify-center">
              <CircularTimer 
                progress={progress} 
                remaining={remaining} 
                elapsed={state.elapsedSeconds} 
                mode={state.mode || mode} 
                isRunning={isRunning} 
                isPaused={isPaused} 
                isCompleted={isCompleted} 
                subjectColor={currentSubject?.color} 
                subjectName={currentSubject?.name} 
                persianNumbers={settings.persianNumbers} 
                size={timerSize} 
              />
            </div>

            {/* دکمه‌های کنترل - لوگوی بزرگ و زیبا */}
            <div className="flex justify-center items-center gap-5">
              {isIdle && (
                <button onClick={handleStart} className="play-button-large group">
                  <Play className="group-hover:scale-110 transition-transform" />
                  <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
                </button>
              )}
              {isRunning && (
                <>
                  <button onClick={pause} className="play-button-large pause group hover:scale-105 transition-transform">
                    <Pause />
                  </button>
                  <button onClick={handleStop} className="h-14 w-14 rounded-full border-2 border-border bg-card hover:bg-destructive hover:text-destructive-foreground hover:border-destructive shadow-soft flex items-center justify-center transition-all hover:scale-105">
                    <Square className="h-5 w-5 fill-current" />
                  </button>
                </>
              )}
              {isPaused && (
                <>
                  <button onClick={resume} className="play-button-large group">
                    <Play className="group-hover:scale-110 transition-transform" />
                  </button>
                  <button onClick={handleReset} className="h-14 w-14 rounded-full bg-secondary border-2 border-border shadow-soft flex items-center justify-center hover:scale-105 transition-transform">
                    <RotateCcw className="h-5 w-5" />
                  </button>
                  <button onClick={handleStop} className="h-14 w-14 rounded-full border-2 border-border bg-card hover:bg-destructive hover:text-destructive-foreground shadow-soft flex items-center justify-center transition-all hover:scale-105">
                    <Square className="h-5 w-5 fill-current" />
                  </button>
                </>
              )}
              {isCompleted && (
                <div className="space-y-5 animate-fade-in w-full">
                  <div className="text-center">
                    <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-success/20 to-emerald-500/20 flex items-center justify-center mb-4 border-2 border-success/20 shadow-soft animate-bounce">
                      <Trophy className="h-10 w-10 text-success" />
                    </div>
                    <p className="text-success font-black text-xl">آفرین! تمام شد 🎉</p>
                    <p className="text-sm text-muted-foreground mt-2 bg-secondary px-4 py-2 rounded-full inline-block">
                      {formatDuration(state.elapsedSeconds, settings.persianNumbers, true)} مطالعه شد
                      {sessionXp && ` • +${toPersianDigits(sessionXp.toString())} XP`}
                      {hasSavedCompleted && ' • ✅ ذخیره شد'}
                    </p>
                    {sessionXp && (
                      <div className="mt-3 flex items-center justify-center gap-2">
                        <div className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold flex items-center gap-1">
                          <Star className="h-3 w-3" />+{toPersianDigits(sessionXp.toString())} امتیاز
                        </div>
                        <div className="px-3 py-1 rounded-full bg-violet-50 border border-violet-200 text-violet-700 text-xs font-bold flex items-center gap-1">
                          <Coins className="h-3 w-3" />+{toPersianDigits(Math.floor(sessionXp*0.5).toString())} سکه
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3 justify-center flex-wrap">
                    <Button onClick={handleReset} size="lg" className="rounded-xl shadow-medium bg-gradient-to-br from-primary to-accent">
                      <RotateCcw className="h-5 w-5" />دوباره
                    </Button>
                    <Button variant="secondary" onClick={() => navigate('/sessions')} className="rounded-xl shadow-soft">
                      <Eye className="h-5 w-5" />جلسات
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/gamification')} className="rounded-xl">
                      <Trophy className="h-5 w-5" />امتیازها
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {isIdle && (
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/10 p-4 hover:shadow-soft transition-shadow">
                  <div className="text-2xl font-black text-primary">{toPersianDigits(settings.pomodoro.work.toString())}</div>
                  <div className="text-xs text-muted-foreground mt-1">دقیقه کار</div>
                </div>
                <div className="rounded-2xl bg-secondary border p-4 hover:shadow-soft transition-shadow">
                  <div className="text-2xl font-black">{toPersianDigits(customMinutes.toString())}</div>
                  <div className="text-xs text-muted-foreground mt-1">سفارشی</div>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-success/10 to-emerald-500/10 border border-success/10 p-4 hover:shadow-soft transition-shadow">
                  <div className="text-2xl font-black text-success">∞</div>
                  <div className="text-xs text-muted-foreground mt-1">آزاد</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 shadow-soft">
          <CardContent className="p-5">
            <h3 className="font-black text-sm mb-3 flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center">💡</div>
              نکته
              <Badge variant="secondary" className="mr-auto text-[10px]">XP بیشتر</Badge>
            </h3>
            <ul className="text-xs text-muted-foreground space-y-2">
              <li className="flex gap-2"><span className="text-primary">•</span> پومودورو ۲۰٪ امتیاز بیشتر می‌دهد</li>
              <li className="flex gap-2"><span className="text-primary">•</span> استریک ۷ روزه، ۲۰٪ پاداش اضافه</li>
              <li className="flex gap-2"><span className="text-success">•</span> هر جلسه = سکه + دستاورد جدید!</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Modal open={showSettings} onClose={() => setShowSettings(false)} title="تنظیمات تایمر" description="زمان‌ها را شخصی‌سازی کن">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="کار (دقیقه)" type="number" value={pomodoroForm.work.toString()} onChange={e => setPomodoroForm({ ...pomodoroForm, work: parseInt(e.target.value) || 25 })} />
            <Input label="استراحت کوتاه" type="number" value={pomodoroForm.shortBreak.toString()} onChange={e => setPomodoroForm({ ...pomodoroForm, shortBreak: parseInt(e.target.value) || 5 })} />
            <Input label="استراحت طولانی" type="number" value={pomodoroForm.longBreak.toString()} onChange={e => setPomodoroForm({ ...pomodoroForm, longBreak: parseInt(e.target.value) || 15 })} />
            <Input label="هر چند پومودورو؟" type="number" value={pomodoroForm.longBreakInterval.toString()} onChange={e => setPomodoroForm({ ...pomodoroForm, longBreakInterval: parseInt(e.target.value) || 4 })} />
          </div>
        </div>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowSettings(false)}>انصراف</Button>
          <Button onClick={handleSavePomodoroSettings} className="bg-gradient-to-br from-primary to-accent">ذخیره</Button>
        </ModalFooter>
      </Modal>

      <Modal open={showManual} onClose={() => setShowManual(false)} title="ثبت دستی" description="اگر قبلاً مطالعه کردی" size="lg">
        <div className="space-y-4">
          <Select label="درس" value={manualForm.subjectId} onChange={e => setManualForm({ ...manualForm, subjectId: e.target.value })} options={subjects.map(s => ({ value: s.id, label: s.name }))} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="تاریخ" type="date" value={manualForm.date} onChange={e => setManualForm({ ...manualForm, date: e.target.value })} />
            <Input label="ساعت شروع" type="time" value={manualForm.startTime} onChange={e => setManualForm({ ...manualForm, startTime: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="مدت (دقیقه)" type="number" value={manualForm.duration.toString()} onChange={e => setManualForm({ ...manualForm, duration: parseInt(e.target.value) || 60 })} />
            <Select label="نوع" value={manualForm.type} onChange={e => setManualForm({ ...manualForm, type: e.target.value as any })} options={[{ value: 'free', label: 'آزاد' }, { value: 'pomodoro', label: 'پومودورو' }, { value: 'countdown', label: 'معکوس' }]} />
          </div>
          <Textarea label="یادداشت" placeholder="مثلا: فصل ۳ زیست - ۲۰ تست" value={manualForm.notes} onChange={e => setManualForm({ ...manualForm, notes: e.target.value })} />
        </div>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowManual(false)}>انصراف</Button>
          <Button onClick={handleManualSubmit} className="bg-gradient-to-br from-primary to-accent">ثبت + XP</Button>
        </ModalFooter>
      </Modal>

      {xpToast && (
        <XpToast xp={xpToast.xp} reason={xpToast.reason} icon={xpToast.icon} persianNumbers={settings.persianNumbers} onClose={() => setXpToast(null)} />
      )}
      {levelUp && (
        <LevelUpModal newLevel={levelUp.level} title={levelUp.title} icon={levelUp.icon} persianNumbers={settings.persianNumbers} onClose={() => setLevelUp(null)} />
      )}
      {achievementToast && (
        <AchievementUnlock achievement={{ title: achievementToast.title, icon: achievementToast.icon, xpReward: achievementToast.xp, coinReward: achievementToast.coins }} persianNumbers={settings.persianNumbers} onClose={() => setAchievementToast(null)} />
      )}
    </PageContainer>
  )
}
