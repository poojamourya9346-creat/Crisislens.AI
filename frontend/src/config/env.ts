/**
 * Environment configuration — validated at runtime.
 * All Vite env vars must be prefixed with VITE_.
 */
export const env = {
  appName: import.meta.env.VITE_APP_NAME ?? "CrisisLens AI",
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1",
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
} as const;

export type Env = typeof env;
