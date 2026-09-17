import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './app/router'
import './styles/globals.css'
import '@fontsource/vazirmatn/400.css'
import '@fontsource/vazirmatn/500.css'
import '@fontsource/vazirmatn/700.css'

// Safe theme init - after imports
try {
  const getThemeColor = () => {
    try {
      const direct = localStorage.getItem('axon_theme_color')
      if (direct) return direct
      const stored = localStorage.getItem('axon_theme')
      if (stored) {
        const p = JSON.parse(stored)
        return p.state?.colorTheme || 'axon'
      }
    } catch {}
    return 'axon'
  }
  const getThemeMode = () => {
    try {
      const direct = localStorage.getItem('axon_theme_mode')
      if (direct) return direct
      const stored = localStorage.getItem('axon_theme')
      if (stored) {
        const p = JSON.parse(stored)
        return p.state?.mode || 'system'
      }
    } catch {}
    return 'system'
  }
  const c = getThemeColor()
  const m = getThemeMode()
  const r = document.documentElement
  if (r) {
    r.classList.add(`theme-${c}`)
    const isDark = m === 'system' ? (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)').matches : false) : m === 'dark'
    r.classList.add(isDark ? 'dark' : 'light')
  }
} catch (e) {
  console.warn('[Axon] Theme init failed', e)
}

function renderApp() {
  try {
    const rootEl = document.getElementById('root')
    if (!rootEl) {
      console.error('[Axon] Root element not found')
      document.body.innerHTML = '<div style="padding:20px;text-align:center">خطا: المان اصلی یافت نشد</div>'
      return
    }
    const root = ReactDOM.createRoot(rootEl)
    root.render(
      <React.StrictMode>
        <RouterProvider router={router} />
      </React.StrictMode>
    )
    console.log('[Axon] App rendered successfully')
  } catch (e) {
    console.error('[Axon] Render failed', e)
    const rootEl = document.getElementById('root')
    if (rootEl) {
      rootEl.innerHTML = `
        <div style="padding:20px;max-width:600px;margin:50px auto;background:white;border:2px solid #ef4444;border-radius:12px;font-family:sans-serif">
          <h2 style="color:#ef4444">خطا در بارگذاری برنامه</h2>
          <p style="color:#666;font-size:14px;margin:10px 0">${(e as Error).message}</p>
          <pre style="background:#f5f5f5;padding:10px;border-radius:6px;font-size:12px;overflow:auto">${(e as Error).stack || ''}</pre>
          <div style="margin-top:15px;display:flex;gap:10px">
            <button onclick="location.reload()" style="padding:8px 16px;background:#6366F1;color:white;border:none;border-radius:6px;cursor:pointer">تلاش مجدد</button>
            <button onclick="localStorage.clear();location.reload()" style="padding:8px 16px;background:#eee;border:none;border-radius:6px;cursor:pointer">پاک کردن حافظه</button>
          </div>
        </div>
      `
    }
  }
}

// Ensure DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderApp)
} else {
  renderApp()
}
