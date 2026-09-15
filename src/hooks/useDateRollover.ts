import * as React from 'react'
import { getTodayString } from '@/core/utils/date/jalali'

export function useDateRollover(callback?: () => void) {
  const [today, setToday] = React.useState(getTodayString())

  React.useEffect(() => {
    const check = () => {
      const newToday = getTodayString()
      if (newToday !== today) {
        setToday(newToday)
        callback?.()
      }
    }

    // Check every minute
    const interval = setInterval(check, 60 * 1000)

    // Also check on visibility change (when user returns to tab after midnight)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') check()
    }

    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [today, callback])

  return today
}
