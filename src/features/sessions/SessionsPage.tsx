import * as React from 'react'
import { PageContainer } from '@/components/layout/AppShell'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Modal, ModalFooter } from '@/components/ui/Modal'
import { useSessions } from '@/hooks/useSessions'
import { useSubjects } from '@/hooks/useSubjects'
import { formatJalali } from '@/core/utils/date/jalali'
import { formatDuration } from '@/core/utils/date/timezone'
import { useSettingsStore } from '@/app/providers'
import { History, Clock, Trash2, Plus, Edit2 } from 'lucide-react'
import { toPersianDigits } from '@/core/utils/persian/numbers'
import { sessionService } from '@/core/services/sessionService'

export function SessionsPage() {
  const { sessions, loading, load, remove } = useSessions()
  const { subjects, load: loadSubjects } = useSubjects()
  const { settings } = useSettingsStore()
  const [showManual, setShowManual] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [manualForm, setManualForm] = React.useState({
    subjectId: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '08:00',
    duration: 60,
    type: 'free' as 'pomodoro' | 'free' | 'countdown',
    notes: ''
  })

  React.useEffect(() => {
    load()
    loadSubjects()
  }, [load, loadSubjects])

  React.useEffect(() => {
    if (subjects.length > 0 && !manualForm.subjectId) {
      setManualForm(f => ({ ...f, subjectId: subjects[0].id }))
    }
  }, [subjects, manualForm.subjectId])

  const sortedSessions = React.useMemo(() => {
    return [...sessions].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
  }, [sessions])

  const groupedByDate = React.useMemo(() => {
    const groups: Record<string, typeof sortedSessions> = {}
    sortedSessions.forEach(s => {
      const dateStr = new Date(s.startTime).toISOString().split('T')[0]
      if (!groups[dateStr]) groups[dateStr] = []
      groups[dateStr].push(s)
    })
    return groups
  }, [sortedSessions])

  const handleManualSubmit = async () => {
    if (!manualForm.subjectId) {
      alert('درس را انتخاب کنید')
      return
    }
    try {
      const startDate = new Date(`${manualForm.date}T${manualForm.startTime}`)
      const endDate = new Date(startDate.getTime() + manualForm.duration * 60 * 1000)

      if (editingId) {
        // Update existing
        await sessionService.delete(editingId)
      }

      await sessionService.create({
        subjectId: manualForm.subjectId,
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        duration: manualForm.duration * 60,
        pausedDuration: 0,
        type: manualForm.type,
        status: 'completed',
        notes: manualForm.notes || `ثبت دستی - ${manualForm.duration} دقیقه`,
        timeline: [
          { action: 'start', at: startDate.toISOString() },
          { action: 'stop', at: endDate.toISOString() }
        ]
      })

      await load()
      setShowManual(false)
      setEditingId(null)
      setManualForm({
        subjectId: subjects[0]?.id || '',
        date: new Date().toISOString().split('T')[0],
        startTime: '08:00',
        duration: 60,
        type: 'free',
        notes: ''
      })
    } catch (e) {
      alert('خطا در ثبت جلسه: ' + (e as Error).message)
    }
  }

  const handleEdit = (session: any) => {
    const start = new Date(session.startTime)
    setManualForm({
      subjectId: session.subjectId,
      date: start.toISOString().split('T')[0],
      startTime: `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`,
      duration: Math.round(session.duration / 60),
      type: session.type,
      notes: session.notes || ''
    })
    setEditingId(session.id)
    setShowManual(true)
  }

  if (loading) {
    return (
      <PageContainer>
        <div className="animate-pulse space-y-3">
          <div className="h-8 bg-secondary rounded w-1/3"></div>
          <div className="h-24 bg-secondary rounded-2xl"></div>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">جلسات مطالعه</h1>
        <Button size="sm" onClick={() => { setEditingId(null); setShowManual(true) }}>
          <Plus className="h-4 w-4" />
          ثبت دستی مطالعه
        </Button>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <h3 className="font-medium text-sm mb-2">💡 ثبت دستی</h3>
          <p className="text-xs text-muted-foreground">
            اگر قبلاً مطالعه کردی و تایمر نزدی (مثلاً در کتابخانه یا کلاس)، می‌تونی اینجا به صورت دستی وارد کنی. تاریخ، ساعت شروع و مدت زمان رو مشخص کن تا در آمار و استریک حساب بشه.
          </p>
        </CardContent>
      </Card>

      {sortedSessions.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={History}
              title="جلسه‌ای ثبت نشده"
              description="جلسات مطالعه شما اینجا نمایش داده می‌شود. از تایمر استفاده کن یا به صورت دستی ثبت کن"
              action={{ label: 'ثبت دستی', onClick: () => setShowManual(true) }}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByDate).map(([dateStr, daySessions]) => {
            const totalDuration = daySessions.reduce((sum, s) => sum + s.duration, 0)
            return (
              <div key={dateStr} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold">{formatJalali(new Date(dateStr), { includeWeekday: true })}</h2>
                  <Badge variant="secondary">{toPersianDigits(daySessions.length.toString())} جلسه • {formatDuration(totalDuration, settings.persianNumbers, false)}</Badge>
                </div>

                <div className="space-y-2">
                  {daySessions.map(session => {
                    const subject = subjects.find(s => s.id === session.subjectId)
                    return (
                      <Card key={session.id} className="group">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: subject?.color || '#6366F1' }}>
                              <Clock className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium flex items-center gap-2">
                                {subject?.name || 'نامشخص'}
                                <Badge variant="outline" className="text-xs">{session.type === 'pomodoro' ? '🍅 پومودورو' : session.type === 'free' ? '📚 آزاد' : '⏱️ معکوس'}</Badge>
                                {session.notes?.includes('دستی') && <Badge variant="secondary" className="text-xs">دستی</Badge>}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(session.startTime).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })} • {formatDuration(session.duration, settings.persianNumbers, false)}
                                {session.pausedDuration > 0 && ` • توقف ${formatDuration(session.pausedDuration, settings.persianNumbers, false)}`}
                              </p>
                              {session.notes && !session.notes.includes('دستی') && <p className="text-xs text-muted-foreground mt-1">{session.notes}</p>}
                            </div>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(session)}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { if (confirm('حذف جلسه؟')) remove(session.id) }}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal open={showManual} onClose={() => { setShowManual(false); setEditingId(null) }} title={editingId ? 'ویرایش جلسه' : 'ثبت دستی جلسه مطالعه'} description="مطالعات انجام شده بدون تایمر را اینجا وارد کن" size="lg">
        <div className="space-y-4">
          <Select
            label="درس (کنکور تجربی)"
            value={manualForm.subjectId}
            onChange={e => setManualForm({ ...manualForm, subjectId: e.target.value })}
            options={subjects.map(s => ({ value: s.id, label: s.name }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input label="تاریخ" type="date" value={manualForm.date} onChange={e => setManualForm({ ...manualForm, date: e.target.value })} />
            <Input label="ساعت شروع" type="time" value={manualForm.startTime} onChange={e => setManualForm({ ...manualForm, startTime: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="مدت زمان (دقیقه)" type="number" value={manualForm.duration.toString()} onChange={e => setManualForm({ ...manualForm, duration: parseInt(e.target.value) || 60 })} />
            <Select
              label="نوع جلسه"
              value={manualForm.type}
              onChange={e => setManualForm({ ...manualForm, type: e.target.value as any })}
              options={[
                { value: 'free', label: 'آزاد' },
                { value: 'pomodoro', label: 'پومودورو' },
                { value: 'countdown', label: 'معکوس' }
              ]}
            />
          </div>
          <Textarea label="یادداشت" placeholder="مثلا: فصل ۳ زیست - ۲۰ تست، صفحات ۴۵-۶۰" value={manualForm.notes} onChange={e => setManualForm({ ...manualForm, notes: e.target.value })} />
          <div className="rounded-xl bg-secondary p-3 text-xs text-muted-foreground">
            این جلسه در آمار روزانه، هفتگی، توزیع دروس و استریک محاسبه می‌شود.
          </div>
        </div>
        <ModalFooter>
          <Button variant="secondary" onClick={() => { setShowManual(false); setEditingId(null) }}>انصراف</Button>
          <Button onClick={handleManualSubmit}>{editingId ? 'ذخیره تغییرات' : 'ثبت جلسه'}</Button>
        </ModalFooter>
      </Modal>
    </PageContainer>
  )
}
