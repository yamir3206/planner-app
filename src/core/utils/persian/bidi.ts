/**
 * Utilities for handling mixed Persian/English text (BiDi)
 * Ensures Persian text doesn't break and English terms inside Persian are displayed correctly
 */

export function isPersianText(text: string): boolean {
  // Check if text contains Persian characters
  return /[\u0600-\u06FF]/.test(text)
}

export function isEnglishText(text: string): boolean {
  return /^[A-Za-z0-9\s.,!?;:'\"()\-_]+$/.test(text)
}

// Wrap English terms in Persian text with LRM/RLM markers for correct display
export function wrapMixedText(text: string): string {
  // This is handled mostly by CSS unicode-bidi: plaintext
  // But we can add explicit markers if needed
  return text
}

// For inputs, we use dir="auto" so browser handles it
export function getTextDirection(text: string): 'rtl' | 'ltr' | 'auto' {
  if (!text) return 'auto'
  // If first strong character is Persian/Arabic, rtl
  const rtlRegex = /[\u0600-\u06FF]/
  const ltrRegex = /[A-Za-z]/
  
  for (const char of text) {
    if (rtlRegex.test(char)) return 'rtl'
    if (ltrRegex.test(char)) return 'ltr'
  }
  return 'auto'
}

// Clean text for search (normalize)
export function normalizePersianText(text: string): string {
  return text
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/\u200C/g, '') // ZWNJ
    .trim()
}
