import * as React from 'react'
import { PageContainer } from '@/components/layout/AppShell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Input'
import { useThemeStore, useSettingsStore } from '@/app/providers'
import { useAuth } from '@/hooks/useAuth'
import { importExportService } from '@/core/services/importExportService'
import { profileRepository } from '@/core/repositories'
import { subjectService } from '@/core/services/subjectService'
import { UserProfile } from '@/core/domain/models/UserProfile'
import { THEMES, APP_VERSION } from '@/lib/constants'
import { Moon, Sun, Monitor, Hash, Download, Upload, User, Trash2, AlertTriangle, Palette, LogOut, ShieldCheck, BookOpen, Sparkles, CheckCircle, Database, HardDrive, Cloud, Server } from 'lucide-react'
import { toPersianDigits } from '@/core/utils/persian/numbers'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { getCurrentDatabaseConfig, saveDatabaseConfig, getDatabaseDisplayName, getDatabaseDescription, DatabaseType } from '@/core/storage/databaseConfig'
import { storageFactory } from '@/core/storage/storageFactory'

export function SettingsPage() {
  const navigate = useNavigate()
  const { mode, colorTheme, setMode, setColorTheme } = useThemeStore()
  const { settings, updateSettings } = useSettingsStore()
  const { session, isLoggedIn, logout } = useAuth()
  const [profile, setProfile] = React.useState<UserProfile | null>(null)
  const [profileForm, setProfileForm] = React.useState({ name: '', field: 'tajrobi' as any, grade: '12' as any, target: '', dailyTargetMinutes: 360 })
  const [importError, setImportError] = React.useState<string | null>(null)
  const [exportSummary, setExportSummary] = React.useState<{ subjects: number; tasks: number; sessions: number; goals: number; users: number } | null>(null)
  const [dbConfig, setDbConfig] = React.useState(getCurrentDatabaseConfig())
  const [dbTestResult, setDbTestResult] = React.useState<{ success: boolean; message: string } | null>(null)
  const [dbTesting, setDbTesting] = React.useState(false)
  const [themeToast, setThemeToast] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    profileRepository.getProfile().then(p => {
      if (p) {
        setProfile(p)
        setProfileForm({ name: p.name, field: p.field, grade: p.grade, target: p.target, dailyTargetMinutes: p.dailyTargetMinutes })
      }
    })
    importExportService.getExportSummary().then(setExportSummary)
  }, [])

  const handleThemeChange = (themeId: string, themeName: string) => {
    setColorTheme(themeId as any)
    updateSettings({ colorTheme: themeId as any } as any)
    setThemeToast(themeName)
    setTimeout(() => setThemeToast(null), 2000)
  }

  const handleModeChange = (newMode: 'light' | 'dark' | 'system') => {
    setMode(newMode)
    updateSettings({ theme: newMode } as any)
  }

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
      alert(`✓ ذخیره شد!\n\nشامل:\n- ${summary.users} حساب\n- ${summary.subjects} درس\n- ${summary.tasks} برنامه\n- ${summary.sessions} جلسه\n- ${summary.goals} هدف`)
    } catch (e) {
      alert('خطا: ' + (e as Error).message)
    }
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
      const message = hasUsers ? `فایل شامل ${data.users.length} حساب، ${data.subjects?.length || 0} درس، ${data.tasks?.length || 0} کار است.\n\nمطمئنی؟` : 'مطمئنی؟ اطلاعات فعلی با فایل ترکیب می‌شود.'
      if (!confirm(message)) return
      const result = await importExportService.importData(text)
      if (result.success) {
        const summary = await importExportService.getExportSummary()
        setExportSummary(summary)
        alert(`✓ وارد شد! صفحه بارگذاری می‌شود.`)
        window.location.reload()
      } else setImportError(result.errors?.join('\n') || 'خطا')
    } catch (err) {
      setImportError('خطا: ' + (err as Error).message)
    }
  }

  const handleClearData = async () => {
    if (!confirm('همه اطلاعات پاک شود؟')) return
    if (!confirm('تأیید نهایی: کارها، جلسات و دروس حذف می‌شوند!')) return
    try {
      const { subjectRepository, taskRepository, sessionRepository, goalRepository } = await import('@/core/repositories')
      await Promise.all([subjectRepository.clear(), taskRepository.clear(), sessionRepository.clear(), goalRepository.clear()])
      localStorage.removeItem('axon_gamification')
      localStorage.removeItem('axon_achievements')
      localStorage.removeItem('axon_challenges')
      localStorage.removeItem('axon_xp_history')
      alert('حذف شد')
      window.location.reload()
    } catch (e) { alert('خطا: ' + (e as Error).message) }
  }

  const handleLogout = async () => { if (confirm('خارج شوی؟')) { await logout(); navigate('/login') } }

  const handleDatabaseChange = async (type: DatabaseType) => {
    const newConfig = { ...dbConfig, type }
    setDbConfig(newConfig)
  }

  const handleSaveDatabase = () => { saveDatabaseConfig(dbConfig) }

  const handleTestDatabase = async () => {
    setDbTesting(true)
    const result = await storageFactory.testConnection()
    setDbTestResult(result)
    setDbTesting(false)
  }

  const themeCategories = {
    main: 'اصلی',
    nature: 'طبیعت',
    warm: 'گرم',
    soft: 'ملایم',
    dark: 'تیره',
    special: 'ویژه'
  }

  const groupedThemes = React.useMemo(() => {
    const grouped: Record<string, typeof THEMES[number][] > = {}
    THEMES.forEach(theme => {
      const cat = theme.category
      if (!grouped[cat]) grouped[cat] = []
      grouped[cat].push(theme)
    })
    return grouped
  }, [])

  const currentThemeData = THEMES.find(t => t.id === colorTheme)

  return (
    <PageContainer>
      {/* Toast تم */}
      {themeToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-foreground text-background px-6 py-3 rounded-full shadow-large flex items-center gap-3 animate-scale-in">
          <div className="h-3 w-3 rounded-full bg-primary animate-pulse" />
          <span className="font-bold text-sm">تم {themeToast} فعال شد ✓</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black">تنظیمات</h1>
        <Badge variant="secondary" className="gap-1">نسخه {APP_VERSION}</Badge>
      </div>

      {/* پیش‌نمایش تم فعلی */}
      <Card className="border-2 border-primary/20 shadow-medium overflow-hidden">
        <div className="h-2 w-full bg-gradient-to-r from-primary via-accent to-primary" />
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl shadow-medium flex items-center justify-center text-white text-2xl"
                 style={{ background: `linear-gradient(135deg, ${currentThemeData?.primary}, ${currentThemeData?.accent})` }}>
              🎨
            </div>
            <div className="flex-1">
              <p className="font-black text-base">تم فعلی: {currentThemeData?.name}</p>
              <p className="text-sm text-muted-foreground">{currentThemeData?.description}</p>
              <div className="flex gap-2 mt-2">
                <div className="h-6 px-3 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center">نمونه دکمه</div>
                <div className="h-6 px-3 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center">تاکید</div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">پس‌زمینه</p>
              <div className="h-10 w-10 rounded-xl border-2 border-border mt-1" style={{ background: 'hsl(var(--background))' }} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={isLoggedIn ? 'border-success/30 bg-success/5 shadow-soft' : 'border-warning/30 bg-warning/5 shadow-soft'}>
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${isLoggedIn ? 'bg-success text-white' : 'bg-warning text-white'}`}>
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-sm">{isLoggedIn ? `سلام، ${session?.displayName}` : 'وارد نشده‌ای'}</p>
              <p className="text-xs text-muted-foreground">{isLoggedIn ? `@${session?.username} • حساب فعال` : 'برای ذخیره اطلاعات وارد شو'}</p>
            </div>
          </div>
          {isLoggedIn ? <Button variant="ghost" size="sm" onClick={handleLogout}><LogOut className="h-4 w-4" />خروج</Button> : <Button size="sm" onClick={() => navigate('/login')}>ورود</Button>}
        </CardContent>
      </Card>

      <Card className="shadow-soft border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white">
              <Database className="h-4 w-4" />
            </div>
            دیتابیس و ذخیره‌سازی
            <Badge variant="success" className="mr-auto gap-1">
              <HardDrive className="h-3 w-3" />
              {getDatabaseDisplayName(dbConfig.type)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl bg-primary/5 border border-primary/10 p-4 space-y-3">
            <h4 className="font-bold text-sm flex items-center gap-2">
              <Server className="h-4 w-4 text-primary" />
              کجا اجرا می‌شود؟
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              این برنامه در هر جایی قابل اجراست: کامپیوتر شخصی، سرور، موبایل، یا فضای ابری. 
              اطلاعاتت به صورت پیش‌فرض روی دستگاه خودت ذخیره می‌شود و بدون اینترنت هم کار می‌کند.
              اگر بخواهی می‌توانی به دیتابیس ابری وصل شوی.
            </p>
          </div>

          <div>
            <p className="text-sm font-bold mb-3">نوع دیتابیس</p>
            <div className="grid grid-cols-1 gap-2">
              {(['auto', 'indexeddb', 'localstorage', 'supabase', 'firebase', 'rest'] as DatabaseType[]).map(type => (
                <button
                  key={type}
                  onClick={() => handleDatabaseChange(type)}
                  className={`rounded-xl p-3 border-2 text-right transition-all flex items-center gap-3 ${
                    dbConfig.type === type ? 'border-primary bg-primary/5 shadow-soft' : 'border-border hover:border-primary/30 bg-card'
                  }`}
                >
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                    dbConfig.type === type ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground'
                  }`}>
                    {type === 'auto' ? <Sparkles className="h-5 w-5" /> : 
                     type === 'indexeddb' ? <HardDrive className="h-5 w-5" /> :
                     type === 'localstorage' ? <Database className="h-5 w-5" /> :
                     type === 'supabase' ? <Cloud className="h-5 w-5" /> :
                     type === 'firebase' ? <Cloud className="h-5 w-5" /> :
                     <Server className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 text-right">
                    <div className="font-bold text-sm">{getDatabaseDisplayName(type)}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{getDatabaseDescription(type)}</div>
                  </div>
                  {dbConfig.type === type && <div className="text-primary">✓</div>}
                </button>
              ))}
            </div>
          </div>

          {(dbConfig.type === 'supabase' || dbConfig.type === 'firebase' || dbConfig.type === 'rest') && (
            <div className="space-y-3 p-4 rounded-xl bg-secondary/50 border">
              <p className="text-sm font-bold">تنظیمات اتصال</p>
              <Input 
                label="آدرس سرور / URL" 
                placeholder="https://your-project.supabase.co" 
                value={dbConfig.url || ''} 
                onChange={e => setDbConfig({ ...dbConfig, url: e.target.value })}
                dir="ltr"
              />
              <Input 
                label="کلید API (اختیاری)" 
                placeholder="کلید دسترسی" 
                value={dbConfig.apiKey || ''} 
                onChange={e => setDbConfig({ ...dbConfig, apiKey: e.target.value })}
                type="password"
                dir="ltr"
              />
              <p className="text-xs text-muted-foreground">
                برای اجرای محلی، خالی بگذار — از حافظه مرورگر استفاده می‌شود.
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={handleSaveDatabase} className="flex-1">
              <Database className="h-4 w-4" />
              ذخیره و اعمال
            </Button>
            <Button variant="secondary" onClick={handleTestDatabase} loading={dbTesting}>
              تست اتصال
            </Button>
          </div>

          {dbTestResult && (
            <div className={`rounded-xl p-3 flex gap-2 ${dbTestResult.success ? 'bg-success/10 border border-success/20 text-success' : 'bg-destructive/10 border border-destructive/20 text-destructive'}`}>
              <CheckCircle className={`h-5 w-5 shrink-0 ${dbTestResult.success ? 'text-success' : 'text-destructive'}`} />
              <span className="text-sm">{dbTestResult.message}</span>
            </div>
          )}

          <div className="rounded-xl bg-secondary/30 border p-3">
            <p className="text-xs font-bold mb-2">💡 راهنما:</p>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li><strong>خودکار:</strong> بهترین گزینه — سریع و آفلاین</li>
              <li><strong>مرورگر:</strong> فقط روی همین دستگاه، بدون نیاز به سرور</li>
              <li><strong>ابری:</strong> اطلاعات در همه دستگاه‌ها همگام می‌شود</li>
              <li>برای اجرای روی سرور شخصی، متغیرهای محیطی را تنظیم کن</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" />پروفایل</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input label="نام" placeholder="نام شما" value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="رشته" value={profileForm.field} onChange={e => setProfileForm({ ...profileForm, field: e.target.value as any })} options={[{ value: 'tajrobi', label: 'علوم تجربی 🧬' }, { value: 'riazi', label: 'ریاضی فیزیک 📐' }, { value: 'ensani', label: 'علوم انسانی 📚' }, { value: 'honar', label: 'هنر 🎨' }, { value: 'zaban', label: 'زبان 🌍' }]} />
            <Select label="پایه" value={profileForm.grade} onChange={e => setProfileForm({ ...profileForm, grade: e.target.value as any })} options={[{ value: '10', label: 'دهم' }, { value: '11', label: 'یازدهم' }, { value: '12', label: 'دوازدهم' }, { value: 'graduate', label: 'فارغ‌التحصیل' }]} />
          </div>
          <Input label="هدف (مثلا پزشکی تهران)" placeholder="هدف شما" value={profileForm.target} onChange={e => setProfileForm({ ...profileForm, target: e.target.value })} />
          <Input label="هدف روزانه (دقیقه)" type="number" value={profileForm.dailyTargetMinutes.toString()} onChange={e => setProfileForm({ ...profileForm, dailyTargetMinutes: parseInt(e.target.value) || 0 })} />
          <Button onClick={handleSaveProfile} className="w-full rounded-xl bg-gradient-to-br from-primary to-accent">
            <BookOpen className="h-4 w-4" />ذخیره
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-soft border-2 border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white">
              <Palette className="h-4 w-4" />
            </div>
            ظاهر زیبا و تم‌ها
            <Sparkles className="h-4 w-4 text-warning mr-auto" />
            <Badge variant="secondary" className="text-[10px]">۲۰ تم</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(themeCategories).map(([catKey, catLabel]) => {
            const themes = groupedThemes[catKey as keyof typeof themeCategories] as any
            if (!themes || themes.length === 0) return null
            return (
              <div key={catKey}>
                <p className="text-sm font-bold mb-3 flex items-center gap-2">
                  <span className="h-1 w-6 rounded-full bg-primary" />
                  {catLabel}
                  <Badge variant="secondary" className="text-[10px]">{themes.length}</Badge>
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {themes.map((t: any) => (
                    <button 
                      key={t.id} 
                      onClick={() => handleThemeChange(t.id, t.name)} 
                      className={`rounded-xl p-3 border-2 text-right transition-all hover:scale-[1.02] active:scale-[0.98] group relative overflow-hidden ${
                        colorTheme === t.id ? 'border-primary shadow-medium scale-[1.02] bg-primary/5 ring-2 ring-primary/20' : 'border-border hover:border-primary/50 bg-card hover:shadow-soft'
                      }`}
                    >
                      {colorTheme === t.id && (
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent" />
                      )}
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-8 w-8 rounded-full shadow-sm ring-2 ring-white group-hover:ring-4 transition-all flex items-center justify-center" 
                             style={{ background: `linear-gradient(135deg, ${t.primary}, ${t.accent})` }}>
                          {colorTheme === t.id && <span className="text-white text-xs">✓</span>}
                        </div>
                        <span className="font-bold text-sm">{t.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground text-right line-clamp-1">{t.description}</p>
                      {colorTheme === t.id && <div className="mt-2 text-xs text-primary font-black flex items-center gap-1">✓ فعال</div>}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}

          <div className="pt-4 border-t space-y-4">
            <div>
              <p className="text-sm font-bold mb-2 flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                حالت نمایش
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleModeChange('light')}
                  className={`rounded-xl p-3 border-2 flex flex-col items-center gap-2 transition-all ${
                    mode === 'light' ? 'border-primary bg-primary/10 shadow-soft' : 'border-border bg-card hover:border-primary/30'
                  }`}
                >
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${mode === 'light' ? 'bg-primary text-white' : 'bg-secondary'}`}>
                    <Sun className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold">روشن</span>
                  {mode === 'light' && <span className="text-[10px] text-primary">✓</span>}
                </button>
                <button
                  onClick={() => handleModeChange('dark')}
                  className={`rounded-xl p-3 border-2 flex flex-col items-center gap-2 transition-all ${
                    mode === 'dark' ? 'border-primary bg-primary/10 shadow-soft' : 'border-border bg-card hover:border-primary/30'
                  }`}
                >
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${mode === 'dark' ? 'bg-primary text-white' : 'bg-secondary'}`}>
                    <Moon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold">تاریک</span>
                  {mode === 'dark' && <span className="text-[10px] text-primary">✓</span>}
                </button>
                <button
                  onClick={() => handleModeChange('system')}
                  className={`rounded-xl p-3 border-2 flex flex-col items-center gap-2 transition-all ${
                    mode === 'system' ? 'border-primary bg-primary/10 shadow-soft' : 'border-border bg-card hover:border-primary/30'
                  }`}
                >
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${mode === 'system' ? 'bg-primary text-white' : 'bg-secondary'}`}>
                    <Monitor className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold">سیستم</span>
                  {mode === 'system' && <span className="text-[10px] text-primary">✓</span>}
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <p className="text-sm font-bold">اعداد فارسی</p>
                <p className="text-xs text-muted-foreground">نمایش اعداد به صورت فارسی</p>
              </div>
              <Button variant={settings.persianNumbers ? 'primary' : 'secondary'} size="sm" onClick={() => updateSettings({ persianNumbers: !settings.persianNumbers })}>
                <Hash className="h-4 w-4" />{settings.persianNumbers ? 'فارسی' : 'انگلیسی'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            پشتیبان‌گیری
            <Badge variant="success" className="mr-auto">امن</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button variant="outline" size="lg" onClick={handleExport} className="rounded-xl border-2 border-primary/20 hover:border-primary/50 hover:bg-primary/5 h-auto py-4 flex-col gap-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white">
                <Download className="h-5 w-5" />
              </div>
              <div className="text-center">
                <p className="font-bold">ذخیره پشتیبان</p>
                <p className="text-xs text-muted-foreground mt-1">همه اطلاعات در یک فایل</p>
              </div>
            </Button>
            <Button variant="outline" size="lg" onClick={handleImportClick} className="rounded-xl border-2 border-success/20 hover:border-success/50 hover:bg-success/5 h-auto py-4 flex-col gap-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-success to-emerald-600 flex items-center justify-center text-white">
                <Upload className="h-5 w-5" />
              </div>
              <div className="text-center">
                <p className="font-bold">بارگذاری پشتیبان</p>
                <p className="text-xs text-muted-foreground mt-1">وارد کردن فایل</p>
              </div>
            </Button>
            <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleFileChange} />
          </div>

          {importError && (
            <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 flex gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
              <pre className="text-xs whitespace-pre-wrap">{importError}</pre>
            </div>
          )}

          {exportSummary && (
            <div className="grid grid-cols-5 gap-2 text-center">
              <div className="rounded-xl bg-card border p-2">
                <p className="text-lg font-black text-primary">{toPersianDigits(exportSummary.users.toString())}</p>
                <p className="text-[10px] text-muted-foreground">حساب</p>
              </div>
              <div className="rounded-xl bg-card border p-2">
                <p className="text-lg font-black">{toPersianDigits(exportSummary.subjects.toString())}</p>
                <p className="text-[10px] text-muted-foreground">درس</p>
              </div>
              <div className="rounded-xl bg-card border p-2">
                <p className="text-lg font-black">{toPersianDigits(exportSummary.tasks.toString())}</p>
                <p className="text-[10px] text-muted-foreground">کار</p>
              </div>
              <div className="rounded-xl bg-card border p-2">
                <p className="text-lg font-black text-success">{toPersianDigits(exportSummary.sessions.toString())}</p>
                <p className="text-[10px] text-muted-foreground">جلسه</p>
              </div>
              <div className="rounded-xl bg-card border p-2">
                <p className="text-lg font-black">{toPersianDigits(exportSummary.goals.toString())}</p>
                <p className="text-[10px] text-muted-foreground">هدف</p>
              </div>
            </div>
          )}

          <div className="pt-4 border-t">
            <p className="text-sm font-bold text-destructive mb-2">حذف اطلاعات</p>
            <Button variant="danger" size="sm" onClick={handleClearData} className="rounded-xl">
              <Trash2 className="h-4 w-4" />حذف همه
            </Button>
            <p className="text-xs text-muted-foreground mt-2">برگشت ندارد. اول پشتیبان بگیر.</p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-soft border-0 bg-gradient-to-br from-card to-primary/5">
        <CardContent className="p-4 text-center text-xs text-muted-foreground">
          <p className="font-bold">آکسون — نسخه {APP_VERSION} • همه‌جا قابل اجرا</p>
          <p className="mt-1">ساخته شده با ❤️ برای کنکوری‌ها</p>
          <p className="mt-2 flex items-center justify-center gap-2 flex-wrap">
            <span>PWA</span><span>•</span><span>آفلاین</span><span>•</span><span>فارسی</span><span>•</span><span>۲۰ تم</span><span>•</span><span>هر دیتابیس</span>
          </p>
        </CardContent>
      </Card>
    </PageContainer>
  )
}
