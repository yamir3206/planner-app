# دیپلوی آکسون — راهنمای استقرار

## ✅ وضعیت فعلی

- ✅ Branch `gh-pages` ساخته و push شد
- ✅ Build با `BASE_PATH=/planner-app/` انجام شد
- ✅ فایل‌های استاتیک شامل `index.html`, `404.html`, `assets/`, `sw.js`, `manifest.webmanifest`, `.nojekyll`
- ✅ PWA آماده

---

## 🌐 GitHub Pages

### لینک نهایی (بعد از فعال‌سازی):
```
https://yamir3206.github.io/planner-app/
```

### فعال‌سازی (یک بار):
1. به ریپازیتوری برو: https://github.com/yamir3206/planner-app
2. Settings → Pages
3. Source: Deploy from a branch
4. Branch: `gh-pages` / `(root)`
5. Save

بعد از 1-2 دقیقه سایت بالا می‌آید.

### آپدیت بعدی:
```bash
# در branch arena/01a08ed0-planner-app
BASE_PATH=/planner-app/ npm run build

# کپی dist به gh-pages
rm -rf /tmp/gh-pages-dist && cp -r dist /tmp/gh-pages-dist && touch /tmp/gh-pages-dist/.nojekyll

git checkout --orphan gh-pages
git reset --hard && git clean -fdx
cp -r /tmp/gh-pages-dist/* . && cp /tmp/gh-pages-dist/.nojekyll .
git add . && git commit -m "deploy: update"
git push -f origin gh-pages
git checkout arena/01a08ed0-planner-app
```

یا با اسکریپت خودکار:
```bash
npm run build # با BASE_PATH=/planner-app/
npx gh-pages -d dist -b gh-pages --dotfiles
```

---

## ▲ Vercel

- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`
- Environment: `BASE_PATH=/` (یا خالی)

SPA routing خودکار کار می‌کند.

---

## 🌿 Netlify

- Build Command: `npm run build`
- Publish Directory: `dist`
- اضافه کردن فایل `public/_redirects`:
```
/* /index.html 200
```

یا در `netlify.toml`:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## ☁️ Cloudflare Pages

- Build Command: `npm run build`
- Output: `dist`
- SPA mode: فعال

---

## 📱 PWA

- بعد از دیپلوی، مرورگر SW را نصب می‌کند
- آفلاین کار می‌کند
- Update prompt خودکار با `PWAUpdatePrompt` component
- Icons: 192, 512 maskable

---

## 🔍 تست بعد از دیپلوی

1. باز کردن `https://yamir3206.github.io/planner-app/`
2. چک کردن:
   - [ ] صفحه لود می‌شود (بدون 404)
   - [ ] Refresh روی `/timer` کار می‌کند (404.html fallback)
   - [ ] PWA نصب می‌شود (Add to Home Screen)
   - [ ] آفلاین کار می‌کند (DevTools → Offline)
   - [ ] Dark Mode
   - [ ] فارسی و RTL
   - [ ] تایمر و ذخیره‌سازی

---

## 🐛 عیب‌یابی GitHub Pages

**مشکل: صفحه سفید یا 404**
- چک کن `index.html` در root gh-pages باشد
- چک کن `404.html` وجود داشته باشد (برای SPA routing)
- چک کن `.nojekyll` وجود داشته باشد
- Base path باید `/planner-app/` باشد نه `/`

**مشکل: Assets لود نمی‌شود**
- در DevTools Network ببین آیا `/planner-app/assets/...` 404 می‌دهد
- اگر بله، BASE_PATH اشتباه بوده، دوباره با `BASE_PATH=/planner-app/` بیلد کن

**مشکل: PWA قدیمی گیر کرده**
- DevTools → Application → Clear Storage
- یا دکمه "بروزرسانی" در PWAUpdatePrompt

---

## 📦 نسخه فعلی دیپلوی شده

- Version: 1.0.0
- Date: 2026-09-11
- Source: arena/01a08ed0-planner-app commit e8a8176
- Build: Vite 5.4.21, PWA precache 21 files (2.4MB)
- Features: تمام 10 صفحه، تایمر دقیق، تحلیل، PWA آفلاین
