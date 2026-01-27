/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SITE_URL: string
  // agar boshqa .env o‘zgaruvchilaring bo‘lsa, ularni ham shu yerda yoz
  // readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
