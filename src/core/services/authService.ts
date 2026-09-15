import { authRepository } from '../repositories/authRepository'
import { LocalUser, createLocalUser, AuthSession } from '../domain/models/Auth'
import { STORAGE_KEYS } from '@/lib/constants'

export class AuthError extends Error {
  constructor(message: string, public code: 'USER_EXISTS' | 'USER_NOT_FOUND' | 'INVALID_PASSWORD' | 'WEAK_PASSWORD' | 'CRYPTO_UNAVAILABLE') {
    super(message)
    this.name = 'AuthError'
  }
}

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16)
  }
  return bytes
}

async function hashPassword(password: string, salt: Uint8Array): Promise<string> {
  if (!crypto.subtle) {
    throw new AuthError('مرورگر شما از رمزنگاری امن پشتیبانی نمی‌کند. لطفاً از مرورگر جدیدتر استفاده کنید یا HTTPS فعال باشد.', 'CRYPTO_UNAVAILABLE')
  }

  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password) as any,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  )

  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt as any,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  )

  return bufferToHex(bits)
}

function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(16))
}

export class AuthService {
  async register(data: { username: string; password: string; displayName: string; email?: string; field?: LocalUser['field'] }): Promise<LocalUser> {
    const { username, password, displayName, email, field } = data

    if (!username || username.trim().length < 3) {
      throw new AuthError('نام کاربری باید حداقل ۳ کاراکتر باشد', 'WEAK_PASSWORD')
    }

    if (!password || password.length < 6) {
      throw new AuthError('رمز عبور باید حداقل ۶ کاراکتر باشد', 'WEAK_PASSWORD')
    }

    if (!displayName || displayName.trim().length < 2) {
      throw new AuthError('نام نمایشی الزامی است', 'WEAK_PASSWORD')
    }

    const existing = await authRepository.getByUsername(username)
    if (existing) {
      throw new AuthError('این نام کاربری قبلاً ثبت شده است', 'USER_EXISTS')
    }

    if (email) {
      const existingEmail = await authRepository.getByEmail(email)
      if (existingEmail) {
        throw new AuthError('این ایمیل قبلاً ثبت شده است', 'USER_EXISTS')
      }
    }

    const salt = generateSalt()
    const saltHex = bufferToHex(salt.buffer as ArrayBuffer)
    const hash = await hashPassword(password, salt)

    const user = createLocalUser({
      username: username.trim(),
      email: email?.trim(),
      passwordHash: hash,
      salt: saltHex,
      displayName: displayName.trim(),
      field: field || 'tajrobi'
    })

    return authRepository.create(user)
  }

  async login(username: string, password: string): Promise<AuthSession> {
    const user = await authRepository.getByUsername(username)
    if (!user) {
      throw new AuthError('کاربری با این نام یافت نشد', 'USER_NOT_FOUND')
    }

    const saltBuffer = hexToBuffer(user.salt)
    const hash = await hashPassword(password, saltBuffer)

    if (hash !== user.passwordHash) {
      throw new AuthError('رمز عبور اشتباه است', 'INVALID_PASSWORD')
    }

    const session: AuthSession = {
      userId: user.id,
      username: user.username,
      displayName: user.displayName,
      loggedInAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
    }

    // Save session to localStorage (secure enough for local app, no sensitive data)
    try {
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(session))
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, user.id) // simple token
    } catch (e) {
      console.warn('Failed to save auth session', e)
    }

    return session
  }

  async logout(): Promise<void> {
    try {
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER)
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
    } catch {}
  }

  getCurrentSession(): AuthSession | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.AUTH_USER)
      if (!raw) return null
      const session = JSON.parse(raw) as AuthSession
      // Check expiry
      if (session.expiresAt && new Date(session.expiresAt).getTime() < Date.now()) {
        this.logout()
        return null
      }
      return session
    } catch {
      return null
    }
  }

  async getCurrentUser(): Promise<LocalUser | null> {
    const session = this.getCurrentSession()
    if (!session) return null
    return authRepository.getById(session.userId)
  }

  isLoggedIn(): boolean {
    return !!this.getCurrentSession()
  }

  async changePassword(username: string, oldPassword: string, newPassword: string): Promise<void> {
    const user = await authRepository.getByUsername(username)
    if (!user) throw new AuthError('کاربر یافت نشد', 'USER_NOT_FOUND')

    const saltBuffer = hexToBuffer(user.salt)
    const oldHash = await hashPassword(oldPassword, saltBuffer)
    if (oldHash !== user.passwordHash) {
      throw new AuthError('رمز عبور فعلی اشتباه است', 'INVALID_PASSWORD')
    }

    if (newPassword.length < 6) {
      throw new AuthError('رمز جدید باید حداقل ۶ کاراکتر باشد', 'WEAK_PASSWORD')
    }

    const newSalt = generateSalt()
    const newSaltHex = bufferToHex(newSalt.buffer as ArrayBuffer)
    const newHash = await hashPassword(newPassword, newSalt)

    await authRepository.update(user.id, {
      passwordHash: newHash,
      salt: newSaltHex
    } as any)
  }

  async getAllUsers(): Promise<LocalUser[]> {
    return authRepository.getAll()
  }
}

export const authService = new AuthService()
