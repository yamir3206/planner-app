try {
  const c = localStorage.getItem('axon_theme_color') || (() => {
    try { const p = JSON.parse(localStorage.getItem('axon_theme') || '{}'); return p.state?.colorTheme || 'axon' } catch { return 'axon' }
  })()
  const m = localStorage.getItem('axon_theme_mode') || (() => {
    try { const p = JSON.parse(localStorage.getItem('axon_theme') || '{}'); return p.state?.mode || 'system' } catch { return 'system' }
  })()
  const r = document.documentElement
  r.classList.add(`theme-${c}`)
  r.classList.add(m === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : m)
} catch {}

import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './app/router'
import './styles/globals.css'
import '@fontsource/vazirmatn/400.css'
import '@fontsource/vazirmatn/500.css'
import '@fontsource/vazirmatn/700.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <RouterProvider router={router} />
)
