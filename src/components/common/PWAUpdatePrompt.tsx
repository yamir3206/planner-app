import * as React from 'react'
import { Button } from '@/components/ui/Button'
import { RefreshCw, X } from 'lucide-react'

export function PWAUpdatePrompt() {
  const [needRefresh, setNeedRefresh] = React.useState(false)
  const [offlineReady, setOfflineReady] = React.useState(false)
  const [updateSW, setUpdateSW] = React.useState<(() => Promise<void>) | null>(null)

  React.useEffect(() => {
    // Only try to load PWA if available
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      import('virtual:pwa-register/react')
        .then(({ useRegisterSW }) => {
          try {
            const result = useRegisterSW({
              onRegistered(r: any) { console.log('SW Registered', r) },
              onRegisterError(error: any) { console.log('SW registration error', error) }
            })
            // Handle the reactive values properly
            if (result) {
              const { needRefresh: needRefreshRef, offlineReady: offlineReadyRef, updateServiceWorker } = result as any
              // Poll for changes
              const interval = setInterval(() => {
                try {
                  if (needRefreshRef?.[0]) setNeedRefresh(true)
                  if (offlineReadyRef?.[0]) setOfflineReady(true)
                } catch {}
              }, 2000)
              setUpdateSW(() => updateServiceWorker)
              return () => clearInterval(interval)
            }
          } catch (e) {
            console.log('PWA setup error', e)
          }
        }).catch(() => {
          // PWA not available
        })
    }
  }, [])

  if (!needRefresh && !offlineReady) return null

  return (
    <div className="fixed bottom-20 lg:bottom-6 left-4 right-4 md:left-auto md:right-6 z-50 max-w-sm animate-fade-in">
      <div className="rounded-2xl border bg-card shadow-large p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            {needRefresh ? (
              <>
                <p className="font-medium text-sm">نسخه جدید موجود است!</p>
                <p className="text-xs text-muted-foreground mt-1">برای دریافت آخرین ویژگی‌ها، بروزرسانی کنید</p>
              </>
            ) : (
              <>
                <p className="font-medium text-sm">آماده کار آفلاین</p>
                <p className="text-xs text-muted-foreground mt-1">برنامه برای استفاده آفلاین آماده شد</p>
              </>
            )}
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setNeedRefresh(false); setOfflineReady(false) }}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        {needRefresh && (
          <div className="flex gap-2 mt-3">
            <Button size="sm" className="flex-1" onClick={() => updateSW?.()}>
              <RefreshCw className="h-4 w-4" />
              بروزرسانی
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setNeedRefresh(false)}>بعداً</Button>
          </div>
        )}
      </div>
    </div>
  )
}
