interface ImportMetaEnv {
  readonly VITE_DISCOGS_TOKEN: string
  // Ajoutez d'autres variables d'environnement ici si nécessaire
}

// Cette ligne est importante
interface ImportMeta {
  env: ImportMetaEnv
}
