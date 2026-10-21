import { createClient } from '@supabase/supabase-js';

export const BUCKET_NAME = 'linkdrop-files';

// Retrieve credentials with priority: localStorage > import.meta.env
export function getSupabaseCredentials() {
  const localUrl = typeof window !== 'undefined' ? localStorage.getItem('linkdrop_supabase_url') : null;
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('linkdrop_supabase_key') : null;

  const url = (localUrl && localUrl.trim()) || (import.meta.env.VITE_SUPABASE_URL || '').trim();
  const key = (localKey && localKey.trim()) || (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

  return { url, key };
}

export function isSupabaseConfigured() {
  const { url, key } = getSupabaseCredentials();
  return Boolean(
    url &&
    key &&
    url.startsWith('https://') &&
    url.includes('.supabase.co') &&
    key.length > 20
  );
}

let cachedClient = null;
let lastUsedUrl = null;
let lastUsedKey = null;

export function getSupabaseClient() {
  const { url, key } = getSupabaseCredentials();

  if (!url || !key) return null;

  if (cachedClient && lastUsedUrl === url && lastUsedKey === key) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    lastUsedUrl = url;
    lastUsedKey = key;
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

/**
 * Test connectivity to Supabase project & check bucket
 */
export async function testSupabaseConnection(overrideUrl, overrideKey) {
  const url = overrideUrl || getSupabaseCredentials().url;
  const key = overrideKey || getSupabaseCredentials().key;

  if (!url || !key) {
    return { ok: false, error: 'Supabase URL and API Key are required.' };
  }

  try {
    const client = createClient(url, key, { auth: { persistSession: false } });
    
    // Check database connection by querying drops table (or empty select)
    const { error: dbError } = await client.from('drops').select('id').limit(1);
    if (dbError && dbError.code === '42P01') {
      return { 
        ok: false, 
        error: "Table 'drops' does not exist yet. Please execute supabase/schema.sql in your Supabase SQL Editor." 
      };
    }

    return { ok: true, message: 'Successfully connected to Supabase!' };
  } catch (err) {
    return { ok: false, error: err.message || 'Connection failed' };
  }
}

export function saveSupabaseConfig(url, key) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('linkdrop_supabase_url', url.trim());
    localStorage.setItem('linkdrop_supabase_key', key.trim());
    cachedClient = null;
  }
}

export function clearSupabaseConfig() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('linkdrop_supabase_url');
    localStorage.removeItem('linkdrop_supabase_key');
    cachedClient = null;
  }
}
