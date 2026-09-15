import * as React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth'
import { GraduationCap, UserPlus, Eye, EyeOff, ShieldCheck } from 'lucide-react'

export function RegisterPage() {
  const navigate = useNavigate()
  const { register, loading, error } = useAuth()
  const [form, setForm] = React.useState({
    username: '',
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    field: 'tajrobi' as const
  })
  const [showPass, setShowPass] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      alert('رمز و تکرارش یکی نیست')
      return
    }
    try {
      await register({
        username: form.username,
        password: form.password,
        displayName: form.displayName,
        email: form.email || undefined,
        field: form.field
      })
      navigate('/')
    } catch (err) {
      // handled in store
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <Card className="w-full max-w-md shadow-large border-0">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-medium">
            <GraduationCap className="h-8 w-8" />
          </div>
          <div>
            <CardTitle className="text-2xl">ثبت‌نام در آکسون</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">برای کنکور — شنبه تا جمعه همراهت</p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="نام"
              placeholder="مثلا: علی محمدی"
              value={form.displayName}
              onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              required
            />
            <Input
              label="نام کاربری"
              placeholder="انگلیسی، حداقل ۳ حرف"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              dir="ltr"
              required
            />
            <Input
              label="ایمیل (اختیاری)"
              placeholder="ali@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              dir="ltr"
              type="email"
            />
            <Select
              label="رشته"
              value={form.field}
              onChange={(e) => setForm({ ...form, field: e.target.value as any })}
              options={[
                { value: 'tajrobi', label: 'علوم تجربی 🧬' },
                { value: 'riazi', label: 'ریاضی فیزیک 📐' },
                { value: 'ensani', label: 'علوم انسانی 📚' },
                { value: 'other', label: 'سایر' }
              ]}
            />
            <div className="space-y-2">
              <label className="text-sm font-medium">رمز عبور</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-[15px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring pr-10"
                  placeholder="حداقل ۶ کاراکتر"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  dir="ltr"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Input
              label="تکرار رمز"
              type="password"
              placeholder="دوباره وارد کن"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              required
            />

            {error && (
              <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="rounded-xl bg-primary/5 border border-primary/10 p-3 flex gap-2 text-xs">
              <ShieldCheck className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-muted-foreground">
                رمزت امن و خصوصی می‌ماند و فقط روی دستگاه خودت ذخیره می‌شود. با پشتیبان‌گیری می‌توانی در همه دستگاه‌ها با یک رمز وارد شوی.
              </span>
            </div>

            <Button type="submit" className="w-full" loading={loading} size="lg">
              <UserPlus className="h-5 w-5" />
              ثبت‌نام و ورود
            </Button>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">قبلاً ثبت‌نام کردی؟ </span>
              <Link to="/login" className="text-primary font-medium hover:underline">
                وارد شو
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
