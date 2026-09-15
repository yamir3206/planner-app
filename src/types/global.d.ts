/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly BASE_URL: string
  readonly VITE_USE_HASH: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module 'virtual:pwa-register/react' {
  export function useRegisterSW(options?: {
    onRegistered?: (r: any) => void
    onRegisterError?: (error: any) => void
  }): {
    needRefresh: [boolean, (v: boolean) => void]
    offlineReady: [boolean, (v: boolean) => void]
    updateServiceWorker: (reloadPage?: boolean) => Promise<void>
  }
}
