# اجرای آکسون در هر جایی

این برنامه به صورت کاملاً مستقل و بدون وابستگی به GitHub Pages قابل اجراست.

## 🚀 روش‌های اجرا

### 1. اجرای محلی (ساده‌ترین)
```bash
npm install
npm run dev
# باز کن: http://localhost:5173
```

### 2. اجرای Production محلی
```bash
npm run build
npm run preview
# http://localhost:4173
```

### 3. Docker (هر سروری)
```dockerfile
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
docker build -t axon-planner .
docker run -p 80:80 axon-planner
```

### 4. با دیتابیس ابری (Supabase)

1. در Supabase پروژه بساز
2. متغیرهای محیطی را تنظیم کن:
```env
VITE_DATABASE_TYPE=supabase
VITE_DATABASE_URL=https://your-project.supabase.co
VITE_DATABASE_API_KEY=your-anon-key
```

3. یا از داخل برنامه: تنظیمات → دیتابیس → Supabase

### 5. Vercel / Netlify / Cloudflare
```bash
# فقط پوشه dist را آپلود کن
npm run build
# dist را در Vercel/Netlify بکش و رها کن
```

### 6. Node.js سرور شخصی
```bash
npm install -g serve
npm run build
serve -s dist -l 3000
```

## 🗄️ انواع دیتابیس

| نوع | توضیح | نیاز به اینترنت |
|-----|-------|----------------|
| `auto` | خودکار - بهترین را انتخاب می‌کند | خیر |
| `indexeddb` | مرورگر - سریع و آفلاین | خیر |
| `localstorage` | مرورگر ساده | خیر |
| `supabase` | ابری - همگام همه‌جا | بله |
| `firebase` | گوگل ابری | بله |
| `rest` | سرور شخصی شما | بله |
| `memory` | موقت | خیر |

## 🔐 سیستم لاگین

- ثبت‌نام و ورود کامل
- رمزها امن ذخیره می‌شوند
- هر کاربر داده‌های خودش را دارد
- بدون نیاز به سرور خارجی (محلی کار می‌کند)
- اگر به Supabase وصل شوی، لاگین ابری هم فعال می‌شود

## 📦 متغیرهای محیطی

```env
# دیتابیس
VITE_DATABASE_TYPE=auto
VITE_DATABASE_URL=
VITE_DATABASE_API_KEY=

# برنامه
VITE_APP_TITLE=آکسون
BASE_PATH=/
```

## 🌐 دامنه شخصی

برای اجرا روی دامنه خودت:
```bash
BASE_PATH=/ npm run build
# فایل‌های dist را روی هاست آپلود کن
```

## ✅ تست

```bash
npm run build
# باید بدون خطا بسازد
```

همه چیز آفلاین هم کار می‌کند!
