import { describe, it, expect } from 'vitest'
import { gregorianToJalali, jalaliToGregorian, formatJalali, getTodayString, parseDateString } from './jalali'

describe('Jalali utils', () => {
  it('converts gregorian to jalali', () => {
    const date = new Date(2024, 2, 20) // March 20, 2024 = Farvardin 1, 1403
    const j = gregorianToJalali(date)
    expect(j.jy).toBe(1403)
    expect(j.jm).toBe(1)
    expect(j.jd).toBe(1)
  })

  it('converts jalali to gregorian', () => {
    const g = jalaliToGregorian(1403, 1, 1)
    expect(g.getFullYear()).toBe(2024)
    expect(g.getMonth()).toBe(2) // 0-indexed
    expect(g.getDate()).toBe(20)
  })

  it('formats jalali', () => {
    const date = new Date(2024, 2, 20)
    const formatted = formatJalali(date)
    expect(formatted).toContain('فروردین')
    expect(formatted).toContain('1403')
  })

  it('gets today string in YYYY-MM-DD', () => {
    const today = getTodayString()
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('parses date string', () => {
    const date = parseDateString('2024-03-20')
    expect(date.getFullYear()).toBe(2024)
    expect(date.getMonth()).toBe(2)
    expect(date.getDate()).toBe(20)
  })
})
