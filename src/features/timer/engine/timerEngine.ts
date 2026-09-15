/**
 * Timer Engine - محاسبه زمان واقعی با timestamp
 * جلوگیری از drift و کارکرد درست در background/sleep
 */

export type TimerMode = 'pomodoro' | 'free' | 'countdown'
export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed'

export interface TimerState {
  mode: TimerMode
  status: TimerStatus
  targetSeconds: number // for pomodoro/countdown, 0 for free
  elapsedSeconds: number // total elapsed excluding paused
  pausedSeconds: number
  startTimestamp: number | null // Date.now() when started
  pauseTimestamp: number | null // Date.now() when paused
  timeline: { action: 'start' | 'pause' | 'resume' | 'stop'; at: number }[]
  subjectId?: string
  taskId?: string
}

export class TimerEngine {
  private state: TimerState
  private intervalId: number | null = null
  private listeners: Set<(state: TimerState) => void> = new Set()

  constructor(initial?: Partial<TimerState>) {
    this.state = {
      mode: 'free',
      status: 'idle',
      targetSeconds: 0,
      elapsedSeconds: 0,
      pausedSeconds: 0,
      startTimestamp: null,
      pauseTimestamp: null,
      timeline: [],
      ...initial
    }
  }

  getState(): TimerState {
    return { ...this.state }
  }

  subscribe(listener: (state: TimerState) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notify() {
    this.listeners.forEach((l) => l(this.getState()))
  }

  private calculateElapsed(): number {
    if (this.state.status === 'idle') return this.state.elapsedSeconds
    if (this.state.status === 'paused') return this.state.elapsedSeconds

    if (this.state.startTimestamp === null) return this.state.elapsedSeconds

    const now = Date.now()
    const totalSinceStart = Math.floor((now - this.state.startTimestamp) / 1000)
    return totalSinceStart - this.state.pausedSeconds
  }

  private updateElapsed() {
    const elapsed = this.calculateElapsed()
    this.state.elapsedSeconds = elapsed

    // Check if countdown/pomodoro completed
    if ((this.state.mode === 'countdown' || this.state.mode === 'pomodoro') && this.state.targetSeconds > 0) {
      if (elapsed >= this.state.targetSeconds) {
        this.state.elapsedSeconds = this.state.targetSeconds
        this.state.status = 'completed'
        this.stopInterval()
        this.state.timeline.push({ action: 'stop', at: Date.now() })
      }
    }

    this.notify()
  }

  private startInterval() {
    this.stopInterval()
    // Update every 250ms for smooth UI, but calculate based on timestamp
    this.intervalId = window.setInterval(() => {
      this.updateElapsed()
    }, 250)
  }

  private stopInterval() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  start(mode: TimerMode = 'free', targetSeconds: number = 0, subjectId?: string, taskId?: string) {
    const now = Date.now()
    this.state = {
      mode,
      status: 'running',
      targetSeconds,
      elapsedSeconds: 0,
      pausedSeconds: 0,
      startTimestamp: now,
      pauseTimestamp: null,
      timeline: [{ action: 'start', at: now }],
      subjectId,
      taskId
    }
    this.startInterval()
    this.notify()
  }

  pause() {
    if (this.state.status !== 'running') return
    const now = Date.now()
    // Calculate elapsed up to now
    this.state.elapsedSeconds = this.calculateElapsed()
    this.state.status = 'paused'
    this.state.pauseTimestamp = now
    this.state.timeline.push({ action: 'pause', at: now })
    this.stopInterval()
    this.notify()
  }

  resume() {
    if (this.state.status !== 'paused') return
    const now = Date.now()
    if (this.state.pauseTimestamp) {
      const pausedDuration = Math.floor((now - this.state.pauseTimestamp) / 1000)
      this.state.pausedSeconds += pausedDuration
    }
    this.state.status = 'running'
    this.state.pauseTimestamp = null
    this.state.timeline.push({ action: 'resume', at: now })
    this.startInterval()
    this.notify()
  }

  stop(): TimerState {
    const now = Date.now()
    if (this.state.status === 'running') {
      this.state.elapsedSeconds = this.calculateElapsed()
    }
    this.state.status = 'completed'
    this.state.timeline.push({ action: 'stop', at: now })
    this.stopInterval()
    this.notify()
    return this.getState()
  }

  reset() {
    this.stopInterval()
    this.state = {
      mode: this.state.mode,
      status: 'idle',
      targetSeconds: this.state.targetSeconds,
      elapsedSeconds: 0,
      pausedSeconds: 0,
      startTimestamp: null,
      pauseTimestamp: null,
      timeline: [],
      subjectId: this.state.subjectId,
      taskId: this.state.taskId
    }
    this.notify()
  }

  // For persistence across refresh
  restore(state: TimerState) {
    this.state = { ...state }
    // Recalculate pausedSeconds if currently paused
    if (state.status === 'paused' && state.pauseTimestamp) {
      // pausedSeconds already includes previous pauses, we keep it
      // elapsedSeconds is already calculated at pause time
    } else if (state.status === 'running' && state.startTimestamp) {
      // Recalculate elapsed based on now
      const now = Date.now()
      const totalSinceStart = Math.floor((now - state.startTimestamp) / 1000)
      const elapsed = totalSinceStart - state.pausedSeconds
      this.state.elapsedSeconds = Math.min(elapsed, state.targetSeconds || Infinity)
      
      // If already completed while away
      if ((state.mode === 'countdown' || state.mode === 'pomodoro') && state.targetSeconds > 0 && elapsed >= state.targetSeconds) {
        this.state.status = 'completed'
        this.state.elapsedSeconds = state.targetSeconds
      } else {
        this.startInterval()
      }
    }
    this.notify()
  }

  getRemainingSeconds(): number {
    if (this.state.mode === 'free') return 0
    return Math.max(0, this.state.targetSeconds - this.state.elapsedSeconds)
  }

  getProgress(): number {
    if (this.state.mode === 'free') return 0
    if (this.state.targetSeconds === 0) return 0
    return Math.min(100, (this.state.elapsedSeconds / this.state.targetSeconds) * 100)
  }

  destroy() {
    this.stopInterval()
    this.listeners.clear()
  }
}

// Singleton for app-wide usage
export const timerEngine = new TimerEngine()
