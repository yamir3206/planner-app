import * as React from 'react'
import { Button } from '@/components/ui/Button'
import { RefreshCw, X } from 'lucide-react'

export function PWAUpdatePrompt() {
  const [needRefresh, setNeedRefresh] = React.useState(false)
  const [offlineReady, setOfflineReady] = React.useState(false)
  const [updateSW, setUpdateSW] = React.useState<(() => Promise<void>) | null>(null)

  React.useEffect(() => {
    // vite-plugin-pwa virtual module - only in production
    import('virtual:pwa-register/react')
      .then(({ useRegisterSW }) => {
        const {
          needRefresh: [needRefreshValue],
          offlineReady: [offlineReadyValue],
          updateServiceWorker
        } = useRegisterSW({
          onRegistered(r: any) {
            console.log('SW Registered', r)
          },
          onRegisterError(error: any) {
            console.log('SW registration error', error)
          }
        })

      // We need to watch these values - but useRegisterSW returns refs, we need to poll or use effect
      // Simpler: use interval to check
      const interval = setInterval(() => {
        // @ts-ignore
        if (needRefreshValue) setNeedRefresh(true)
        // @ts-ignore
        if (offlineReadyValue) setOfflineReady(true)
      }, 1000)

      setUpdateSW(() => updateServiceWorker)

      return () => clearInterval(interval)
    }).catch(() => {
      // PWA not available in dev
    })
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
