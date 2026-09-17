const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

export function toPersianDigits(input: string | number): string {
  const str = String(input)
  return str.replace(/[0-9]/g, (d) => persianDigits[parseInt(d)])
}

export function toEnglishDigits(input: string): string {
  let result = input
  // Persian digits
  result = result.replace(/[۰-۹]/g, (d) => String(persianDigits.indexOf(d)))
  // Arabic digits
  result = result.replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
  return result
}

export function formatNumber(num: number, usePersian: boolean = true): string {
  const formatted = new Intl.NumberFormat('en-US').format(num)
  return usePersian ? toPersianDigits(formatted) : formatted
}

export function formatPersianNumberWithSeparator(num: number, usePersian: boolean): string {
  if (!usePersian) return new Intl.NumberFormat('en-US').format(num)
  return toPersianDigits(new Intl.NumberFormat('en-US').format(num))
}

// For inputs: always store English, display Persian if needed
export function parsePersianNumber(input: string): number | null {
  const english = toEnglishDigits(input).replace(/[^0-9.-]/g, '')
  if (!english) return null
  const num = Number(english)
  return isNaN(num) ? null : num
}
