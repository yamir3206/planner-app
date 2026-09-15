# گزارش نهایی — آکسون Axon Planner v1.0.0

تاریخ: 2026-09-11
وضعیت: Production Ready (Web/PWA)

---

## 1. معماری و Tech Stack

### معماری
- **Clean Architecture**: UI → Services → Repositories → Storage
- **Repository Pattern** با abstraction برای تعویض آینده به API
- **Storage Abstraction**: IndexedDB (idb) + LocalStorage fallback + Memory
- **Domain Pure**: مدل‌ها و سرویس‌ها بدون وابستگی به React

### Tech Stack نهایی
- Vite 5 + React 18 + TypeScript 5.5 (strict)
- React Router 6.23 (BrowserRouter + 404.html fallback)
- Zustand 4.5 + Immer
- TailwindCSS 3.4 + Vazirmatn (@fontsource)
- idb 8, jalaali-js, date-fns, Zod, Recharts, Lucide
- vite-plugin-pwa 0.19 (Workbox)
- Vitest + Testing Library

### چرا این انتخاب‌ها؟
- Vite برای static-first و PWA
- Zustand برای سادگی و performance
- idb برای کنترل بیشتر نسبت به Dexie
- Recharts برای RTL و SVG

---

## 2. قابلیت‌های پیاده‌سازی شده

### ✅ Foundation (مرحله 2)
- [x] Vite + TS + Tailwind + RTL
- [x] Vazirmatn با font-display swap
- [x] Design System: Button, Card, Input, Badge, Progress, Modal, EmptyState
- [x] AppShell: Sidebar (desktop, RTL راست) + BottomNav (mobile)
- [x] Theme light/dark/system با CSS variables
- [x] PersianNumber toggle
- [x] Storage abstraction (IndexedDBAdapter, LocalStorageAdapter, MemoryAdapter)
- [x] BaseRepository + 6 Repositories
- [x] Models + Enums + Zod schemas
- [x] Router + 10 Pages skeleton
- [x] PWA plugin + manifest فارسی

### ✅ Core Study System (مرحله 3)
- [x] **Subjects**: CRUD کامل، رنگ، آیکون، order، seed defaults (8 درس پیش‌فرض)
- [x] **Tasks**: CRUD، فیلتر بر اساس تاریخ، status machine (todo → in_progress → done), priority, type
- [x] **Planner**: نمایش روزانه با date selector 7 روزه، مرتب‌سازی بر اساس startTime
- [x] **Today**: تسک‌های امروز، پیشرفت، مطالعه امروز، تسک بعدی، دکمه شروع سریع
- [x] **Calendar**: Day/Week/Month، نمایش تسک‌ها روی تقویم، navigation، تشخیص امروز
- [x] **Goals**: CRUD، progress calculation، badge برای type/unit/subject
- [x] **Dashboard**: داده واقعی (امروز، هدف، پیشرفت، streak، خلاصه هفته، تسک بعدی، توزیع دروس)

### ✅ Timer + Analytics (مرحله 4)
- [x] **Timer Engine**: timestamp-based (نه setInterval ساده)، محاسبه با Date.now()، timeline events
  - Pomodoro (25/5/15 قابل تنظیم)
  - Free Timer
  - Countdown (15/25/45/60/90 دقیقه)
  - Pause/Resume/Reset/Stop
  - اتصال به Subject و Task
  - ذخیره خودکار StudySession بعد از >60 ثانیه
  - Persistence با localStorage برای survive refresh
  - Background handling: visibilitychange + focus → recalculate
  - No drift: elapsed = now - start - paused
- [x] **Sessions**: تاریخچه گروه‌بندی شده بر اساس روز، حذف، نمایش duration/paused/type
- [x] **Streak**: محاسبه بر اساس تاریخ local واقعی (Intl.DateTimeFormat)، current/longest/lastDate
- [x] **Analytics**: 
  - Daily stats (7 روز)
  - Weekly summary با bar chart
  - Subject distribution با pie chart (Recharts)
  - Best day, Average time
  - RTL tickFormatter با اعداد فارسی

### ✅ Production Features (مرحله 5)
- [x] **Settings**: Profile (name, field, grade, target), theme, persianNumbers, pomodoro settings
- [x] **Import/Export**: JSON با Zod validation، نمایش خطاها، ترکیب داده‌ها (نه overwrite خطرناک)
- [x] **Offline**: PWA با Workbox، precache 20 فایل، offline ready prompt
- [x] **PWA Update**: prompt برای نسخه جدید با skipWaiting
- [x] **Error Handling**: ErrorBoundary، try/catch در repositories، پیام فارسی
- [x] **Loading/Empty**: Skeleton pulse، EmptyState با آیکون و متن تشویقی فارسی
- [x] **Accessibility**: semantic HTML, keyboard nav (Esc برای modal), focus ring, ARIA, touch targets 44px
- [x] **Persian Edge Cases**: dir=rtl, dir=auto برای inputها, unicode-bidi plaintext, Vazirmatn, line-height 1.8

---

## 3. نتایج تست

### Unit Tests (Vitest)
```
✓ timerEngine.test.ts (4 tests)
✓ jalali.test.ts (5 tests)
✓ numbers.test.ts (3 tests)
✓ streakService.test.ts (2 tests)

Test Files  4 passed
Tests  14 passed
```

### Typecheck
```
✓ tsc --noEmit → 0 errors
```

### Build
```
✓ vite build → success
dist/assets/index-*.js 796KB (gzip 226KB) - قابل بهبود با code splitting در v2
dist/index.html + 404.html + sw.js + workbox
PWA precache 20 entries (954KB)
```

### Manual Audits
- [x] **Mobile**: BottomNav، safe-area، touch 44px، responsive grid، viewport-fit
- [x] **RTL**: html dir=rtl، logical properties، Sidebar راست، Modal RTL، chart LTR wrapper
- [x] **Persian**: Vazirmatn، mixed text با dir auto، اعداد فارسی toggle، تاریخ شمسی
- [x] **Dark Mode**: تمام components بررسی شد (bg, card, text, border, input, chart)
- [x] **Performance**: Timer بدون re-render کل اپ (250ms interval + Zustand)، memoization
- [x] **Storage**: IndexedDB primary، fallback به localStorage و memory، QuotaExceeded handling
- [x] **Import/Export**: Zod validation، corrupted JSON handling، error messages فارسی
- [x] **Timer**: drift test (timestamp)، background test (visibilitychange)، refresh persistence (localStorage)

---

## 4. محدودیت‌های شناخته شده (عمداً برای v2)

### Performance
- Bundle 796KB (بدون code splitting) → در v2 با dynamic import() برای هر صفحه
- Chart library (Recharts) سنگین → در v2 می‌توان به custom SVG سبک مهاجرت کرد
- Virtualization برای لیست >100 تسک هنوز اضافه نشده (react-virtuoso)

### Features
- **Notifications**: ساختار دارد (settings.notifications) اما پیاده‌سازی Web Notification API نشده
- **Search**: UI دارد (Header search icon) اما منطق جستجو پیاده نشده
- **Drag & Drop**: برای Planner و Calendar (reorder) در v2
- **Recurring Tasks**: هنوز پشتیبانی نمی‌شود
- **Subtasks/Checklist**: در مدل نیست، v2
- **Cloud Sync**: فقط local، sync آینده با Supabase/Firebase
- **Capacitor/Tauri Wrapper**: معماری آماده است اما wrapping نشده

### PWA
- Icons از قبل 1x1 بودند، با generate_image به‌روز شد اما می‌توان بهتر کرد
- Push notifications هنوز نیست

---

## 5. استراتژی Deployment

### Web (فعلی)
```bash
# Build
npm run build # tsc -b + vite build + copy index.html to 404.html

# Output: dist/
# - index.html (SPA entry)
# - 404.html (GitHub Pages fallback)
# - assets/ (js, css, fonts)
# - sw.js + workbox-*.js (PWA)
# - manifest.webmanifest
# - icons/
```

### GitHub Pages
- Base path: `/planner-app/` (via BASE_PATH env)
- Deploy: 
  - Option 1: `gh-pages` branch (copy dist)
  - Option 2: GitHub Actions (actions/deploy-pages)
- SPA routing: 404.html copy trick (already in build)
- PWA: کار می‌کند، scope = base

### Vercel / Netlify / Cloudflare
- Base: `/`
- Build command: `npm run build`
- Output: `dist`
- SPA redirect: 
  - Vercel: `vercel.json` with rewrites to index.html (auto)
  - Netlify: `_redirects` file `/* /index.html 200`
  - Cloudflare: `_routes.json` or SPA mode

### PWA
- manifest: فارسی، dir rtl, lang fa, theme_color #6366F1
- Icons: 192, 512 maskable
- Service Worker: generateSW, precache 20 files, runtime cache for fonts
- Update flow: prompt (PWAUpdatePrompt component) + skipWaiting

### Cross-Platform آینده
- **Android/iOS**: Capacitor 6
  ```bash
  npm install @capacitor/core @capacitor/cli
  npx cap init Axon ir.axon.planner
  npx cap add android
  npx cap add ios
  npm run build
  npx cap copy
  ```
  Core خالص است، نیاز به تغییر ندارد. فقط native plugins برای notification.

- **Desktop**: Tauri 2
  ```bash
  npm install -D @tauri/cli
  npx tauri init
  npx tauri build
  ```
  dist را load می‌کند، Rust backend سبک.

---

## 6. استراتژی داده و Sync آینده

### v1: Local Only
- IndexedDB (idb) برای subjects, tasks, sessions, goals, settings, profile
- LocalStorage فقط برای active_timer و theme
- Export/Import JSON دستی

### v2: Cloud Sync
```ts
interface ITaskRepository {
  getAll(): Promise<Task[]>
}

class LocalTaskRepo implements ITaskRepository
class RemoteTaskRepo implements ITaskRepository // Supabase
class SyncedTaskRepo implements ITaskRepository {
  // local + remote + conflict resolution (Last Write Wins ساده)
}
```

- Backend پیشنهادی: Supabase (Postgres + Auth + Realtime)
- Conflict: LWW در ابتدا، سپس CRDT اگر نیاز بود
- Encryption: at-rest با Web Crypto API (اختیاری)

---

## 7. چک‌لیست نهایی Bug Prevention

| مورد | وضعیت | توضیح |
|------|--------|-------|
| Timer drift | ✅ | timestamp-based, Date.now() |
| Timezone | ✅ | UTC ذخیره، local نمایش، Intl.DateTimeFormat |
| Date rollover | ✅ | useDateRollover hook + visibilitychange هر دقیقه |
| Refresh persistence | ✅ | IndexedDB + localStorage برای active timer |
| Browser background | ✅ | visibilitychange + focus recalculate |
| Mobile viewport | ✅ | viewport-fit, safe-bottom, responsive |
| RTL text | ✅ | dir=rtl, logical props, dir=auto |
| Persian/English mixed | ✅ | unicode-bidi plaintext, dir auto |
| Persian numbers | ✅ | toPersianDigits + toggle |
| Unicode | ✅ | normalizePersianText |
| localStorage failure | ✅ | try/catch + fallback memory |
| IndexedDB failure | ✅ | try/catch + fallback localStorage |
| corrupted import | ✅ | Zod validation + error messages |
| duplicate IDs | ✅ | crypto.randomUUID |
| stale PWA | ✅ | registerType prompt + update prompt |
| GH Pages base path | ✅ | BASE_PATH env + 404.html |
| SPA routing | ✅ | BrowserRouter + 404.html copy |
| responsive overflow | ✅ | overflow-x hidden, grid responsive |
| chart RTL | ✅ | Recharts LTR wrapper + Vazirmatn tick |
| dark mode contrast | ✅ | CSS variables, tested all components |

---

## 8. دستورات

```bash
# نصب
npm install

# توسعه
npm run dev # http://localhost:5173

# تست
npm run test
npm run test:watch

# نوع‌سنجی
npm run typecheck # یا ./node_modules/.bin/tsc --noEmit

# بیلد
npm run build # خروجی dist/ + 404.html

# پیش‌نمایش بیلد
npm run preview # http://localhost:4173

# دیپلوی GitHub Pages
# 1. تنظیم BASE_PATH
BASE_PATH=/planner-app/ npm run build
# 2. پوشه dist را به gh-pages push کن
```

---

## 9. ساختار نهایی پروژه

```
planner-app/
├── public/
│   ├── favicon.svg
│   └── icons/icon-192.png, icon-512.png
├── docs/
│   ├── architecture.md
│   └── final-audit.md (همین فایل)
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── router.tsx
│   │   └── providers.tsx (Theme + Settings)
│   ├── components/
│   │   ├── ui/ (Button, Card, Input, Badge, Progress, Modal, EmptyState)
│   │   ├── layout/ (AppShell, Sidebar, BottomNav, Header)
│   │   └── common/ (PersianNumber, ErrorBoundary, PWAUpdatePrompt)
│   ├── features/
│   │   ├── dashboard/ (واقعی با داده)
│   │   ├── today/
│   │   ├── planner/ (CRUD کامل)
│   │   ├── calendar/ (Day/Week/Month)
│   │   ├── timer/ (engine + hook + page)
│   │   ├── sessions/
│   │   ├── subjects/ (CRUD)
│   │   ├── goals/ (CRUD)
│   │   ├── analytics/ (charts)
│   │   └── settings/ (profile, theme, import/export)
│   ├── core/
│   │   ├── domain/models (Base, Subject, Task, Session, Goal, UserProfile, Settings)
│   │   ├── domain/enums
│   │   ├── services (7 services)
│   │   ├── repositories (6 repos + base)
│   │   ├── storage (IStorage + 3 adapters + factory)
│   │   └── utils/date, utils/persian
│   ├── hooks/ (useSubjects, useTasks, useSessions, useGoals, useStreak, useDateRollover)
│   ├── lib/ (cn, constants)
│   ├── styles/globals.css
│   ├── types/global.d.ts
│   ├── test/setup.ts
│   └── main.tsx
├── index.html
├── vite.config.ts
├── tailwind.config.js
└── package.json
```

---

## 10. نتیجه‌گیری

**چه چیزهایی کاملاً آماده هستند:**
- ✅ معماری Production-Quality با separation of concerns
- ✅ تمام صفحات اصلی با CRUD واقعی (نه placeholder)
- ✅ تایمر دقیق با timestamp و persistence
- ✅ فارسی اول، RTL واقعی، Vazirmatn، تاریخ شمسی
- ✅ PWA آفلاین با update flow
- ✅ Import/Export با validation
- ✅ Dark Mode کامل
- ✅ Responsive و Mobile-first
- ✅ Static deployable روی GH Pages/Vercel/Netlify/Cloudflare
- ✅ تست‌ها، typecheck، build موفق

**چه چیزهایی عمداً برای آینده باقی مانده:**
- ⏳ Code splitting برای کاهش bundle
- ⏳ Cloud sync (Supabase)
- ⏳ Push notifications
- ⏳ Search و Drag&Drop
- ⏳ Capacitor/Tauri wrapping (معماری آماده است)
- ⏳ Virtualization برای لیست‌های بزرگ

**قضاوت نهایی:** محصول حاضر یک **MVP واقعی Production-Quality** است که می‌تواند توسط مؤسسه آکسون برای دانش‌آموزان استفاده شود. معماری قابل توسعه، کد تمیز، فارسی کامل، آفلاین، و آماده برای تبدیل به اپ موبایل/دسکتاپ.

---

*تهیه شده توسط تیم آکسون — Senior Architect, Frontend, UI/UX, QA, Product*
