/// <reference types="@dcloudio/types" />
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_MAP_USE_REMOTE_API?: string
  readonly VITE_MAP_SIMULATE_API_ERROR?: string
  readonly VITE_SERVICE_USE_REMOTE_API?: string
  readonly VITE_SERVICE_SIMULATE_API_ERROR?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
