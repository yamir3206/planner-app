import { createBrowserRouter, createHashRouter, Navigate } from 'react-router-dom'
import App from './App'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { TodayPage } from '@/features/today/TodayPage'
import { PlannerPage } from '@/features/planner/PlannerPage'
import { CalendarPage } from '@/features/calendar/CalendarPage'
import { TimerPage } from '@/features/timer/TimerPage'
import { SessionsPage } from '@/features/sessions/SessionsPage'
import { SubjectsPage } from '@/features/subjects/SubjectsPage'
import { GoalsPage } from '@/features/goals/GoalsPage'
import { AnalyticsPage } from '@/features/analytics/AnalyticsPage'
import { SettingsPage } from '@/features/settings/SettingsPage'
import { GamificationPage } from '@/features/gamification/GamificationPage'
import { LoginPage } from '@/features/auth/LoginPage'
import { RegisterPage } from '@/features/auth/RegisterPage'

const routes = [
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/register',
    element: <RegisterPage />
  },
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'today', element: <TodayPage /> },
      { path: 'planner', element: <PlannerPage /> },
      { path: 'calendar', element: <CalendarPage /> },
      { path: 'timer', element: <TimerPage /> },
      { path: 'sessions', element: <SessionsPage /> },
      { path: 'subjects', element: <SubjectsPage /> },
      { path: 'goals', element: <GoalsPage /> },
      { path: 'analytics', element: <AnalyticsPage /> },
      { path: 'gamification', element: <GamificationPage /> },
      { path: 'settings', element: <SettingsPage /> }
    ]
  },
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
]

// For GitHub Pages compatibility, use BrowserRouter with basename
const useHash = import.meta.env.VITE_USE_HASH === 'true'

export const router = useHash
  ? createHashRouter(routes)
  : createBrowserRouter(routes, {
      basename: import.meta.env.BASE_URL
    })
