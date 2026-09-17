import * as React from 'react'
import { Outlet } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { AppProviders } from './providers'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { PWAUpdatePrompt } from '@/components/common/PWAUpdatePrompt'
import { useAuth } from '@/hooks/useAuth'

function AppLayout() {
  const { loadSession } = useAuth()

  React.useEffect(() => {
    loadSession()
  }, [loadSession])

  return (
    <AppShell>
      <Outlet />
      <PWAUpdatePrompt />
    </AppShell>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <AppLayout />
      </AppProviders>
    </ErrorBoundary>
  )
}
