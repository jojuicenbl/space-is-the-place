interface ImportMetaEnv {
  readonly VITE_DISCOGS_TOKEN: string
}

// Cette ligne est importante
interface ImportMeta {
  env: ImportMetaEnv
}
