import { createClient } from '@supabase/supabase-js'

let supabase = null

export function getSupabaseClient() {
  if (!supabase) {
    const url = import.meta.env.VITE_SUPABASE_URL
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    if (!url || !anonKey) {
      throw new Error('Missing Supabase env variables: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
    }
    supabase = createClient(url, anonKey)
  }
  return supabase
}

export function getUserRole(user) {
  if (!user) {
    return null;
  }

  const metadataRole = user.user_metadata?.role || user.app_metadata?.role;
  return metadataRole || 'comum';
}

export function onAuthStateChange(cb) {
  const client = getSupabaseClient();
  return client.auth.onAuthStateChange((event, session) => cb(event, session));
}

export async function signInWithEmail(email, password) {
  const client = getSupabaseClient();
  return client.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  const client = getSupabaseClient();
  return client.auth.signOut();
}
