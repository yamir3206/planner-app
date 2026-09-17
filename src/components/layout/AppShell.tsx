import * as React from 'react'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { Header } from './Header'

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-primary/5 to-accent/5 blur-3xl" />
      </div>

      <Header 
        onMenu={() => setSidebarOpen(true)} 
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        sidebarCollapsed={sidebarCollapsed}
      />
      
      <div className="flex">
        <Sidebar 
          open={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        
        <main className={`flex-1 min-w-0 transition-all duration-300 ease-out ${sidebarCollapsed ? 'lg:mr-0' : 'lg:mr-[280px]'}`}>
          <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8 pb-24 lg:pb-8">
            <div className="animate-fade-in">{children}</div>
          </div>
          <footer className="border-t bg-card/50 backdrop-blur-sm mt-8">
            <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="font-bold">آکسون v1.4.0 • هر دیتابیس • هر جا • ۲۰ تم زیبا</span>
                  <span className="h-1 w-1 bg-muted-foreground rounded-full" />
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 bg-success rounded-full animate-pulse" />
                    آفلاین • ابری • خصوصی
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span>📱 موبایل</span>
                  <span>💻 دسکتاپ</span>
                  <span>🌐 وب</span>
                  <span>⚡ PWA</span>
                </div>
              </div>
            </div>
          </footer>
        </main>
      </div>
      
      <BottomNav />
      
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}

export function PageContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={['space-y-6 animate-fade-in', className].filter(Boolean).join(' ')}>{children}</div>
}
