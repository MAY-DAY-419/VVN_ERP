import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY

console.log('Supabase URL:', supabaseUrl ? 'Configured' : 'MISSING')
console.log('Supabase Key:', supabaseKey ? 'Configured' : 'MISSING')

function validateAnonKey(key) {
  if (!key) return { valid: false, reason: 'Missing key' }
  // Supabase anon keys are JWT-like strings usually starting with 'ey'
  const looksJwt = key.startsWith('ey') && key.length > 50
  return { valid: looksJwt, reason: looksJwt ? null : 'Key does not look like a JWT anon key' }
}

const keyValidation = validateAnonKey(supabaseKey)
if (!keyValidation.valid) {
  console.warn('Supabase key format looks unusual. The anon key typically starts with "ey". Ensure you used the Anon Public Key from Supabase Settings → API.')
}

let supabase = null
try {
  if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey)
    console.log('Supabase client initialized successfully')
  }
} catch (error) {
  console.error('Failed to initialize Supabase:', error)
}

export const supabaseReady = !!(supabaseUrl && supabaseKey && keyValidation.valid && supabase)
export const invalidKeyReason = keyValidation.reason
export { supabase }
