import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

const base = process.env.BASE_PATH || '/'

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.png'],
      manifest: {
        name: 'آکسون - برنامه‌ریز کنکور',
        short_name: 'آکسون',
        description: 'نرم‌افزار حرفه‌ای برنامه‌ریزی مطالعه کنکور - آفلاین، فارسی، زیبا، هر دیتابیس',
        theme_color: '#6366F1',
        background_color: '#FFFFFF',
        display: 'standalone',
        dir: 'rtl',
        lang: 'fa',
        start_url: base,
        scope: base,
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,webmanifest}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
      devOptions: { enabled: false }
    })
  ],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  server: { 
    host: '0.0.0.0', 
    port: 5173, 
    cors: true,
    hmr: { host: 'localhost' },
    headers: { 'Access-Control-Allow-Origin': '*' },
    // @ts-ignore - allow all hosts for Arena preview
    allowedHosts: true
  },
  preview: { host: '0.0.0.0', port: 4173, cors: true },
  test: { globals: true, environment: 'jsdom', setupFiles: ['./src/test/setup.ts'] },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    minify: 'esbuild'
  }
})
