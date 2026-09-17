# معماری نرم‌افزار آکسون — Axon Study Planner

> نسخه: 1.0 — مرحله 1: Architecture
> تاریخ: 2026-09-11
> وضعیت: Final برای شروع پیاده‌سازی

---

## 1. تحلیل نیازمندی‌ها

### 1.1 پرسونا
- دانش‌آموز کنکوری (ریاضی، تجربی، انسانی) 16-20 ساله
- مشاور تحصیلی که برنامه را می‌بیند
- استفاده روزمره، 3-8 ساعت مطالعه، نیاز به تمرکز بالا، اضطراب زمانی

### 1.2 نیازهای عملکردی (Functional)
**هسته مطالعه:**
- برنامه‌ریزی روزانه/هفتگی (Planner) با تسک‌های دارای درس، مبحث، نوع فعالیت، زمان، اولویت، وضعیت
- تقویم Day/Week/Month با CRUD کامل
- تایمر مطالعه دقیق (Pomodoro / Free / Countdown) با قابلیت اتصال به درس و تسک
- ثبت خودکار StudySession با محاسبه timestamp واقعی (نه setInterval ساده)
- مدیریت دروس داینامیک (Subjects)
- اهداف (Goals) روزانه، هفتگی، ماهانه، درسی، تستی با Progress
- داشبورد (امروز، هدف، پیشرفت، تسک بعدی، streak، خلاصه هفته)
- امروز (Today) فوکوس روی تسک‌های امروز
- تحلیل (Analytics) با نمودارهای سبک: روزانه، هفتگی، ماهانه، توزیع دروس، میانگین، بهترین/ضعیف‌ترین روز
- Streak بر اساس تاریخ شمسی واقعی و timezone کاربر
- تنظیمات (Settings) شامل تم، اعداد فارسی، هدف روزانه، تنظیمات پومودورو

**سیستمی:**
- Import/Export JSON با schema validation (Zod)
- Persistence بعد از refresh
- Offline-first + PWA
- فارسی اول، RTL واقعی
- Dark Mode کامل
- Static Hosting سازگار (GitHub Pages, Vercel, Netlify, Cloudflare)

### 1.3 نیازهای غیرعملکردی
- **Correctness**: تایمر بدون drift، تاریخ شمسی دقیق، streak صحیح
- **Reliability**: عدم crash با داده خراب، مدیریت storage failure
- **UX**: Mobile-first، Touch 44px، انیمیشن‌های micro، لود <1.5s روی 3G
- **Maintainability**: جداسازی لایه‌ها، ماژول‌های کوچک (<300 خط)
- **Performance**: تایمر بدون re-render کل اپ، چارت‌ها virtualized، لیست تسک‌ها با memo
- **Security**: داده فقط local، عدم ارسال به سرور، XSS safe

---

## 2. دسته‌بندی قابلیت‌ها

### لایه 1 — Foundation (حیاتی)
- RTL + Persian typography + Vazirmatn
- Theme (light/dark) + Design System
- Storage abstraction + Repositories
- Routing + AppShell (Sidebar/BottomNav)

### لایه 2 — Core Study
- Subjects CRUD
- Tasks CRUD + Status machine
- Planner + Today
- Calendar (Day/Week/Month)
- Goals CRUD + Progress calculation

### لایه 3 — Timer & Analytics
- Timer Engine (timestamp-based)
- Session persistence across refresh/background
- Streak Engine (date-fns + jalaali)
- Analytics Engine + Charts (Recharts)

### لایه 4 — Production
- Settings + Import/Export + Validation
- PWA + Service Worker + update flow
- Error Boundary + Empty/Loading states
- Accessibility + Persian edge cases

---

## 3. انتخاب معماری

### 3.1 الگوی کلی: Clean Architecture + Repository Pattern

```
┌─────────────────────────────────────────┐
│  UI Layer (React Components)            │
│  - Pages, Components, Hooks             │
│  - فقط نمایش و dispatch به Services     │
├─────────────────────────────────────────┤
│  Application Layer (Services)           │
│  - TaskService, TimerService,           │
│  - AnalyticsService, StreakService      │
│  - Business Logic خالص، بدون React      │
├─────────────────────────────────────────┤
│  Domain Layer (Models & Enums)          │
│  - TypeScript interfaces                │
│  - Pure functions                       │
├─────────────────────────────────────────┤
│  Data Layer (Repositories)              │
│  - SubjectRepository, TaskRepository    │
│  - SessionRepository, GoalRepository    │
│  - UserProfileRepository, SettingsRepo  │
├─────────────────────────────────────────┤
│  Storage Layer (Adapters)               │
│  - IndexedDBAdapter (idb)               │
│  - LocalStorageAdapter (fallback)       │
│  - MemoryAdapter (test)                 │
└─────────────────────────────────────────┘
```

**قانون وابستگی:** UI → Services → Repositories → Storage. هیچ لایه‌ای نباید لایه بالاتر را بشناسد.

### 3.2 چرا این معماری؟
- **قابل تست**: Services و Repositories بدون React تست می‌شوند
- **قابل تعویض**: فردا می‌توان IndexedDB را با API جایگزین کرد بدون تغییر UI
- **Cross-Platform**: core خالص است، می‌توان آن را در Capacitor/Tauri/RN استفاده کرد
- **Offline-first**: Storage abstraction اجازه sync آینده را می‌دهد

---

## 4. Tech Stack نهایی

| بخش | انتخاب | دلیل |
|-----|--------|------|
| Build | **Vite 5** | سریع، ESM، PWA friendly، basePath برای GitHub Pages |
| Language | **TypeScript 5.5 strict** | Type safety، no any |
| UI Framework | **React 18** | اکوسیستم، Capacitor سازگار |
| Router | **React Router 6.23** | BrowserRouter + 404.html fallback برای GH Pages |
| State | **Zustand 4.5 + Immer** | سبک، performance، بدون boilerplate |
| Styling | **TailwindCSS 3.4** | Mobile-first، RTL با logical properties، Design tokens |
| Font | **Vazirmatn Variable** via @fontsource | مدرن، خوانا، OFL، وزن متغیر، fallback مناسب |
| Icons | **Lucide React** | سبک، یکدست، MIT |
| Date | **date-fns 3 + jalaali-js + Intl** | سبک، tree-shakable، شمسی دقیق |
| Storage | **idb 8** + custom adapter | Promise-based IndexedDB، fallback به localStorage |
| Validation | **Zod 3.23** | Schema validation برای Import |
| Charts | **Recharts 2.12** | سبک، React native، RTL قابل تنظیم |
| PWA | **vite-plugin-pwa 0.19** | Workbox، update prompt، offline |
| Test | **Vitest + Testing Library + jsdom** | سریع، Vite native |
| Lint | **ESLint + Prettier + eslint-plugin-jsx-a11y** | کیفیت و accessibility |
| Deploy | **GitHub Pages + 404.html copy** | Static, no server |

**رد شده‌ها:**
- Next.js: نیاز به SSR، پیچیدگی basePath، برای static-first زیادی است
- Redux Toolkit: over-engineering برای این مقیاس
- Dexie: خوب است اما idb سبک‌تر و کنترل بیشتر
- Chart.js: Canvas-based، RTL سخت‌تر از Recharts
- Moment.js / moment-jalaali: سنگین و deprecated

---

## 5. ساختار پروژه

```
planner-app/
├── public/
│   ├── favicon.svg
│   ├── manifest.webmanifest (PWA)
│   └── icons/
├── docs/
│   └── architecture.md (همین فایل)
├── src/
│   ├── app/
│   │   ├── App.tsx              # Root + Providers
│   │   ├── router.tsx           # Routes definition
│   │   └── providers.tsx        # Theme, Storage, etc
│   ├── assets/
│   │   └── (images if needed)
│   ├── components/
│   │   ├── ui/                  # Design System
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Progress.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── ...
│   │   ├── layout/
│   │   │   ├── AppShell.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── BottomNav.tsx
│   │   │   ├── Header.tsx
│   │   │   └── PageContainer.tsx
│   │   └── common/
│   │       ├── PersianNumber.tsx
│   │       ├── JalaliDate.tsx
│   │       └── ErrorBoundary.tsx
│   ├── features/
│   │   ├── dashboard/
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── components/
│   │   │   └── hooks/
│   │   ├── today/
│   │   ├── planner/
│   │   ├── calendar/
│   │   ├── timer/
│   │   │   ├── TimerPage.tsx
│   │   │   ├── engine/          # Timer core logic (pure)
│   │   │   │   ├── timerEngine.ts
│   │   │   │   └── timerEngine.test.ts
│   │   │   └── hooks/useTimer.ts
│   │   ├── sessions/
│   │   ├── subjects/
│   │   ├── goals/
│   │   ├── analytics/
│   │   └── settings/
│   ├── core/
│   │   ├── domain/
│   │   │   ├── models/
│   │   │   │   ├── Task.ts
│   │   │   │   ├── Session.ts
│   │   │   │   ├── Subject.ts
│   │   │   │   ├── Goal.ts
│   │   │   │   ├── UserProfile.ts
│   │   │   │   └── Settings.ts
│   │   │   └── enums/
│   │   │       ├── TaskType.ts
│   │   │       ├── TaskStatus.ts
│   │   │       ├── Priority.ts
│   │   │       └── ...
│   │   ├── services/
│   │   │   ├── taskService.ts
│   │   │   ├── sessionService.ts
│   │   │   ├── subjectService.ts
│   │   │   ├── goalService.ts
│   │   │   ├── streakService.ts
│   │   │   ├── analyticsService.ts
│   │   │   └── importExportService.ts
│   │   ├── repositories/
│   │   │   ├── baseRepository.ts
│   │   │   ├── taskRepository.ts
│   │   │   ├── sessionRepository.ts
│   │   │   ├── subjectRepository.ts
│   │   │   ├── goalRepository.ts
│   │   │   ├── settingsRepository.ts
│   │   │   └── index.ts
│   │   ├── storage/
│   │   │   ├── IStorage.ts
│   │   │   ├── indexedDBAdapter.ts
│   │   │   ├── localStorageAdapter.ts
│   │   │   ├── memoryAdapter.ts
│   │   │   └── storageFactory.ts
│   │   └── utils/
│   │       ├── date/
│   │       │   ├── jalali.ts
│   │       │   ├── dateUtils.ts
│   │       │   └── timezone.ts
│   │       ├── persian/
│   │       │   ├── numbers.ts      # toPersianDigits, toEnglishDigits
│   │       │   ├── bidi.ts         # mixed text handling
│   │       │   └── validation.ts
│   │       ├── id.ts               # nanoid / crypto.randomUUID
│   │       └── format.ts
│   ├── hooks/
│   │   ├── useLocalStorage.ts (نباید مستقیم، فقط برای settings سبک)
│   │   ├── useMediaQuery.ts
│   │   └── usePersian.ts
│   ├── lib/
│   │   ├── cn.ts (clsx + tailwind-merge)
│   │   └── constants.ts
│   ├── styles/
│   │   ├── globals.css            # Tailwind + Vazirmatn + RTL base
│   │   └── themes.css             # CSS variables for light/dark
│   └── types/
│       └── global.d.ts
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

**قوانین فایل:**
- هر فایل < 300 خط
- هر کامپوننت فقط یک مسئولیت
- Services خالص (بدون React import)
- Repositories فقط CRUD، بدون logic پیچیده

---

## 6. مدل داده

### 6.1 اصول
- همه تاریخ‌ها به صورت **ISO 8601 UTC** ذخیره می‌شوند (e.g., `2026-09-11T10:30:00.000Z`)
- تاریخ شمسی فقط برای نمایش محاسبه می‌شود، هرگز ذخیره نمی‌شود
- ID با `crypto.randomUUID()` (با fallback به nanoid)
- `createdAt`, `updatedAt` الزامی
- `isDeleted` soft delete برای sync آینده (اختیاری در v1)

### 6.2 مدل‌ها (TypeScript)

```ts
// Base
interface BaseEntity {
  id: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

// User
interface UserProfile extends BaseEntity {
  name: string;
  field: 'riazi' | 'tajrobi' | 'ensani' | 'honar' | 'zaban' | 'other';
  grade: '10' | '11' | '12' | 'graduate';
  target: string; // e.g., "پزشکی تهران"
  dailyTargetMinutes: number; // default 360 (6h)
  avatar?: string;
}

// Subject
interface Subject extends BaseEntity {
  name: string; // "ریاضی"
  nameEn?: string; // "Math" for mixed display
  color: string; // hex, e.g., "#6366F1"
  icon: string; // lucide icon name
  order: number;
  isArchived: boolean;
}

// Task
type TaskType = 'study' | 'test' | 'review' | 'exam' | 'exam_analysis' | 'summary' | 'troubleshooting';
type TaskStatus = 'todo' | 'in_progress' | 'done' | 'partial' | 'cancelled';
type Priority = 'low' | 'medium' | 'high' | 'urgent';

interface StudyTask extends BaseEntity {
  subjectId: string;
  topic: string; // "فصل 2 - مثلثات"
  type: TaskType;
  date: string; // YYYY-MM-DD local (برای فیلتر روزانه)
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  plannedDuration: number; // minutes
  actualDuration?: number; // minutes (از sessions جمع می‌شود)
  pages?: { from?: number; to?: number };
  questions?: { target: number; done?: number };
  priority: Priority;
  status: TaskStatus;
  notes?: string;
}

// Session
type SessionType = 'pomodoro' | 'free' | 'countdown';
type SessionStatus = 'active' | 'paused' | 'completed' | 'cancelled';

interface StudySession extends BaseEntity {
  taskId?: string;
  subjectId: string;
  startTime: string; // ISO
  endTime?: string; // ISO
  duration: number; // seconds (actual)
  pausedDuration: number; // seconds
  type: SessionType;
  status: SessionStatus;
  notes?: string;
  // برای محاسبه دقیق:
  timeline: { action: 'start'|'pause'|'resume'|'stop'; at: string }[];
}

// Goal
type GoalType = 'daily' | 'weekly' | 'monthly' | 'subject' | 'test';
type GoalUnit = 'minutes' | 'hours' | 'questions' | 'pages' | 'sessions';

interface Goal extends BaseEntity {
  title: string;
  type: GoalType;
  targetValue: number;
  currentValue: number; // derived but cached for performance
  unit: GoalUnit;
  subjectId?: string;
  deadline?: string; // YYYY-MM-DD
  period?: { start: string; end: string }; // برای weekly/monthly
  isArchived: boolean;
}

// Settings
interface AppSettings extends BaseEntity {
  theme: 'light' | 'dark' | 'system';
  persianNumbers: boolean; // نمایش اعداد فارسی؟
  language: 'fa';
  dailyTargetMinutes: number;
  pomodoro: {
    work: number; // minutes default 25
    shortBreak: number; // 5
    longBreak: number; // 15
    longBreakInterval: number; // 4
  };
  notifications: boolean;
  // برای آینده
  syncEnabled: boolean;
}

// Export Schema
interface ExportData {
  version: string; // "1.0.0"
  exportedAt: string; // ISO
  data: {
    profile?: UserProfile;
    subjects: Subject[];
    tasks: StudyTask[];
    sessions: StudySession[];
    goals: Goal[];
    settings: AppSettings;
  }
}
```

### 6.3 روابط
- Subject 1—* Task
- Subject 1—* Session
- Task 1—* Session (optional)
- Goal *—1 Subject (optional)

---

## 7. صفحات و Navigation

### 7.1 ساختار Navigation
**Mobile:** Bottom Navigation با 5 آیتم اصلی + منو
- خانه (Dashboard)
- امروز (Today)
- برنامه (Planner)
- تایمر (Timer) - FAB مرکزی برجسته
- تحلیل (Analytics)

منوی همبرگری برای: تقویم، دروس، اهداف، جلسات، تنظیمات

**Desktop:** Sidebar راست (چون RTL) با گروه‌بندی
- گروه اصلی: داشبورد، امروز، برنامه‌ریز
- گروه مطالعه: تایمر، جلسات، تقویم
- گروه مدیریت: دروس، اهداف
- گروه تحلیل: آمار
- پایین: تنظیمات

### 7.2 Route Map

```
/ → Dashboard
/today → Today (تسک‌های امروز + تایمر سریع)
/planner → Planner (لیست + فیلتر + ایجاد)
/calendar → Calendar (Day/Week/Month)
/timer → Timer (Pomodoro/Free/Countdown)
/sessions → Study Sessions history
/subjects → Subjects management
/goals → Goals
/analytics → Analytics
/settings → Settings (Profile, Theme, Import/Export)
```

### 7.3 SPA Routing برای GitHub Pages
- Vite `base: '/planner-app/'` یا `/` بسته به تنظیمات (قابل کانفیگ)
- در build، `index.html` به `404.html` کپی می‌شود تا refresh روی routeهای داخلی کار کند
- استفاده از `BrowserRouter` با basename داینامیک
- Fallback: اگر basename مشکل داشت، به HashRouter سوییچ (feature flag)

---

## 8. Design System

### 8.1 برند آکسون
- **نام**: آکسون (Axon) — اشاره به نورون، یادگیری، اتصال
- **شخصیت**: علمی، مدرن، آرامش‌بخش اما پرانرژی، دانش‌آموز محور

### 8.2 رنگ‌ها (CSS Variables)
```css
/* Light */
--bg: #F8FAFC (slate-50)
--surface: #FFFFFF
--surface-2: #F1F5F9
--text: #0F172A (slate-900)
--text-2: #475569
--border: #E2E8F0
--primary: #6366F1 (indigo-500) - تمرکز و هوش
--primary-hover: #4F46E5
--accent: #06B6D4 (cyan-500) - انرژی
--success: #10B981
--warning: #F59E0B
--danger: #EF4444

/* Dark */
--bg: #020617 (slate-950)
--surface: #0F172A (slate-900)
--surface-2: #1E293B
--text: #F1F5F9
--text-2: #94A3B8
--border: #1E293B
--primary: #818CF8
--primary-hover: #6366F1
```

برای هر درس رنگ اختصاصی (10 رنگ پیش‌فرض از پالت Tailwind)

### 8.3 تایپوگرافی
- **فونت اصلی**: Vazirmatn Variable (100-900)
- **فونت fallback**: system-ui, -apple-system, Tahoma, sans-serif
- **فونت انگلیسی/کد**: Vazirmatn خودش لاتین را خوب دارد، برای اعداد از همان
- **سایزها**: 
  - xs: 12px, sm: 14px, base: 16px, lg: 18px, xl: 20px, 2xl: 24px, 3xl: 30px
- **وزن**: 400 برای متن، 500 برای متوسط، 700 برای عنوان
- **Line height**: 1.8 برای فارسی (خوانایی بیشتر از 1.5 انگلیسی)

### 8.4 کامپوننت‌های UI
- Button: primary, secondary, ghost, danger + sizes + loading
- Card: با border ملایم و shadow کم
- Input: با label فارسی، dir auto، focus ring
- Badge: برای status و priority
- Progress: دایره‌ای و خطی
- Modal: RTL، با backdrop و focus trap
- EmptyState: با آیکون و متن فارسی تشویقی

### 8.5 آیکون‌ها و Micro-interactions
- Lucide برای همه آیکون‌ها
- انیمیشن: 150-300ms ease-out، نه بیشتر
- Hover: scale 1.02 برای کارت‌ها
- Tap: scale 0.98 برای دکمه‌ها (mobile)

---

## 9. ریسک‌های فنی و راهکار

| ریسک | شدت | راهکار |
|------|-----|--------|
| **Timer drift** | بالا | محاسبه با `Date.now()` و `performance.now()`، ذخیره timeline، عدم استفاده از setInterval ساده. هر ثانیه `elapsed = now - start - paused` |
| **Background tab / Sleep** | بالا | در `visibilitychange` و `pagehide` زمان را ذخیره کن، در `focus` دوباره محاسبه کن. از Web Worker برای تایمر دقیق (اختیاری) |
| **Timezone / DST** | متوسط | ذخیره UTC، نمایش local. برای streak از `YYYY-MM-DD` local استفاده کن اما با `Intl.DateTimeFormat` و `timeZone` کاربر |
| **Date rollover در نیمه‌شب** | متوسط | هر دقیقه چک کن اگر تاریخ عوض شد، Today را refresh کن |
| **localStorage quota (5MB)** | متوسط | داده‌های اصلی در IndexedDB، فقط settings سبک در localStorage. هندل `QuotaExceededError` |
| **IndexedDB failure / blocked** | متوسط | Fallback به localStorage + Memory + پیام فارسی به کاربر |
| **Corrupted JSON import** | بالا | Zod validation + try/catch + عدم crash. نمایش لیست خطاها |
| **PWA stale cache** | بالا | vite-plugin-pwa با `registerType: prompt`، نمایش دکمه "نسخه جدید" + `skipWaiting` |
| **GitHub Pages base path** | متوسط | Vite base قابل کانفیگ، کپی index به 404.html، basename داینامیک |
| **RTL text bugs** | بالا | استفاده از logical properties (margin-inline)، `dir="auto"` برای inputها، تست mixed text |
| **Persian numbers** | کم | util `toPersianDigits` با toggle در settings، اما در inputها همیشه انگلیسی ذخیره شود |
| **Chart RTL** | متوسط | Recharts با `layout` و `tickFormatter` فارسی، تست labels |
| **Duplicate IDs** | کم | crypto.randomUUID + چک وجود در repository |
| **Large task lists lag** | متوسط | Virtualization (react-virtuoso) اگر >100 آیتم، memoization |

---

## 10. استراتژی Deployment

### 10.1 Web (مرحله اول)
- Build: `vite build`
- Output: `dist/`
- GitHub Pages: 
  - `base: '/planner-app/'` اگر repo name دارد
  - کپی `dist/index.html` به `dist/404.html`
  - Deploy via `gh-pages` یا GitHub Actions
- Vercel/Netlify: `base: '/'` و SPA redirect (`_redirects` یا `vercel.json`)
- Cloudflare Pages: مشابه

### 10.2 PWA
- `manifest.webmanifest` با نام فارسی "آکسون - برنامه‌ریز کنکور"
- Icons 192, 512
- `theme_color` = primary
- `display: standalone`, `dir: rtl`, `lang: fa`
- Service Worker: cache first برای assets، network first برای HTML

### 10.3 Cross-Platform آینده (بدون پیاده‌سازی در v1)
- **Android/iOS**: Capacitor
  - `npx cap init` + `cap add android/ios`
  - همان `dist` را load می‌کند
  - برای دسترسی native (نوتیفیکیشن) از Capacitor Plugins
- **Desktop**: Tauri
  - Rust backend سبک
  - همان `dist` + window native
- **نکته**: core باید خالص بماند تا بدون تغییر قابل استفاده باشد

---

## 11. استراتژی داده و Sync آینده

### v1 (فعلی): Local Only
- IndexedDB (idb) برای همه entities
- localStorage فقط برای settings سبک و flagها
- Export/Import JSON دستی

### v2 (آینده): Cloud Sync
- Repositories یک interface دارند، می‌توان `ApiRepository` پیاده کرد
- Strategy:
  ```ts
  interface ITaskRepository {
    getAll(): Promise<Task[]>
    // ...
  }
  class LocalTaskRepo implements ITaskRepository
  class RemoteTaskRepo implements ITaskRepository
  class SyncedTaskRepo implements ITaskRepository // local + remote + conflict resolution
  ```
- Conflict: Last Write Wins ساده در ابتدا، سپس CRDT اگر نیاز بود
- Backend پیشنهادی: Supabase / Firebase / Custom (NestJS)

---

## 12. برنامه پیاده‌سازی 6 مرحله‌ای

### مرحله 1 — Architecture (همین مرحله) ✅
- [x] تحلیل نیازمندی‌ها
- [x] Tech Stack
- [x] معماری و لایه‌ها
- [x] مدل داده
- [x] ساختار پروژه
- [x] Design System اولیه
- [x] ریسک‌ها
- [x] Deployment strategy
- خروجی: `docs/architecture.md`

### مرحله 2 — Foundation (بعدی)
- [ ] Vite + React + TS + Tailwind + ESLint setup
- [ ] Vazirmatn + RTL globals.css
- [ ] Design System: Button, Card, Input, Badge, Progress, Modal
- [ ] AppShell + Sidebar + BottomNav + Header
- [ ] Theme (light/dark/system) + PersianNumber toggle
- [ ] Storage abstraction (IStorage + IndexedDB + LocalStorage + Memory)
- [ ] BaseRepository + تمام Repositories
- [ ] Models + Enums + Zod schemas
- [ ] Router + Pages skeleton (empty states)
- [ ] PWA plugin setup
- Quality Gate: build, typecheck, RTL audit, theme audit

### مرحله 3 — Core Study System
- [ ] Subjects CRUD + رنگ و آیکون
- [ ] Tasks CRUD + فیلتر + Status machine
- [ ] Planner page + Today page
- [ ] Calendar Day/Week/Month
- [ ] Goals CRUD + Progress
- [ ] Dashboard با داده واقعی
- Quality Gate: CRUD e2e, persistence, mobile audit

### مرحله 4 — Timer + Analytics
- [ ] Timer Engine (timestamp-based, timeline)
- [ ] Timer Page (Pomodoro, Free, Countdown)
- [ ] Session persistence + background handling
- [ ] Sessions history page
- [ ] Streak Engine + محاسبه دقیق
- [ ] Analytics Engine + Charts (Recharts) با RTL
- Quality Gate: Timer audit (drift, background, refresh)

### مرحله 5 — Production Features
- [ ] Settings page (Profile, Theme, Pomodoro, Targets)
- [ ] Import/Export با Zod validation + Error handling
- [ ] Offline + PWA update flow
- [ ] ErrorBoundary + Loading + Empty states
- [ ] Accessibility (keyboard, ARIA, contrast)
- [ ] Persian edge cases (mixed text, numbers, inputs)
- Quality Gate: Import/Export audit, PWA audit, a11y audit

### مرحله 6 — QA + Deployment
- [ ] Unit Tests (Services, Utils, TimerEngine)
- [ ] Integration Tests (Repositories, Import/Export)
- [ ] Manual audits: Mobile, RTL, Persian, Dark, Performance, Storage
- [ ] Build + Typecheck + Lint
- [ ] GitHub Pages deploy + 404.html + base path
- [ ] Test on Vercel/Netlify/Cloudflare (docs)
- [ ] Final report

---

## 13. تصمیمات معماری کلیدی (ADRs)

### ADR-001: چرا Vite نه Next.js؟
- نیازمندی Static-First + No Backend + GitHub Pages. Vite ساده‌تر، bundle کوچک‌تر، کنترل PWA بهتر.

### ADR-002: چرا Zustand نه Redux?
- سادگی، performance، کمتر boilerplate، کافی برای این مقیاس. در صورت نیاز به sync پیچیده می‌توان به Redux مهاجرت کرد اما فعلا over-engineering است.

### ADR-003: چرا idb نه Dexie?
- idb سبک‌تر (1KB)، کنترل بیشتر، Promise wrapper ساده. Dexie امکانات بیشتری دارد اما برای v1 نیاز نیست.

### ADR-004: چرا Recharts نه Chart.js?
- Recharts React-native، SVG-based (بهتر برای RTL و accessibility)، API ساده‌تر.

### ADR-005: چرا Vazirmatn?
- مدرن، variable font، OFL، خوانایی عالی در سایز کوچک، پشتیبانی کامل فارسی و لاتین، وزن‌های متنوع.

### ADR-006: Timer با timestamp نه interval
- جلوگیری از drift، درست کار کردن در background/sleep، قابل persist.

---

## 14. چک‌لیست Persian First

- [ ] html lang="fa" dir="rtl"
- [ ] Vazirmatn با font-display: swap
- [ ] Tailwind logical properties (ms, me, ps, pe, start, end)
- [ ] Input dir="auto" برای mixed text
- [ ] اعداد: ذخیره انگلیسی، نمایش با toggle فارسی/انگلیسی
- [ ] تاریخ: ذخیره ISO UTC، نمایش شمسی با jalaali-js
- [ ] نمودارها: tickFormatter با اعداد فارسی
- [ ] مودال‌ها: RTL + focus trap + Esc
- [ ] جدول‌ها: text-align right، header راست
- [ ] پیام‌های خطا فارسی
- [ ] Empty states فارسی تشویقی

---

## 15. جمع‌بندی

این معماری:
- ✅ Persian First و RTL واقعی
- ✅ Offline-first و Static deployable
- ✅ Cross-platform ready (Capacitor/Tauri)
- ✅ Clean Architecture با جداسازی لایه‌ها
- ✅ Production-Quality با Type Safety و Error Handling
- ✅ قابل توسعه برای Backend Sync آینده
- ✅ Performance-aware (Timer بدون re-render کل اپ)

**آماده برای مرحله 2 — Foundation**

---

*تهیه شده توسط تیم آکسون — Axon Team*
