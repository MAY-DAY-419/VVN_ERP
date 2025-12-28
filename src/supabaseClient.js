import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY

console.log('Supabase URL:', supabaseUrl ? 'Configured' : 'MISSING')
console.log('Supabase Key:', supabaseKey ? 'Configured' : 'MISSING')

let supabase = null

if (supabaseUrl && supabaseKey) {
  try {
    if (!supabaseKey.startsWith('ey')) {
      console.warn('Supabase key format looks unusual. The anon key typically starts with "ey". Ensure you used the Anon Public Key from Supabase Settings → API.')
    }
    supabase = createClient(supabaseUrl, supabaseKey)
    console.log('Supabase client initialized successfully')
  } catch (error) {
    console.error('Failed to initialize Supabase:', error)
  }
} else {
  console.error('⚠️ Supabase configuration missing!')
  console.error('Required environment variables:')
  console.error('- VITE_SUPABASE_URL')
  console.error('- VITE_SUPABASE_KEY')
  console.error('Please set these in Vercel Environment Variables')
}

export { supabase }
