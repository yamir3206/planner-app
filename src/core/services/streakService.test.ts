import { describe, it, expect } from 'vitest'
import { getLocalDateString, addDays } from '../utils/date/jalali'

describe('Streak date utils', () => {
  it('gets local date string', () => {
    const date = new Date(2024, 2, 20, 12, 0, 0)
    const str = getLocalDateString(date)
    expect(str).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('adds days correctly', () => {
    const date = new Date(2024, 2, 20)
    const next = addDays(date, 1)
    expect(next.getDate()).toBe(21)
  })
})
