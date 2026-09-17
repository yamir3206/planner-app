// تنظیمات دیتابیس - قابل تنظیم برای هر محیط
// این فایل به شما اجازه می‌دهد برنامه را با هر دیتابیسی اجرا کنید

export type DatabaseType = 'indexeddb' | 'localstorage' | 'supabase' | 'firebase' | 'rest' | 'memory' | 'auto'

export interface DatabaseConfig {
  type: DatabaseType
  // برای Supabase / Firebase / REST
  url?: string
  apiKey?: string
  // تنظیمات اضافی
  options?: {
    tablePrefix?: string
    enableSync?: boolean
    syncInterval?: number // ثانیه
    enableOffline?: boolean
  }
}

// خواندن تنظیمات از environment یا localStorage
function getDatabaseConfig(): DatabaseConfig {
  // 1. از localStorage (تنظیم کاربر)
  try {
    const stored = localStorage.getItem('axon_database_config')
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {}

  // 2. از متغیرهای محیطی (Vite)
  const envType = (import.meta.env.VITE_DATABASE_TYPE as DatabaseType) || 'auto'
  const envUrl = import.meta.env.VITE_DATABASE_URL as string
  const envKey = import.meta.env.VITE_DATABASE_API_KEY as string

  if (envType && envType !== 'auto') {
    return {
      type: envType,
      url: envUrl,
      apiKey: envKey,
      options: {
        tablePrefix: 'axon_',
        enableSync: true,
        enableOffline: true,
      }
    }
  }

  // 3. پیش‌فرض: auto (IndexedDB با fallback)
  return {
    type: 'auto',
    options: {
      tablePrefix: 'axon_',
      enableSync: false,
      enableOffline: true,
    }
  }
}

export function saveDatabaseConfig(config: DatabaseConfig) {
  try {
    localStorage.setItem('axon_database_config', JSON.stringify(config))
    // ریلود برای اعمال
    window.location.reload()
  } catch (e) {
    console.error('Failed to save database config', e)
  }
}

export function getCurrentDatabaseConfig(): DatabaseConfig {
  return getDatabaseConfig()
}

// بررسی اینکه آیا دیتابیس remote است
export function isRemoteDatabase(): boolean {
  const config = getDatabaseConfig()
  return ['supabase', 'firebase', 'rest'].includes(config.type)
}

// نام نمایشی دیتابیس
export function getDatabaseDisplayName(type: DatabaseType): string {
  const names: Record<DatabaseType, string> = {
    indexeddb: 'مرورگر (آفلاین)',
    localstorage: 'مرورگر ساده',
    supabase: 'Supabase (ابری)',
    firebase: 'Firebase (ابری)',
    rest: 'سرور شخصی',
    memory: 'حافظه موقت',
    auto: 'خودکار (هوشمند)'
  }
  return names[type] || type
}

// توضیحات دیتابیس
export function getDatabaseDescription(type: DatabaseType): string {
  const descriptions: Record<DatabaseType, string> = {
    indexeddb: 'سریع، آفلاین، داده روی دستگاه شما',
    localstorage: 'ساده، برای مرورگرهای قدیمی',
    supabase: 'ابری، همگام در همه دستگاه‌ها، نیاز به اینترنت',
    firebase: 'گوگل، سریع و قابل اعتماد',
    rest: 'اتصال به سرور شخصی شما',
    memory: 'موقت، با بستن صفحه پاک می‌شود',
    auto: 'بهترین گزینه را خودکار انتخاب می‌کند'
  }
  return descriptions[type] || ''
}
