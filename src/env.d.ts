/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_USER_POOL_ID: string;
  readonly VITE_USER_POOL_CLIENT_ID: string;
  readonly VITE_AWS_REGION: string;
  readonly VITE_DEV_PORT?: string;
  readonly VITE_AUTH_DOMAIN?: string;
  readonly VITE_REDIRECT_SIGN_IN?: string;
  readonly VITE_REDIRECT_SIGN_OUT?: string;
  readonly VITE_APP_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
