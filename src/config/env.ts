/**
 * Environment configuration for CrisisLink.
 * Reads VITE_API_BASE_URL cleanly with safe fallbacks.
 * Zero secrets or privileged tokens are permitted here.
 */

export const ENV = {
  API_BASE_URL: (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || '',
  IS_MOCK_MODE: !(import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim(),
  APP_ENV: import.meta.env.MODE || 'development',
} as const;
