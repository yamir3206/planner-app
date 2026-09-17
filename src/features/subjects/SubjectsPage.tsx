import * as React from 'react'
import { PageContainer } from '@/components/layout/AppShell'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal, ModalFooter } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { Badge } from '@/components/ui/Badge'
import { useSubjects } from '@/hooks/useSubjects'
import { BookOpen, Plus, Trash2, Edit2 } from 'lucide-react'

const colorOptions = ['#6366F1', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#84CC16', '#F97316', '#14B8A6']

export function SubjectsPage() {
  const { subjects, loading, load, add, update, remove } = useSubjects()
  const [modalOpen, setModalOpen] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [form, setForm] = React.useState({ name: '', color: colorOptions[0], icon: 'BookOpen' })

  React.useEffect(() => { load() }, [])

  const handleOpenAdd = () => {
    setEditingId(null)
    setForm({ name: '', color: colorOptions[0], icon: 'BookOpen' })
    setModalOpen(true)
  }

  const handleOpenEdit = (id: string) => {
    const subject = subjects.find(s => s.id === id)
    if (!subject) return
    setEditingId(id)
    setForm({ name: subject.name, color: subject.color, icon: subject.icon })
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    if (!form.name.trim()) return
    if (editingId) await update(editingId, { name: form.name.trim(), color: form.color, icon: form.icon })
    else await add({ name: form.name.trim(), color: form.color, icon: form.icon, order: subjects.length })
    setModalOpen(false)
  }

  if (loading && subjects.length === 0) {
    return (
      <PageContainer>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-secondary rounded w-1/3"></div>
          <div className="grid gap-3 md:grid-cols-2">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-secondary rounded-2xl"></div>)}</div>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">درس‌ها</h1>
        <Button onClick={handleOpenAdd} size="sm"><Plus className="h-4 w-4" />افزودن درس</Button>
      </div>

      {subjects.length === 0 ? (
        <Card><CardContent><EmptyState icon={BookOpen} title="درسی اضافه نشده" description="درس‌های خود را اضافه کنید" action={{ label: 'افزودن درس', onClick: handleOpenAdd }} /></CardContent></Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <Card key={subject.id} hover className="group">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl flex items-center justify-center text-white font-bold" style={{ backgroundColor: subject.color }}><BookOpen className="h-6 w-6" /></div>
                    <div><h3 className="font-semibold">{subject.name}</h3><p className="text-xs text-muted-foreground">{subject.nameEn || '—'}</p></div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEdit(subject.id)}><Edit2 className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { if (confirm('حذف؟')) remove(subject.id) }}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
                <div className="mt-3 flex gap-2"><Badge variant="secondary" className="text-xs">اولویت {subject.order + 1}</Badge><div className="h-5 w-5 rounded-full border" style={{ backgroundColor: subject.color }} /></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'ویرایش درس' : 'افزودن درس جدید'}>
        <div className="space-y-4">
          <Input label="نام درس" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <div>
            <label className="text-sm font-medium mb-2 block">رنگ درس</label>
            <div className="flex flex-wrap gap-2">{colorOptions.map((color) => (<button key={color} onClick={() => setForm({ ...form, color })} className={`h-9 w-9 rounded-full border-2 ${form.color === color ? 'border-foreground scale-110' : 'border-transparent'}`} style={{ backgroundColor: color }} />))}</div>
          </div>
        </div>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setModalOpen(false)}>انصراف</Button>
          <Button onClick={handleSubmit} disabled={!form.name.trim()}>{editingId ? 'ذخیره' : 'افزودن'}</Button>
        </ModalFooter>
      </Modal>
    </PageContainer>
  )
}
