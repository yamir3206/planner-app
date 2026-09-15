import * as React from 'react'
import { PageContainer } from '@/components/layout/AppShell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { EmptyState } from '@/components/ui/EmptyState'
import { useTasks } from '@/hooks/useTasks'
import { useSubjects } from '@/hooks/useSubjects'
import { useSessions } from '@/hooks/useSessions'
import { getTodayString, formatJalali } from '@/core/utils/date/jalali'
import { formatMinutes } from '@/core/utils/date/timezone'
import { useSettingsStore } from '@/app/providers'
import { ClipboardList, Play, CheckCircle2, Clock, Flame } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toPersianDigits } from '@/core/utils/persian/numbers'

export function TodayPage() {
  const navigate = useNavigate()
  const { tasks, load, toggleStatus } = useTasks()
  const { subjects, load: loadSubjects } = useSubjects()
  const { sessions, load: loadSessions } = useSessions()
  const { settings } = useSettingsStore()
  const todayStr = getTodayString()

  React.useEffect(() => {
    load()
    loadSubjects()
    loadSessions()
  }, [load, loadSubjects, loadSessions])

  const todayTasks = tasks.filter(t => t.date === todayStr)
  const doneTasks = todayTasks.filter(t => t.status === 'done')
  const progress = todayTasks.length > 0 ? (doneTasks.length / todayTasks.length) * 100 : 0

  const todaySessions = sessions.filter(s => {
    const d = new Date(s.startTime).toISOString().split('T')[0]
    return d === todayStr && s.status === 'completed'
  })
  const totalStudySeconds = todaySessions.reduce((sum, s) => sum + s.duration, 0)
  const totalStudyMinutes = Math.floor(totalStudySeconds / 60)

  const nextTask = todayTasks.find(t => t.status === 'todo' || t.status === 'in_progress')

  return (
    <PageContainer>
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">امروز</h1>
        <p className="text-sm text-muted-foreground">{formatJalali(new Date(), { includeWeekday: true })}</p>
      </div>

      <div className="grid gap-3 grid-cols-2">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              مطالعه امروز
            </div>
            <p className="text-lg font-bold mt-1">{formatMinutes(totalStudyMinutes, settings.persianNumbers)}</p>
            <Progress value={settings.dailyTargetMinutes > 0 ? (totalStudyMinutes / settings.dailyTargetMinutes) * 100 : 0} size="sm" className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4" />
              کارهای انجام شده
            </div>
            <p className="text-lg font-bold mt-1">{settings.persianNumbers ? toPersianDigits(`${doneTasks.length} از ${todayTasks.length}`) : `${doneTasks.length} / ${todayTasks.length}`}</p>
            <Progress value={progress} size="sm" className="mt-2" variant={progress === 100 ? 'success' : 'default'} />
          </CardContent>
        </Card>
      </div>

      {nextTask && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Flame className="h-4 w-4 text-primary" />
              کار بعدی
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="font-medium">{nextTask.topic}</p>
              <p className="text-xs text-muted-foreground">{subjects.find(s => s.id === nextTask.subjectId)?.name}</p>
            </div>
            <Button size="sm" onClick={() => navigate('/timer')}>
              <Play className="h-4 w-4 fill-white" fill="white" />
              شروع
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>برنامه امروز</CardTitle>
          <Badge variant="secondary">{settings.persianNumbers ? toPersianDigits(`${todayTasks.length} کار`) : `${todayTasks.length} کار`}</Badge>
        </CardHeader>
        <CardContent>
          {todayTasks.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="کاری برای امروز نداری"
              description="از بخش برنامه‌ریز، کارهای امروزت رو اضافه کن"
              action={{ label: 'رفتن به برنامه‌ریز', onClick: () => navigate('/planner') }}
            />
          ) : (
            <div className="space-y-2">
              {todayTasks.map(task => {
                const subject = subjects.find(s => s.id === task.subjectId)
                return (
                  <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors">
                    <button onClick={() => toggleStatus(task.id)}>
                      {task.status === 'done' ? (
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate ${task.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>
                        {task.topic}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {subject && (
                          <span className="flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: subject.color }} />
                            {subject.name}
                          </span>
                        )}
                        <span>{settings.persianNumbers ? toPersianDigits(`${task.plannedDuration} دقیقه`) : `${task.plannedDuration} دقیقه`}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/timer')}>
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  )
}
