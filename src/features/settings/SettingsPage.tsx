import * as React from 'react'
import { PageContainer } from '@/components/layout/AppShell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Input'
import { Modal, ModalFooter } from '@/components/ui/Modal'
import { useThemeStore, useSettingsStore } from '@/app/providers'
import { useAuth } from '@/hooks/useAuth'
import { importExportService } from '@/core/services/importExportService'
import { profileRepository } from '@/core/repositories'
import { subjectService } from '@/core/services/subjectService'
import { UserProfile } from '@/core/domain/models/UserProfile'
import { THEMES, APP_VERSION } from '@/lib/constants'
import { Moon, Sun, Monitor, Hash, Download, Upload, User, Trash2, AlertTriangle, Palette, LogOut, ShieldCheck, BookOpen, Sparkles, Smartphone, Globe, CheckCircle, QrCode, Camera, Copy, Check } from 'lucide-react'
import { toPersianDigits } from '@/core/utils/persian/numbers'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'

export function SettingsPage() {
  const navigate = useNavigate()
  const { mode, colorTheme, setMode, setColorTheme } = useThemeStore()
  const { settings, updateSettings } = useSettingsStore()
  const { session, isLoggedIn, logout } = useAuth()
  const [profile, setProfile] = React.useState<UserProfile | null>(null)
  const [profileForm, setProfileForm] = React.useState({ name: '', field: 'tajrobi' as any, grade: '12' as any, target: '', dailyTargetMinutes: 360 })
  const [importError, setImportError] = React.useState<string | null>(null)
  const [exportSummary, setExportSummary] = React.useState<{ subjects: number; tasks: number; sessions: number; goals: number; users: number } | null>(null)
  const [showQR, setShowQR] = React.useState(false)
  const [qrData, setQrData] = React.useState<string>('')
  const [showQRScan, setShowQRScan] = React.useState(false)
  const [qrCopied, setQrCopied] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const qrCanvasRef = React.useRef<HTMLCanvasElement>(null)

  React.useEffect(() => {
    profileRepository.getProfile().then(p => {
      if (p) {
        setProfile(p)
        setProfileForm({ name: p.name, field: p.field, grade: p.grade, target: p.target, dailyTargetMinutes: p.dailyTargetMinutes })
      }
    })
    importExportService.getExportSummary().then(setExportSummary)
  }, [])

  const handleSaveProfile = async () => {
    if (!profileForm.name.trim()) return
    const saved = await profileRepository.saveProfile({ name: profileForm.name.trim(), field: profileForm.field, grade: profileForm.grade, target: profileForm.target, dailyTargetMinutes: profileForm.dailyTargetMinutes })
    setProfile(saved)
    await updateSettings({ dailyTargetMinutes: profileForm.dailyTargetMinutes })
    if (profile && profile.field !== profileForm.field) {
      if (confirm(`رشته تغییر کرد. دروس جدید اضافه شود؟`)) {
        await subjectService.seedForField(profileForm.field)
        alert('دروس جدید اضافه شد!')
      }
    }
    alert('ذخیره شد ✓')
  }

  const handleExport = async () => {
    try {
      const json = await importExportService.exportData()
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `axon-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      const summary = await importExportService.getExportSummary()
      setExportSummary(summary)
      alert(`✓ ذخیره شد!\n\nشامل:\n- ${summary.users} حساب\n- ${summary.subjects} درس\n- ${summary.tasks} برنامه\n- ${summary.sessions} جلسه\n- ${summary.goals} هدف\n\nفایل را در دستگاه دیگر وارد کن تا با همان رمز وارد شوی!`)
    } catch (e) {
      alert('خطا: ' + (e as Error).message)
    }
  }

  const handleExportQR = async () => {
    try {
      const json = await importExportService.exportData()
      // برای QR فشرده می‌کنیم
      const compressed = btoa(unescape(encodeURIComponent(json)))
      if (compressed.length > 1800) {
        alert('اطلاعات زیاد است و QR طولانی می‌شود. بهتر است از فایل استفاده کنی.')
      }
      setQrData(compressed)
      setShowQR(true)
      setTimeout(async () => {
        if (qrCanvasRef.current) {
          try {
            const QRCode = await import('qrcode')
            await QRCode.toCanvas(qrCanvasRef.current, compressed, { width: 280, margin: 2, errorCorrectionLevel: 'L' })
          } catch (err) {
            console.error('QR generate failed', err)
          }
        }
      }, 150)
    } catch (e) {
      alert('خطا: ' + (e as Error).message)
    }
  }

  const handleCopyQR = async () => {
    try {
      await navigator.clipboard.writeText(qrData)
      setQrCopied(true)
      setTimeout(() => setQrCopied(false), 2000)
    } catch {}
  }

  const handleImportClick = () => { fileInputRef.current?.click() }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const validation = await importExportService.validateImport(text)
      if (!validation.valid) { setImportError(validation.errors?.join('\n') || 'فایل نامعتبر'); return }
      const data = validation.data?.data
      const hasUsers = data?.users && data.users.length > 0
      const message = hasUsers ? `فایل شامل ${data.users.length} حساب، ${data.subjects?.length || 0} درس، ${data.tasks?.length || 0} کار است.\n\nبا وارد کردن، با همان رمز قبلی وارد می‌شوی!\n\nمطمئنی؟` : 'مطمئنی؟ اطلاعات فعلی با فایل ترکیب می‌شود.'
      if (!confirm(message)) return
      const result = await importExportService.importData(text)
      if (result.success) {
        const summary = await importExportService.getExportSummary()
        setExportSummary(summary)
        alert(`✓ وارد شد!\n\n${hasUsers ? 'حالا با همان رمز قبلی می‌توانی وارد شوی!\n\n' : ''}صفحه بارگذاری می‌شود.`)
        window.location.reload()
      } else setImportError(result.errors?.join('\n') || 'خطا')
    } catch (err) {
      setImportError('خطا: ' + (err as Error).message)
    }
  }

  const handleQRImport = async (qrText: string) => {
    try {
      const json = decodeURIComponent(escape(atob(qrText)))
      const validation = await importExportService.validateImport(json)
      if (!validation.valid) { setImportError(validation.errors?.join('\n') || 'QR نامعتبر'); return }
      const result = await importExportService.importData(json)
      if (result.success) {
        alert('✓ از QR وارد شد! بارگذاری...')
        window.location.reload()
      }
    } catch (err) {
      setImportError('QR خوانده نشد: ' + (err as Error).message)
    }
  }

  const handleClearData = async () => {
    if (!confirm('همه اطلاعات پاک شود؟')) return
    if (!confirm('تأیید نهایی: کارها، جلسات و دروس حذف می‌شوند!')) return
    try {
      const { subjectRepository, taskRepository, sessionRepository, goalRepository } = await import('@/core/repositories')
      await Promise.all([subjectRepository.clear(), taskRepository.clear(), sessionRepository.clear(), goalRepository.clear()])
      alert('حذف شد')
      window.location.reload()
    } catch (e) { alert('خطا: ' + (e as Error).message) }
  }

  const handleLogout = async () => { if (confirm('خارج شوی؟')) { await logout(); navigate('/login') } }

  return (
    <PageContainer>
      <div className="flex items-center justify-between"><h1 className="text-2xl font-black">تنظیمات</h1><Badge variant="secondary" className="gap-1">نسخه {APP_VERSION}</Badge></div>

      <Card className={isLoggedIn ? 'border-success/30 bg-success/5 shadow-soft' : 'border-warning/30 bg-warning/5 shadow-soft'}>
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3"><div className={`h-10 w-10 rounded-xl flex items-center justify-center ${isLoggedIn ? 'bg-success text-white' : 'bg-warning text-white'}`}><ShieldCheck className="h-5 w-5" /></div><div><p className="font-bold text-sm">{isLoggedIn ? `سلام، ${session?.displayName}` : 'وارد نشده‌ای'}</p><p className="text-xs text-muted-foreground">{isLoggedIn ? `@${session?.username} • یک رمز در همه جا` : 'برای همگام‌سازی وارد شو'}</p></div></div>
          {isLoggedIn ? <Button variant="ghost" size="sm" onClick={handleLogout}><LogOut className="h-4 w-4" />خروج</Button> : <Button size="sm" onClick={() => navigate('/login')}>ورود</Button>}
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 shadow-soft overflow-hidden"><div className="h-1 w-full bg-gradient-to-r from-primary via-accent to-primary" /><CardHeader><CardTitle className="flex items-center gap-2 text-base"><div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white"><Globe className="h-4 w-4" /></div>یک حساب در همه دستگاه‌ها<Badge variant="success" className="gap-1"><CheckCircle className="h-3 w-3" />فعال</Badge></CardTitle></CardHeader><CardContent className="space-y-4"><div className="rounded-xl bg-card border p-4 space-y-3"><h4 className="font-bold text-sm flex items-center gap-2"><Smartphone className="h-4 w-4 text-primary" />چطور با یک رمز همه جا وارد شوم؟</h4><div className="space-y-2 text-xs text-muted-foreground"><div className="flex gap-2"><span className="h-5 w-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold shrink-0">۱</span><span><strong>در دستگاه اول:</strong> ثبت‌نام کن و مطالعه کن، سپس پشتیبان بگیر</span></div><div className="flex gap-2"><span className="h-5 w-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold shrink-0">۲</span><span><strong>پشتیبان شامل حساب، دروس و جلسات</strong> است — با همان رمز کار می‌کند</span></div><div className="flex gap-2"><span className="h-5 w-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold shrink-0">۳</span><span><strong>در دستگاه جدید:</strong> فایل را وارد کن یا QR را اسکن کن — با همان نام و رمز وارد شو!</span></div></div></div>{exportSummary && <div className="grid grid-cols-5 gap-2 text-center"><div className="rounded-xl bg-card border p-2"><p className="text-lg font-black text-primary">{toPersianDigits(exportSummary.users.toString())}</p><p className="text-[10px] text-muted-foreground">حساب</p></div><div className="rounded-xl bg-card border p-2"><p className="text-lg font-black">{toPersianDigits(exportSummary.subjects.toString())}</p><p className="text-[10px] text-muted-foreground">درس</p></div><div className="rounded-xl bg-card border p-2"><p className="text-lg font-black">{toPersianDigits(exportSummary.tasks.toString())}</p><p className="text-[10px] text-muted-foreground">کار</p></div><div className="rounded-xl bg-card border p-2"><p className="text-lg font-black text-success">{toPersianDigits(exportSummary.sessions.toString())}</p><p className="text-[10px] text-muted-foreground">جلسه</p></div><div className="rounded-xl bg-card border p-2"><p className="text-lg font-black">{toPersianDigits(exportSummary.goals.toString())}</p><p className="text-[10px] text-muted-foreground">هدف</p></div></div>}</CardContent></Card>

      <Card className="shadow-soft"><CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5" />پروفایل</CardTitle></CardHeader><CardContent className="space-y-4"><Input label="نام" placeholder="نام شما" value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} /><div className="grid grid-cols-2 gap-3"><Select label="رشته" value={profileForm.field} onChange={e => setProfileForm({ ...profileForm, field: e.target.value as any })} options={[{ value: 'tajrobi', label: 'علوم تجربی 🧬' }, { value: 'riazi', label: 'ریاضی فیزیک 📐' }, { value: 'ensani', label: 'علوم انسانی 📚' }, { value: 'honar', label: 'هنر 🎨' }, { value: 'zaban', label: 'زبان 🌍' }]} /><Select label="پایه" value={profileForm.grade} onChange={e => setProfileForm({ ...profileForm, grade: e.target.value as any })} options={[{ value: '10', label: 'دهم' }, { value: '11', label: 'یازدهم' }, { value: '12', label: 'دوازدهم' }, { value: 'graduate', label: 'فارغ‌التحصیل' }]} /></div><Input label="هدف (مثلا پزشکی تهران)" placeholder="هدف شما" value={profileForm.target} onChange={e => setProfileForm({ ...profileForm, target: e.target.value })} /><Input label="هدف روزانه (دقیقه)" type="number" value={profileForm.dailyTargetMinutes.toString()} onChange={e => setProfileForm({ ...profileForm, dailyTargetMinutes: parseInt(e.target.value) || 0 })} /><Button onClick={handleSaveProfile} className="w-full rounded-xl bg-gradient-to-br from-primary to-accent"><BookOpen className="h-4 w-4" />ذخیره</Button></CardContent></Card>

      <Card className="shadow-soft"><CardHeader><CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5" />ظاهر<Sparkles className="h-4 w-4 text-warning" /></CardTitle></CardHeader><CardContent className="space-y-4"><div><p className="text-sm font-bold mb-3">رنگ</p><div className="grid grid-cols-2 sm:grid-cols-4 gap-3">{THEMES.map(t => (<button key={t.id} onClick={() => { setColorTheme(t.id as any); updateSettings({ colorTheme: t.id as any } as any) }} className={`rounded-xl p-3 border-2 text-left transition-all hover:scale-[1.02] ${colorTheme === t.id ? 'border-primary shadow-medium scale-[1.02]' : 'border-border hover:border-primary/50'}`}><div className="flex items-center gap-2 mb-2"><div className="h-6 w-6 rounded-full shadow-sm" style={{ background: `linear-gradient(135deg, ${t.primary}, ${t.accent})` }} /><span className="font-medium text-sm">{t.name}</span></div><p className="text-xs text-muted-foreground">{t.description}</p>{colorTheme === t.id && <div className="mt-2 text-xs text-primary font-medium">✓ فعال</div>}</button>))}</div></div><div className="pt-4 border-t"><p className="text-sm font-bold mb-2">حالت نمایش</p><div className="flex gap-2"><Button variant={mode === 'light' ? 'primary' : 'secondary'} size="sm" onClick={() => { setMode('light'); updateSettings({ theme: 'light' } as any) }}><Sun className="h-4 w-4" /> روشن</Button><Button variant={mode === 'dark' ? 'primary' : 'secondary'} size="sm" onClick={() => { setMode('dark'); updateSettings({ theme: 'dark' } as any) }}><Moon className="h-4 w-4" /> تاریک</Button><Button variant={mode === 'system' ? 'primary' : 'secondary'} size="sm" onClick={() => { setMode('system'); updateSettings({ theme: 'system' } as any) }}><Monitor className="h-4 w-4" /> سیستم</Button></div></div><div className="flex items-center justify-between pt-4 border-t"><div><p className="text-sm font-bold">اعداد فارسی</p><p className="text-xs text-muted-foreground">نمایش اعداد فارسی</p></div><Button variant={settings.persianNumbers ? 'primary' : 'secondary'} size="sm" onClick={() => updateSettings({ persianNumbers: !settings.persianNumbers })}><Hash className="h-4 w-4" />{settings.persianNumbers ? 'فارسی' : 'انگلیسی'}</Button></div></CardContent></Card>

      <Card className="shadow-soft"><CardHeader><CardTitle className="flex items-center gap-2"><Download className="h-5 w-5" />پشتیبان‌گیری<Badge variant="success" className="mr-auto">همگام</Badge></CardTitle></CardHeader><CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button variant="outline" size="lg" onClick={handleExport} className="rounded-xl border-2 border-primary/20 hover:border-primary/50 hover:bg-primary/5 h-auto py-4 flex-col gap-2"><div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white"><Download className="h-5 w-5" /></div><div className="text-center"><p className="font-bold">ذخیره فایل</p><p className="text-xs text-muted-foreground mt-1">همه اطلاعات در یک فایل<br />برای انتقال به دستگاه دیگر</p></div></Button>
          <Button variant="outline" size="lg" onClick={handleImportClick} className="rounded-xl border-2 border-success/20 hover:border-success/50 hover:bg-success/5 h-auto py-4 flex-col gap-2"><div className="h-10 w-10 rounded-xl bg-gradient-to-br from-success to-emerald-600 flex items-center justify-center text-white"><Upload className="h-5 w-5" /></div><div className="text-center"><p className="font-bold">بارگذاری فایل</p><p className="text-xs text-muted-foreground mt-1">وارد کردن پشتیبان<br />و ورود با همان رمز</p></div></Button>
          <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleFileChange} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button variant="outline" size="lg" onClick={handleExportQR} className="rounded-xl border-2 border-violet-200 hover:border-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30 h-auto py-4 flex-col gap-2"><div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white"><QrCode className="h-5 w-5" /></div><div className="text-center"><p className="font-bold">نمایش QR</p><p className="text-xs text-muted-foreground mt-1">کد تصویری برای<br />انتقال سریع با دوربین</p></div></Button>
          <Button variant="outline" size="lg" onClick={() => setShowQRScan(true)} className="rounded-xl border-2 border-amber-200 hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 h-auto py-4 flex-col gap-2"><div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white"><Camera className="h-5 w-5" /></div><div className="text-center"><p className="font-bold">اسکن QR</p><p className="text-xs text-muted-foreground mt-1">خواندن با دوربین<br />و انتقال اطلاعات</p></div></Button>
        </div>

        {importError && <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 flex gap-2"><AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" /><pre className="text-xs whitespace-pre-wrap">{importError}</pre></div>}

        <div className="rounded-xl bg-secondary/50 border p-3 space-y-2"><p className="text-sm font-bold flex items-center gap-2"><CheckCircle className="h-4 w-4 text-success" />چرا این روش؟</p><ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside"><li>با یک حساب در همه جا وارد می‌شوی</li><li>تمام دروس و جلسات منتقل می‌شود</li><li>بدون اینترنت — خصوصی</li><li>QR برای انتقال سریع</li></ul></div>

        <div className="pt-4 border-t"><p className="text-sm font-bold text-destructive mb-2">حذف اطلاعات</p><Button variant="danger" size="sm" onClick={handleClearData} className="rounded-xl"><Trash2 className="h-4 w-4" />حذف همه</Button><p className="text-xs text-muted-foreground mt-2">برگشت ندارد.</p></div>
      </CardContent></Card>

      <Card className="shadow-soft border-0 bg-gradient-to-br from-card to-primary/5"><CardContent className="p-4 text-center text-xs text-muted-foreground"><p className="font-bold">آکسون — نسخه {APP_VERSION} (شنبه تا جمعه • QR • همگام)</p><p className="mt-1">برای کنکوری‌ها با ❤️</p><p className="mt-2 flex items-center justify-center gap-2 flex-wrap"><span>PWA</span><span>•</span><span>آفلاین</span><span>•</span><span>فارسی</span><span>•</span><span>QR</span></p></CardContent></Card>

      <Modal open={showQR} onClose={() => setShowQR(false)} title="کد QR پشتیبان" size="lg">
        <div className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">این کد را با دستگاه دیگر اسکن کن</p>
          <div className="flex justify-center p-4 bg-white rounded-2xl border">
            <canvas ref={qrCanvasRef} className="max-w-full" />
          </div>
          <div className="rounded-xl bg-secondary/50 border p-3 text-left">
            <p className="text-xs font-bold mb-1">متن کد:</p>
            <div className="max-h-24 overflow-auto text-[10px] break-all bg-card p-2 rounded border" dir="ltr">{qrData.slice(0, 300)}...</div>
          </div>
          <Button variant="secondary" size="sm" onClick={handleCopyQR} className="w-full"><Copy className="h-4 w-4" />{qrCopied ? 'کپی شد ✓' : 'کپی متن'}</Button>
          <p className="text-xs text-muted-foreground">اگر اطلاعات زیاد است، از فایل استفاده کن.</p>
        </div>
        <ModalFooter><Button variant="secondary" onClick={() => setShowQR(false)}>بستن</Button></ModalFooter>
      </Modal>

      <Modal open={showQRScan} onClose={() => setShowQRScan(false)} title="اسکن QR" size="lg">
        <QRScanner onScan={handleQRImport} onClose={() => setShowQRScan(false)} />
      </Modal>
    </PageContainer>
  )
}

function QRScanner({ onScan, onClose }: { onScan: (data: string) => void; onClose: () => void }) {
  const [manual, setManual] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const [found, setFound] = React.useState<string | null>(null)
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [scanning, setScanning] = React.useState(false)

  React.useEffect(() => {
    let stream: MediaStream | null = null
    let animationId: number
    let jsQR: any = null

    const loadJsQR = async () => {
      try {
        const mod = await import('jsqr')
        jsQR = (mod as any).default || mod
      } catch {}
    }

    const startCamera = async () => {
      await loadJsQR()
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
          setScanning(true)
          scanLoop()
        }
      } catch (e) {
        setError('دوربین در دسترس نیست. متن را دستی وارد کن.')
      }
    }

    const scanLoop = () => {
      if (!videoRef.current || !canvasRef.current || found) {
        animationId = requestAnimationFrame(scanLoop)
        return
      }
      const video = videoRef.current
      const canvas = canvasRef.current
      if (video.readyState !== video.HAVE_ENOUGH_DATA) {
        animationId = requestAnimationFrame(scanLoop)
        return
      }
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        animationId = requestAnimationFrame(scanLoop)
        return
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      try {
        if (jsQR) {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const code = jsQR(imageData.data, imageData.width, imageData.height)
          if (code && code.data) {
            setFound(code.data)
            onScan(code.data)
            setTimeout(() => onClose(), 500)
            return
          }
        }
      } catch {}
      animationId = requestAnimationFrame(scanLoop)
    }

    startCamera()
    return () => {
      if (animationId) cancelAnimationFrame(animationId)
      if (stream) stream.getTracks().forEach(t => t.stop())
    }
  }, [onScan, onClose, found])

  const handleManualImport = () => {
    if (!manual.trim()) return
    onScan(manual.trim())
    onClose()
  }

  return (
    <div className="space-y-4">
      <div className="relative rounded-2xl overflow-hidden bg-black aspect-[4/3] flex items-center justify-center">
        <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
        <canvas ref={canvasRef} className="hidden" />
        {!scanning && !error && !found && <div className="absolute inset-0 flex items-center justify-center text-white text-sm">در حال راه‌اندازی دوربین...</div>}
        {error && <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-white text-sm bg-black/70">{error}</div>}
        {found && <div className="absolute inset-0 flex items-center justify-center bg-success/90 text-white font-bold">✓ خوانده شد!</div>}
        <div className="absolute inset-0 border-2 border-white/20 m-8 rounded-xl pointer-events-none">
          <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-xl" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-xl" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-xl" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-xl" />
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-bold">یا متن QR را اینجا بچسبان:</p>
        <textarea value={manual} onChange={e => setManual(e.target.value)} placeholder="متن کد..." className="w-full min-h-[100px] rounded-xl border p-3 text-xs bg-background" dir="ltr" />
        <Button onClick={handleManualImport} disabled={!manual.trim()} className="w-full"><Check className="h-4 w-4" />وارد کردن</Button>
      </div>
      <p className="text-xs text-muted-foreground text-center">دوربین را روی QR نگه دار. اگر خودکار نخواند، متن را کپی و اینجا بچسبان.</p>
    </div>
  )
}
