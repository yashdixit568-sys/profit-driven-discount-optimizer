/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE?: string;
  readonly VITE_APP_DESCRIPTION?: string;
  readonly VITE_DEFAULT_CURRENCY?: string;
  readonly VITE_DEFAULT_FORMAT_MODE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
