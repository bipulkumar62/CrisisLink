/**
 * Supabase singleton client for CrisisLink.
 * Uses the anon key which is safe to expose in the browser —
 * all data access is governed by Row-Level Security policies on the Supabase side.
 */

import { createClient } from '@supabase/supabase-js';
import { ENV } from '@/src/config/env';

if (!ENV.SUPABASE_URL || !ENV.SUPABASE_ANON_KEY) {
  console.warn(
    '[CrisisLink] Supabase credentials missing. Running in mock mode. ' +
    'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env to enable real data.'
  );
}

export const supabase = createClient(
  ENV.SUPABASE_URL || 'https://placeholder.supabase.co',
  ENV.SUPABASE_ANON_KEY || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);
