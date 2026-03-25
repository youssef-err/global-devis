import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

export function createBrowserSupabaseClient(): SupabaseClient | null {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Supabase browser client disabled: missing public environment variables.');
      }
      return null;
    }

    return createBrowserClient(url, key);
  } catch (error) {
    console.warn('Failed to initialize Supabase browser client:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}
