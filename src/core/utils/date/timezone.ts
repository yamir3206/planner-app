import { toPersianDigits } from '../persian/numbers'

export function getUserTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    return 'Asia/Tehran'
  }
}

export function formatTime(date: Date, usePersian: boolean = true): string {
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
  if (usePersian) {
    return toPersianDigits(timeStr)
  }
  return timeStr
}

export function formatDuration(seconds: number, usePersian: boolean = true, verbose: boolean = true): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60

  let result = ''
  if (verbose) {
    if (h > 0) result += `${h} ساعت `
    if (m > 0) result += `${m} دقیقه `
    if (h === 0 && m === 0) result += `${s} ثانیه`
    result = result.trim()
  } else {
    const hh = String(h).padStart(2, '0')
    const mm = String(m).padStart(2, '0')
    const ss = String(s).padStart(2, '0')
    if (h > 0) result = `${hh}:${mm}:${ss}`
    else result = `${mm}:${ss}`
  }

  if (usePersian) {
    return toPersianDigits(result)
  }
  return result
}

export function formatMinutes(minutes: number, usePersian: boolean = true): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  let result = ''
  if (h > 0 && m > 0) result = `${h} ساعت و ${m} دقیقه`
  else if (h > 0) result = `${h} ساعت`
  else result = `${m} دقیقه`

  if (usePersian) {
    return toPersianDigits(result)
  }
  return result
}
