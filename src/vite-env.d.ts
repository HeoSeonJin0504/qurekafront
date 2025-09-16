/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FASTAPI_URL: string
  readonly VITE_LOGIN_ID: string
  readonly VITE_LOGIN_PW: string
  readonly VITE_FASTAPI_URL: string
  // 다른 env 키가 있으면 여기에 추가…
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
