import * as React from 'react'
import { PageContainer } from '@/components/layout/AppShell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useTasks } from '@/hooks/useTasks'
import { useSubjects } from '@/hooks/useSubjects'
import { getTodayString, formatJalali, addDays, getWeekStart } from '@/core/utils/date/jalali'
import { toPersianDigits } from '@/core/utils/persian/numbers'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'

type ViewMode = 'day' | 'week' | 'month'

export function CalendarPage() {
  const { tasks, load } = useTasks()
  const { subjects, load: loadSubjects } = useSubjects()
  const [view, setView] = React.useState<ViewMode>('week')
  const [currentDate, setCurrentDate] = React.useState(new Date())

  React.useEffect(() => { load(); loadSubjects() }, [])

  const getDatesForView = (): Date[] => {
    if (view === 'day') return [currentDate]
    if (view === 'week') { const sat = getWeekStart(currentDate); return Array.from({ length: 7 }).map((_, i) => addDays(sat, i)) }
    const first = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const sat = getWeekStart(first)
    return Array.from({ length: 35 }).map((_, i) => addDays(sat, i))
  }

  const dates = getDatesForView()
  const navigate = (dir: number) => {
    if (view === 'day') setCurrentDate(addDays(currentDate, dir))
    else if (view === 'week') setCurrentDate(addDays(currentDate, dir * 7))
    else setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + dir, 1))
  }
  const getTasksForDate = (date: Date) => { try { const dateStr = date.toISOString().split('T')[0]; return tasks.filter(t => t.date === dateStr) } catch { return [] } }

  return (
    <PageContainer>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h1 className="text-2xl font-bold">تقویم</h1><p className="text-xs text-muted-foreground">هفته از شنبه تا جمعه</p></div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border overflow-hidden">{(['day', 'week', 'month'] as ViewMode[]).map((v) => (<button key={v} onClick={() => setView(v)} className={`px-3 py-1.5 text-sm font-medium ${view === v ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}>{v === 'day' ? 'روز' : v === 'week' ? 'هفته' : 'ماه'}</button>))}</div>
          <Button variant="secondary" size="icon" className="h-9 w-9" onClick={() => navigate(-1)}><ChevronRight className="h-4 w-4" /></Button>
          <Button variant="secondary" size="icon" className="h-9 w-9" onClick={() => navigate(1)}><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>امروز</Button>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><CalendarDays className="h-5 w-5" />{view === 'month' ? formatJalali(currentDate).split(' ').slice(1).join(' ') : formatJalali(currentDate, { includeWeekday: true })}</CardTitle></CardHeader>
        <CardContent>
          <div className={`grid gap-2 ${view === 'day' ? 'grid-cols-1' : 'grid-cols-7'}`}>
            {view !== 'day' && <>{['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'].map((day, idx) => (<div key={day} className={`text-center text-xs font-bold py-2 ${idx === 6 ? 'text-destructive' : 'text-muted-foreground'}`}>{day}</div>))}</>}
            {dates.map((date) => {
              const dateStr = (() => { try { return date.toISOString().split('T')[0] } catch { return '' } })()
              const isToday = dateStr === getTodayString()
              const isCurrentMonth = date.getMonth() === currentDate.getMonth()
              const dayTasks = getTasksForDate(date)
              const isFriday = date.getDay() === 5
              return (
                <div key={dateStr} className={`rounded-xl border p-2 min-h-[100px] ${isToday ? 'border-primary bg-primary/5' : isCurrentMonth || view !== 'month' ? 'bg-card' : 'bg-secondary/30 opacity-60'} ${isFriday ? 'bg-amber-50/30 dark:bg-amber-950/10' : ''}`}>
                  <div className="flex items-center justify-between mb-2"><span className={`text-sm font-medium ${isToday ? 'bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center' : isFriday ? 'text-amber-700' : ''}`}>{toPersianDigits(formatJalali(date).split(' ')[0])}</span>{dayTasks.length > 0 && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{toPersianDigits(dayTasks.length.toString())}</Badge>}</div>
                  <div className="space-y-1">{dayTasks.slice(0, view === 'day' ? 10 : 3).map((task) => { const subject = subjects.find(s => s.id === task.subjectId); return (<div key={task.id} className="text-[11px] rounded px-1.5 py-1 truncate flex items-center gap-1" style={{ backgroundColor: subject ? `${subject.color}20` : '#6366F120', color: subject?.color }}><span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: subject?.color || '#6366F1' }} /><span className="truncate">{task.topic}</span></div>) })}{dayTasks.length > (view === 'day' ? 10 : 3) && <div className="text-[10px] text-muted-foreground text-center">+{toPersianDigits((dayTasks.length - (view === 'day' ? 10 : 3)).toString())} بیشتر</div>}</div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  )
}
