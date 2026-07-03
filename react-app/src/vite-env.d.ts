interface ImportMetaEnv {
  readonly VITE_BACKEND: string,
  readonly VITE_VERSION: string,
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}