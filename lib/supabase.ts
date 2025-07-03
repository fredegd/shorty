import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if Supabase is configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

// Only create client if environment variables are available
export const supabase = isSupabaseConfigured ? createClient(supabaseUrl!, supabaseAnonKey!) : null

export type UrlRecord = {
  id: string
  short_code: string
  original_url: string
  created_at: string
  click_count: number
  last_accessed: string | null
}
