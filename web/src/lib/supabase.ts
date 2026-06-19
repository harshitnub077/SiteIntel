import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'mock-url',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-anon-key'
  )
}
