import * as React from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, CalendarDays, ListChecks, Timer, BarChart3, Settings, BookOpen } from 'lucide-react'
const items = [
  { to: '/', icon: LayoutDashboard, label: 'داشبورد' },
  { to: '/today', icon: ListChecks, label: 'امروز' },
  { to: '/planner', icon: CalendarDays, label: 'برنامه' },
  { to: '/timer', icon: Timer, label: 'تایمر', primary: true },
  { to: '/sessions', icon: BookOpen, label: 'جلسات' },
  { to: '/analytics', icon: BarChart3, label: 'تحلیل' },
  { to: '/settings', icon: Settings, label: 'تنظیمات' }
]
export function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t bg-card/90 backdrop-blur-xl supports-[backdrop-filter]:bg-card/80 lg:hidden safe-bottom shadow-large">
      <div className="mx-auto max-w-7xl px-1 py-2">
        <div className="flex items-center justify-around">
          {items.map(({ to, icon: Icon, label, primary }) => (
            <NavLink key={to} to={to} className={({ isActive }) => ['flex flex-col items-center justify-center rounded-2xl px-2 py-2 text-[10px] font-medium transition-all duration-300 touch-target min-w-[64px] min-h-[56px]', primary ? 'bg-gradient-to-br from-primary to-accent text-white shadow-medium scale-105 -translate-y-1 border-2 border-white' : isActive ? 'bg-primary text-primary-foreground shadow-soft scale-105' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'].join(' ')}>
              <Icon className={`h-5 w-5 ${primary ? 'fill-white' : ''}`} />
              <span className="mt-1 leading-none">{label}</span>
            </NavLink>
          ))}
        </div>
      </div>
      <div className="flex justify-center pb-1"><div className="h-1 w-32 bg-foreground/10 rounded-full" /></div>
    </nav>
  )
}
