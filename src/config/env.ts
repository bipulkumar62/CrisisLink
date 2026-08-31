/**
 * Environment configuration for CrisisLink.
 * Reads VITE_API_BASE_URL and VITE_SUPABASE_* cleanly with safe fallbacks.
 * Zero secrets or privileged tokens are permitted here — anon key is governed by RLS.
 */

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() || '';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() || '';
const forceMock = (import.meta.env.VITE_FORCE_MOCK as string | undefined)?.trim() === 'true';

export const ENV = {
  API_BASE_URL: (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || '',
  IS_MOCK_MODE: forceMock || !(import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim(),
  APP_ENV: import.meta.env.MODE || 'development',
  SUPABASE_URL: supabaseUrl,
  SUPABASE_ANON_KEY: supabaseAnonKey,
  IS_SUPABASE_MODE: !forceMock && !!supabaseUrl && !!supabaseAnonKey,
} as const;
