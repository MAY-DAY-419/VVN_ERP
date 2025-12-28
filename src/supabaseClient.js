import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase configuration missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_KEY in .env.')
}

export const supabase = createClient(supabaseUrl, supabaseKey)
