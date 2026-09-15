import * as React from 'react'
import { Menu, Sparkles, Smartphone, Monitor, Tablet, Zap, PanelRightClose, PanelRightOpen } from 'lucide-react'
import { useSettingsStore } from '@/app/providers'
import { useAuth } from '@/hooks/useAuth'
import { useStreak } from '@/hooks/useStreak'
import { toPersianDigits } from '@/core/utils/persian/numbers'

interface HeaderProps { onMenu: () => void; onToggleSidebar?: () => void; sidebarCollapsed?: boolean }

export function Header({ onMenu, onToggleSidebar, sidebarCollapsed }: HeaderProps) {
  const { settings } = useSettingsStore()
  const { user } = useAuth()
  const { current } = useStreak()
  const [deviceType, setDeviceType] = React.useState<'mobile' | 'tablet' | 'desktop'>('desktop')
  React.useEffect(() => {
    const checkDevice = () => { if (window.innerWidth < 768) setDeviceType('mobile'); else if (window.innerWidth < 1024) setDeviceType('tablet'); else setDeviceType('desktop') }
    checkDevice(); window.addEventListener('resize', checkDevice); return () => window.removeEventListener('resize', checkDevice)
  }, [])
  return (
    <header className="sticky top-0 z-30 border-b bg-card/80 backdrop-blur-xl supports-[backdrop-filter]:bg-card/70 shadow-soft">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button className="inline-flex h-10 w-10 items-center justify-center rounded-xl border bg-card shadow-soft hover:shadow-medium transition-all lg:hidden touch-target" onClick={onMenu} aria-label="menu"><Menu className="h-5 w-5" /></button>
          {onToggleSidebar && <button className="hidden lg:inline-flex h-10 w-10 items-center justify-center rounded-xl border bg-card shadow-soft hover:shadow-medium transition-all touch-target" onClick={onToggleSidebar} aria-label="toggle sidebar" title={sidebarCollapsed ? 'نمایش سایدبار' : 'مخفی کردن سایدبار'}>{sidebarCollapsed ? <PanelRightOpen className="h-5 w-5" /> : <PanelRightClose className="h-5 w-5" />}</button>}
          <div className="flex items-center gap-3"><div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-soft"><Sparkles className="h-5 w-5" /></div><div><div className="font-black tracking-tight text-base md:text-lg">آکسون</div><div className="hidden md:flex items-center gap-2 text-[11px] text-muted-foreground"><span>کنکور تجربی 🧬</span><span className="h-1 w-1 bg-muted-foreground rounded-full" /><span className="flex items-center gap-1">{deviceType === 'mobile' ? <Smartphone className="h-3 w-3" /> : deviceType === 'tablet' ? <Tablet className="h-3 w-3" /> : <Monitor className="h-3 w-3" />}{deviceType === 'mobile' ? 'موبایل' : deviceType === 'tablet' ? 'تبلت' : 'دسکتاپ'}</span></div></div></div>
          <div className="hidden md:flex items-center gap-2 ms-4"><div className="rounded-full bg-success/10 border border-success/20 px-3 py-1 flex items-center gap-1.5"><div className="h-2 w-2 bg-success rounded-full animate-pulse" /><span className="text-xs font-medium text-success">کراس‌پلتفرم • یک رمز • تمام دستگاه‌ها</span></div></div>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <div className="hidden sm:flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 border">{deviceType === 'mobile' ? <Smartphone className="h-3.5 w-3.5" /> : deviceType === 'tablet' ? <Tablet className="h-3.5 w-3.5" /> : <Monitor className="h-3.5 w-3.5" />}<span className="text-xs font-medium">{deviceType === 'mobile' ? 'موبایل' : deviceType === 'tablet' ? 'تبلت' : 'دسکتاپ'}</span><span className="h-3 w-px bg-border" /><span className="text-xs text-muted-foreground">{settings.persianNumbers ? 'اعداد فارسی' : 'EN'}</span></div>
          <div className="flex items-center gap-2 rounded-full bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 px-3 py-1.5"><span className="text-sm">🔥</span><span className="text-sm font-black">{settings.persianNumbers ? toPersianDigits(current.toString()) : current}</span><span className="hidden sm:inline text-xs text-muted-foreground">روز</span></div>
          {user && <div className="flex items-center gap-2 rounded-full bg-card border shadow-soft px-2 py-1 ps-1"><div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold">{(user.displayName || user.username).charAt(0)}</div><span className="hidden md:inline text-sm font-medium max-w-[100px] truncate">{user.displayName || user.username}</span></div>}
          <div className="hidden md:flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-1"><Zap className="h-3 w-3 text-primary" /><span className="text-[11px] font-bold text-primary">v1.2.1</span></div>
        </div>
      </div>
    </header>
  )
}
