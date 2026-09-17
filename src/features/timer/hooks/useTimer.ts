import * as React from 'react'
import { timerEngine, TimerState, TimerMode } from '../engine/timerEngine'
import { STORAGE_KEYS } from '@/lib/constants'
import { sessionService } from '@/core/services/sessionService'

export function useTimer() {
  const [state, setState] = React.useState<TimerState>(() => timerEngine.getState())

  React.useEffect(() => {
    const unsubscribe = timerEngine.subscribe(setState)
    
    // Try restore from localStorage
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_TIMER)
      if (saved) {
        const parsed = JSON.parse(saved) as TimerState
        // Only restore if it was running or paused
        if (parsed.status === 'running' || parsed.status === 'paused') {
          timerEngine.restore(parsed)
        }
      }
    } catch (e) {
      console.warn('Failed to restore timer', e)
    }

    // Persist on change
    const persist = (s: TimerState) => {
      try {
        if (s.status === 'running' || s.status === 'paused') {
          localStorage.setItem(STORAGE_KEYS.ACTIVE_TIMER, JSON.stringify(s))
        } else {
          localStorage.removeItem(STORAGE_KEYS.ACTIVE_TIMER)
        }
      } catch {}
    }

    const unsub2 = timerEngine.subscribe(persist)

    // Handle visibility change - recalculate on focus
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        // Force recalculation
        const current = timerEngine.getState()
        if (current.status === 'running') {
          timerEngine.restore(current)
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('focus', handleVisibility)

    return () => {
      unsubscribe()
      unsub2()
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('focus', handleVisibility)
    }
  }, [])

  const start = React.useCallback((mode: TimerMode = 'free', targetMinutes: number = 0, subjectId?: string, taskId?: string) => {
    const targetSeconds = targetMinutes * 60
    timerEngine.start(mode, targetSeconds, subjectId, taskId)
  }, [])

  const pause = React.useCallback(() => timerEngine.pause(), [])
  const resume = React.useCallback(() => timerEngine.resume(), [])
  const reset = React.useCallback(() => timerEngine.reset(), [])

  const stop = React.useCallback(async () => {
    const finalState = timerEngine.stop()
    
    // Save session if elapsed > 60 seconds
    if (finalState.elapsedSeconds > 60 && finalState.subjectId) {
      try {
        await sessionService.create({
          subjectId: finalState.subjectId,
          taskId: finalState.taskId,
          startTime: new Date(finalState.startTimestamp || Date.now() - finalState.elapsedSeconds * 1000).toISOString(),
          endTime: new Date().toISOString(),
          duration: finalState.elapsedSeconds,
          pausedDuration: finalState.pausedSeconds,
          type: finalState.mode,
          status: 'completed',
          timeline: finalState.timeline.map(t => ({
            action: t.action,
            at: new Date(t.at).toISOString()
          }))
        })
      } catch (e) {
        console.error('Failed to save session', e)
      }
    }

    try {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_TIMER)
    } catch {}
  }, [])

  const remaining = React.useMemo(() => {
    if (state.mode === 'free') return 0
    return Math.max(0, state.targetSeconds - state.elapsedSeconds)
  }, [state])

  const progress = React.useMemo(() => {
    if (state.mode === 'free' || state.targetSeconds === 0) return 0
    return Math.min(100, (state.elapsedSeconds / state.targetSeconds) * 100)
  }, [state])

  return {
    state,
    start,
    pause,
    resume,
    stop,
    reset,
    remaining,
    progress,
    isRunning: state.status === 'running',
    isPaused: state.status === 'paused',
    isIdle: state.status === 'idle',
    isCompleted: state.status === 'completed'
  }
}
