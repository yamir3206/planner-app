import * as React from 'react'
import { PageContainer } from '@/components/layout/AppShell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Modal, ModalFooter } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { Progress } from '@/components/ui/Progress'
import { Badge } from '@/components/ui/Badge'
import { useGoals } from '@/hooks/useGoals'
import { useSubjects } from '@/hooks/useSubjects'
import { GoalTypeLabels, GoalUnitLabels } from '@/core/domain/enums/GoalType'
import { Goal } from '@/core/domain/models/Goal'
import { Target, Plus, Trash2, Edit2 } from 'lucide-react'
import { toPersianDigits } from '@/core/utils/persian/numbers'

export function GoalsPage() {
  const { goals, loading, load, add, update, remove } = useGoals()
  const { subjects, load: loadSubjects } = useSubjects()
  const [modalOpen, setModalOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Goal | null>(null)
  const [form, setForm] = React.useState({ title: '', type: 'daily' as Goal['type'], targetValue: 60, unit: 'minutes' as Goal['unit'], subjectId: '' })

  React.useEffect(() => { load(); loadSubjects() }, [])

  const handleOpenAdd = () => { setEditing(null); setForm({ title: '', type: 'daily', targetValue: 60, unit: 'minutes', subjectId: '' }); setModalOpen(true) }
  const handleOpenEdit = (goal: Goal) => { setEditing(goal); setForm({ title: goal.title, type: goal.type, targetValue: goal.targetValue, unit: goal.unit, subjectId: goal.subjectId || '' }); setModalOpen(true) }
  const handleSubmit = async () => {
    if (!form.title.trim()) return
    if (editing) await update(editing.id, { title: form.title.trim(), type: form.type, targetValue: form.targetValue, unit: form.unit, subjectId: form.subjectId || undefined })
    else await add({ title: form.title.trim(), type: form.type, targetValue: form.targetValue, unit: form.unit, subjectId: form.subjectId || undefined })
    setModalOpen(false)
  }
  const calculateProgress = (goal: Goal) => goal.targetValue === 0 ? 0 : Math.min(100, (goal.currentValue / goal.targetValue) * 100)

  if (loading && goals.length === 0) {
    return (<PageContainer><div className="animate-pulse h-32 bg-secondary rounded-2xl"></div></PageContainer>)
  }

  return (
    <PageContainer>
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold">اهداف</h1><Button size="sm" onClick={handleOpenAdd}><Plus className="h-4 w-4" />هدف جدید</Button></div>
      {goals.length === 0 ? <Card><CardContent><EmptyState icon={Target} title="هدفی تعیین نشده" description="اهداف روزانه، هفتگی و ماهانه خود را اینجا مدیریت کن" action={{ label: 'افزودن هدف', onClick: handleOpenAdd }} /></CardContent></Card> : (
        <div className="grid gap-3 md:grid-cols-2">
          {goals.map(goal => {
            const progress = calculateProgress(goal)
            const subject = subjects.find(s => s.id === goal.subjectId)
            return (
              <Card key={goal.id} className="group"><CardHeader className="pb-2"><CardTitle className="flex items-center justify-between text-base"><span className="flex items-center gap-2"><Target className="h-4 w-4 text-primary" />{goal.title}</span><div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenEdit(goal)}><Edit2 className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => { if (confirm('حذف هدف؟')) remove(goal.id) }}><Trash2 className="h-3.5 w-3.5" /></Button></div></CardTitle></CardHeader><CardContent className="space-y-3"><div className="flex gap-2"><Badge variant="secondary">{GoalTypeLabels[goal.type]}</Badge><Badge variant="outline">{GoalUnitLabels[goal.unit]}</Badge>{subject && <Badge style={{ backgroundColor: subject.color, color: 'white' }}>{subject.name}</Badge>}</div><div><div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">پیشرفت</span><span className="font-medium">{toPersianDigits(goal.currentValue.toString())} / {toPersianDigits(goal.targetValue.toString())}</span></div><Progress value={progress} size="md" variant={progress >= 100 ? 'success' : 'default'} showLabel /></div></CardContent></Card>
            )
          })}
        </div>
      )}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'ویرایش هدف' : 'هدف جدید'}><div className="space-y-4"><Input label="عنوان هدف" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /><div className="grid grid-cols-2 gap-3"><Select label="نوع هدف" value={form.type} onChange={e => setForm({ ...form, type: e.target.value as any })} options={Object.entries(GoalTypeLabels).map(([v, l]) => ({ value: v, label: l }))} /><Select label="واحد" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value as any })} options={Object.entries(GoalUnitLabels).map(([v, l]) => ({ value: v, label: l }))} /></div><Input label="مقدار هدف" type="number" value={form.targetValue.toString()} onChange={e => setForm({ ...form, targetValue: parseInt(e.target.value) || 0 })} /><Select label="درس (اختیاری)" value={form.subjectId} onChange={e => setForm({ ...form, subjectId: e.target.value })} options={[{ value: '', label: 'همه دروس' }, ...subjects.map(s => ({ value: s.id, label: s.name }))]} /></div><ModalFooter><Button variant="secondary" onClick={() => setModalOpen(false)}>انصراف</Button><Button onClick={handleSubmit} disabled={!form.title.trim()}>{editing ? 'ذخیره' : 'افزودن'}</Button></ModalFooter></Modal>
    </PageContainer>
  )
}
