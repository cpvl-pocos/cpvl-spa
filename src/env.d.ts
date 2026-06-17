/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL base da API (ex: http://localhost:8000, https://cpvl-api-production.up.railway.app) */
  readonly VITE_API_URI: string;
  /** Chave usada no localStorage para estado de login do usuário */
  readonly VITE_LOGGED_KEY: string;
  /** Chave PIX do CPVL para pagamentos */
  readonly VITE_PIX_KEY_CPVL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
