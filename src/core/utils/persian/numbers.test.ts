import { describe, it, expect } from 'vitest'
import { toPersianDigits, toEnglishDigits, formatNumber } from './numbers'

describe('Persian numbers', () => {
  it('converts english to persian digits', () => {
    expect(toPersianDigits('123')).toBe('۱۲۳')
    expect(toPersianDigits(456)).toBe('۴۵۶')
    expect(toPersianDigits('0')).toBe('۰')
  })

  it('converts persian to english digits', () => {
    expect(toEnglishDigits('۱۲۳')).toBe('123')
    expect(toEnglishDigits('۰۱۲۳۴۵۶۷۸۹')).toBe('0123456789')
  })

  it('formats number with separator', () => {
    const result = formatNumber(1234, false)
    expect(result).toContain('1,234')
  })
})
