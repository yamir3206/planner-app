import * as jalaali from 'jalaali-js'

export interface JalaliDate {
  jy: number
  jm: number
  jd: number
}

export const JALALI_MONTHS = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند'
]

export const JALALI_MONTHS_SHORT = [
  'فرو',
  'ارد',
  'خرد',
  'تیر',
  'مرد',
  'شهر',
  'مهر',
  'آبا',
  'آذر',
  'دی',
  'بهم',
  'اسف'
]

// هفته از شنبه شروع می‌شود و جمعه پایان می‌یابد (تقویم ایرانی)
export const WEEKDAYS = [
  'شنبه',
  'یکشنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنج‌شنبه',
  'جمعه'
]

export const WEEKDAYS_SHORT = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']

// برای سازگاری با JS getDay (0=یکشنبه، 6=شنبه) - تبدیل به شنبه اول
export function getWeekdayIndex(date: Date): number {
  // JS: 0=یکشنبه، 1=دوشنبه، ..., 6=شنبه
  // ایرانی: 0=شنبه، 1=یکشنبه، ..., 6=جمعه
  const jsDay = date.getDay()
  return jsDay === 6 ? 0 : jsDay + 1
}

export function gregorianToJalali(date: Date): JalaliDate {
  const { jy, jm, jd } = jalaali.toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate())
  return { jy, jm, jd }
}

export function jalaliToGregorian(jy: number, jm: number, jd: number): Date {
  const { gy, gm, gd } = jalaali.toGregorian(jy, jm, jd)
  return new Date(gy, gm - 1, gd)
}

export function formatJalali(date: Date, options: { includeWeekday?: boolean; shortMonth?: boolean } = {}): string {
  const j = gregorianToJalali(date)
  const monthName = options.shortMonth ? JALALI_MONTHS_SHORT[j.jm - 1] : JALALI_MONTHS[j.jm - 1]
  let result = `${j.jd} ${monthName} ${j.jy}`
  
  if (options.includeWeekday) {
    const weekdayIndex = getWeekdayIndex(date)
    const weekday = WEEKDAYS[weekdayIndex]
    result = `${weekday}، ${result}`
  }
  
  return result
}

export function formatJalaliShort(date: Date): string {
  const j = gregorianToJalali(date)
  return `${j.jy}/${String(j.jm).padStart(2, '0')}/${String(j.jd).padStart(2, '0')}`
}

export function formatJalaliRelative(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'امروز'
  if (diffDays === 1) return 'دیروز'
  if (diffDays === -1) return 'فردا'
  if (diffDays > 1 && diffDays < 7) return `${diffDays} روز پیش`
  if (diffDays < -1 && diffDays > -7) return `${Math.abs(diffDays)} روز بعد`
  
  return formatJalali(date)
}

export function getTodayJalali(): JalaliDate {
  return gregorianToJalali(new Date())
}

export function getTodayString(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export function parseDateString(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function isToday(dateStr: string): boolean {
  return dateStr === getTodayString()
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function endOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

export function getLocalDateString(date: Date): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
  })
  return formatter.format(date)
}

export function getDaysBetween(a: string, b: string): number {
  const dateA = parseDateString(a)
  const dateB = parseDateString(b)
  const diff = Math.abs(dateB.getTime() - dateA.getTime())
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

// شروع هفته از شنبه
export function getWeekStart(date: Date): Date {
  const weekdayIndex = getWeekdayIndex(date)
  return addDays(date, -weekdayIndex)
}

export function getWeekEnd(date: Date): Date {
  const start = getWeekStart(date)
  return addDays(start, 6)
}
