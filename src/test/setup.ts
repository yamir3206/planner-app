import '@testing-library/jest-dom'

// Mock crypto.randomUUID for tests
if (!globalThis.crypto) {
  // @ts-ignore
  globalThis.crypto = {}
}
if (!globalThis.crypto.randomUUID) {
  // @ts-ignore
  globalThis.crypto.randomUUID = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`
}
