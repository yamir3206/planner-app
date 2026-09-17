import * as React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  Timer,
  History,
  BookOpen,
  Target,
  BarChart3,
  Settings,
  GraduationCap,
  X,
  Flame,
  LogIn,
  PanelRightClose,
  PanelRightOpen,
  Trophy
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { useStreak } from '@/hooks/useStreak'
import { toPersianDigits } from '@/core/utils/persian/numbers'

const navGroups = [
  { title: 'اصلی', items: [{ to: '/', icon: LayoutDashboard, label: 'داشبورد' }, { to: '/today', icon: Flame, label: 'امروز' }, { to: '/planner', icon: ClipboardList, label: 'برنامه‌ریز' }] },
  { title: 'مطالعه', items: [{ to: '/timer', icon: Timer, label: 'تایمر مطالعه' }, { to: '/sessions', icon: History, label: 'جلسات' }, { to: '/calendar', icon: CalendarDays, label: 'تقویم' }] },
  { title: 'مدیریت', items: [{ to: '/subjects', icon: BookOpen, label: 'درس‌ها (تجربی)' }, { to: '/goals', icon: Target, label: 'اهداف' }] },
  { title: 'تحلیل', items: [{ to: '/analytics', icon: BarChart3, label: 'آمار و تحلیل' }, { to: '/gamification', icon: Trophy, label: 'امتیاز و دستاورد' }] }
]

interface SidebarProps { open: boolean; onClose: () => void; collapsed?: boolean; onToggleCollapse?: () => void }

export function Sidebar({ open, onClose, collapsed = false, onToggleCollapse }: SidebarProps) {
  const { session, isLoggedIn } = useAuth()
  const { current } = useStreak()
  return (
    <aside className={cn('fixed inset-y-0 right-0 z-50 w-[280px] border-l bg-card shadow-medium lg:shadow-soft flex flex-col transition-transform duration-300 ease-out', open ? 'translate-x-0' : 'translate-x-full', collapsed ? 'lg:translate-x-full' : 'lg:translate-x-0', open ? 'lg:translate-x-0' : '')}>
      <div className="flex h-[64px] items-center justify-between border-b px-6">
        <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-soft"><GraduationCap className="h-5 w-5" /></div><div><h1 className="text-base font-bold">آکسون</h1><p className="text-xs text-muted-foreground -mt-1">کنکور تجربی 🧬</p></div></div>
        <div className="flex items-center gap-1">{onToggleCollapse && <Button variant="ghost" size="icon" className="hidden lg:flex h-8 w-8" onClick={onToggleCollapse} title={collapsed ? 'باز کردن سایدبار' : 'بستن سایدبار'}>{collapsed ? <PanelRightOpen className="h-4 w-4" /> : <PanelRightClose className="h-4 w-4" />}</Button>}<Button variant="ghost" size="icon" className="lg:hidden h-8 w-8" onClick={onClose}><X className="h-4 w-4" /></Button></div>
      </div>
      <div className="p-4 border-b">{isLoggedIn ? <div className="flex items-center gap-3 rounded-xl bg-secondary p-3"><div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">{session?.displayName?.charAt(0) || 'آ'}</div><div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{session?.displayName}</p><p className="text-xs text-muted-foreground truncate">@{session?.username}</p></div><div className="h-2 w-2 bg-success rounded-full animate-pulse" /></div> : <NavLink to="/login" onClick={onClose} className="flex items-center gap-3 rounded-xl bg-primary/10 border border-primary/20 p-3 hover:bg-primary/20 transition-colors"><div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-white"><LogIn className="h-5 w-5" /></div><div><p className="text-sm font-medium">ورود / ثبت‌نام</p><p className="text-xs text-muted-foreground">امن با رمزنگاری • یک رمز</p></div></NavLink>}</div>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">{navGroups.map((group) => (<div key={group.title} className="space-y-2"><h2 className="px-3 text-xs font-semibold text-muted-foreground tracking-wider">{group.title}</h2><nav className="space-y-1">{group.items.map((item) => (<NavLink key={item.to} to={item.to} onClick={onClose} className={({ isActive }) => cn('flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground', isActive ? 'bg-primary text-primary-foreground shadow-soft' : 'text-muted-foreground')}><item.icon className="h-5 w-5" />{item.label}</NavLink>))}</nav></div>))}</div>
      <div className="border-t p-4 space-y-3"><NavLink to="/settings" onClick={onClose} className={({ isActive }) => cn('flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground', isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground')}><Settings className="h-5 w-5" />تنظیمات و همگام‌سازی</NavLink><div className="rounded-xl bg-gradient-to-br from-primary to-accent p-4 text-primary-foreground shadow-medium"><p className="text-sm font-medium flex items-center gap-2">🔥 {toPersianDigits(current.toString())} روز متوالی</p><p className="text-xs opacity-90 mt-1">عالی پیش میری! ادامه بده</p><div className="mt-3 h-1.5 bg-white/20 rounded-full overflow-hidden"><div className="h-full bg-white rounded-full" style={{ width: `${Math.min(100, current * 10)}%` }} /></div></div></div>
    </aside>
  )
}
