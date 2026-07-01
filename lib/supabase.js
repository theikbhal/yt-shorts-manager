import { createClient } from '@supabase/supabase-js'

let supabase = null

export function getSupabase() {
  if (!supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase env variables')
    }
    supabase = createClient(supabaseUrl, supabaseAnonKey)
  }
  return supabase
}
