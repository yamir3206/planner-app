import * as React from 'react'
import { PageContainer } from '@/components/layout/AppShell'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { Modal, ModalFooter } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { Badge } from '@/components/ui/Badge'
import { useTasks } from '@/hooks/useTasks'
import { useSubjects } from '@/hooks/useSubjects'
import { TaskTypeLabels, TaskStatusLabels, PriorityLabels } from '@/core/domain/enums'
import { StudyTask } from '@/core/domain/models/Task'
import { getTodayString, formatJalali, parseDateString } from '@/core/utils/date/jalali'
import { toPersianDigits } from '@/core/utils/persian/numbers'
import { ClipboardList, Plus, Trash2, Edit2, Clock, CheckCircle2, Circle, Play } from 'lucide-react'

export function PlannerPage() {
  const { tasks, loading, load, add, update, remove, toggleStatus } = useTasks()
  const { subjects, load: loadSubjects } = useSubjects()
  const [selectedDate, setSelectedDate] = React.useState(getTodayString())
  const [modalOpen, setModalOpen] = React.useState(false)
  const [editingTask, setEditingTask] = React.useState<StudyTask | null>(null)
  const [form, setForm] = React.useState({
    subjectId: '',
    topic: '',
    type: 'study' as StudyTask['type'],
    date: getTodayString(),
    startTime: '',
    plannedDuration: 60,
    priority: 'medium' as StudyTask['priority'],
    notes: ''
  })

  React.useEffect(() => {
    load()
    loadSubjects()
  }, [load, loadSubjects])

  React.useEffect(() => {
    if (subjects.length > 0 && !form.subjectId) {
      setForm(f => ({ ...f, subjectId: subjects[0].id }))
    }
  }, [subjects, form.subjectId])

  const filteredTasks = React.useMemo(() => {
    return tasks.filter(t => t.date === selectedDate).sort((a, b) => {
      if (a.startTime && b.startTime) return a.startTime.localeCompare(b.startTime)
      return 0
    })
  }, [tasks, selectedDate])

  const handleOpenAdd = () => {
    setEditingTask(null)
    setForm({
      subjectId: subjects[0]?.id || '',
      topic: '',
      type: 'study',
      date: selectedDate,
      startTime: '',
      plannedDuration: 60,
      priority: 'medium',
      notes: ''
    })
    setModalOpen(true)
  }

  const handleOpenEdit = (task: StudyTask) => {
    setEditingTask(task)
    setForm({
      subjectId: task.subjectId,
      topic: task.topic,
      type: task.type,
      date: task.date,
      startTime: task.startTime || '',
      plannedDuration: task.plannedDuration,
      priority: task.priority,
      notes: task.notes || ''
    })
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    if (!form.topic.trim() || !form.subjectId) return

    if (editingTask) {
      await update(editingTask.id, {
        subjectId: form.subjectId,
        topic: form.topic.trim(),
        type: form.type,
        date: form.date,
        startTime: form.startTime || undefined,
        plannedDuration: form.plannedDuration,
        priority: form.priority,
        notes: form.notes
      })
    } else {
      await add({
        subjectId: form.subjectId,
        topic: form.topic.trim(),
        type: form.type,
        date: form.date,
        startTime: form.startTime || undefined,
        plannedDuration: form.plannedDuration,
        priority: form.priority,
        notes: form.notes
      })
    }
    setModalOpen(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm('حذف این کار؟')) await remove(id)
  }

  if (loading) {
    return (
      <PageContainer>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-secondary rounded w-1/3"></div>
          <div className="h-24 bg-secondary rounded-2xl"></div>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">برنامه‌ریز</h1>
          <p className="text-sm text-muted-foreground">{formatJalali(parseDateString(selectedDate))}</p>
        </div>
        <Button onClick={handleOpenAdd} size="sm">
          <Plus className="h-4 w-4" />
          کار جدید
        </Button>
      </div>

      {/* Date selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {Array.from({ length: 7 }).map((_, i) => {
          const date = new Date()
          date.setDate(date.getDate() + i - 3)
          const dateStr = date.toISOString().split('T')[0]
          const isSelected = dateStr === selectedDate
          const isToday = dateStr === getTodayString()
          return (
            <button
              key={dateStr}
              onClick={() => setSelectedDate(dateStr)}
              className={`flex-shrink-0 rounded-xl px-4 py-3 text-sm font-medium transition-colors border ${
                isSelected ? 'bg-primary text-primary-foreground border-primary' : 'bg-card hover:bg-accent border-border'
              }`}
            >
              <div>{formatJalali(date).split(' ')[0]} {formatJalali(date).split(' ')[1]}</div>
              {isToday && <div className="text-xs opacity-80">امروز</div>}
            </button>
          )
        })}
      </div>

      {filteredTasks.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={ClipboardList}
              title="کاری برای این روز نداری"
              description="کار جدید اضافه کن تا روزت رو برنامه‌ریزی کنی"
              action={{ label: 'افزودن کار', onClick: handleOpenAdd }}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const subject = subjects.find(s => s.id === task.subjectId)
            return (
              <Card key={task.id} className="group">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <button onClick={() => toggleStatus(task.id)} className="mt-1">
                      {task.status === 'done' ? (
                        <CheckCircle2 className="h-6 w-6 text-success" />
                      ) : (
                        <Circle className="h-6 w-6 text-muted-foreground" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{task.topic}</span>
                        <Badge variant="secondary" className="text-xs">{TaskTypeLabels[task.type]}</Badge>
                        <Badge variant={task.priority === 'urgent' ? 'danger' : task.priority === 'high' ? 'warning' : 'secondary'} className="text-xs">
                          {PriorityLabels[task.priority]}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        {subject && (
                          <span className="flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: subject.color }} />
                            {subject.name}
                          </span>
                        )}
                        {task.startTime && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {toPersianDigits(task.startTime)}
                          </span>
                        )}
                        <span>{toPersianDigits(task.plannedDuration.toString())} دقیقه</span>
                      </div>

                      {task.notes && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{task.notes}</p>}
                    </div>

                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEdit(task)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(task.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingTask ? 'ویرایش کار' : 'کار جدید'} size="lg">
        <div className="space-y-4">
          <Select
            label="درس"
            value={form.subjectId}
            onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
            options={subjects.map(s => ({ value: s.id, label: s.name }))}
            placeholder="انتخاب درس"
          />

          <Input
            label="مبحث"
            placeholder="مثلا فصل 2 - مثلثات"
            value={form.topic}
            onChange={(e) => setForm({ ...form, topic: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="نوع فعالیت"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as any })}
              options={Object.entries(TaskTypeLabels).map(([v, l]) => ({ value: v, label: l }))}
            />
            <Select
              label="اولویت"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value as any })}
              options={Object.entries(PriorityLabels).map(([v, l]) => ({ value: v, label: l }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="تاریخ" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            <Input label="ساعت شروع" type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
          </div>

          <Input
            label="مدت زمان (دقیقه)"
            type="number"
            value={form.plannedDuration.toString()}
            onChange={(e) => setForm({ ...form, plannedDuration: parseInt(e.target.value) || 0 })}
          />

          <Textarea label="یادداشت" placeholder="توضیحات اضافه..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>

        <ModalFooter>
          <Button variant="secondary" onClick={() => setModalOpen(false)}>انصراف</Button>
          <Button onClick={handleSubmit} disabled={!form.topic.trim() || !form.subjectId}>
            {editingTask ? 'ذخیره' : 'افزودن'}
          </Button>
        </ModalFooter>
      </Modal>
    </PageContainer>
  )
}
