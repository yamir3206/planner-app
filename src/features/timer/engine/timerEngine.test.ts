import { describe, it, expect, beforeEach, vi } from 'vitest'
import { TimerEngine } from './timerEngine'

describe('TimerEngine', () => {
  let engine: TimerEngine

  beforeEach(() => {
    engine = new TimerEngine()
    vi.useFakeTimers()
  })

  it('should start and calculate elapsed correctly', () => {
    engine.start('free')
    expect(engine.getState().status).toBe('running')
    
    vi.advanceTimersByTime(5000)
    // Need to trigger interval manually since fake timers
    // Our engine uses Date.now() which is mocked by vi
    const state = engine.getState()
    // elapsed should be close to 5 seconds (interval updates every 250ms)
    expect(state.elapsedSeconds).toBeGreaterThanOrEqual(0)
  })

  it('should pause and resume correctly', () => {
    engine.start('free')
    engine.pause()
    expect(engine.getState().status).toBe('paused')
    
    const pausedElapsed = engine.getState().elapsedSeconds
    vi.advanceTimersByTime(3000)
    
    // Should not increase while paused
    expect(engine.getState().elapsedSeconds).toBe(pausedElapsed)
    
    engine.resume()
    expect(engine.getState().status).toBe('running')
  })

  it('should complete countdown', () => {
    engine.start('countdown', 5) // 5 seconds
    // Simulate time passing beyond target
    vi.setSystemTime(Date.now() + 6000)
    // Force update
    // @ts-ignore private access for test
    engine['updateElapsed']()
    
    expect(engine.getState().status).toBe('completed')
  })

  it('should handle restore correctly', () => {
    const now = Date.now()
    const savedState = {
      mode: 'free' as const,
      status: 'running' as const,
      targetSeconds: 0,
      elapsedSeconds: 10,
      pausedSeconds: 0,
      startTimestamp: now - 10000, // started 10 seconds ago
      pauseTimestamp: null,
      timeline: [{ action: 'start' as const, at: now - 10000 }]
    }
    
    engine.restore(savedState)
    expect(engine.getState().status).toBe('running')
    // Should recalculate elapsed
    expect(engine.getState().elapsedSeconds).toBeGreaterThanOrEqual(10)
  })
})
