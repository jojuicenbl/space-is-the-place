/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DISCOGS_TOKEN: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
