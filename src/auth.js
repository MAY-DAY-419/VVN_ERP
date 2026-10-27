import { supabase } from './supabaseClient'

async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Computes a cryptographic signature for a local admin session
 */
export async function computeSessionSignature(userId, timestamp) {
  const secret = (import.meta.env.VITE_ADMIN_PASSWORD || 'vvn_erp_secret').trim()
  return await sha256(`${userId}_${timestamp}_${secret}`)
}

/**
 * Validates the current session in localStorage
 */
export async function verifySession() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false
  }

  try {
    // 1. Check if Supabase Auth session exists
    if (supabase) {
      const { data } = await supabase.auth.getSession()
      if (data?.session) {
        return true
      }
    }

    // 2. Check local cryptographic session
    const token = localStorage.getItem('vvn_auth_token')
    const userId = localStorage.getItem('vvn_user_id')
    const loginTime = localStorage.getItem('vvn_login_time')
    const signature = localStorage.getItem('vvn_auth_sig')

    if (!token || !userId || !loginTime || !signature) {
      return false
    }

    const loginDate = new Date(loginTime)
    const now = new Date()
    const hoursSinceLogin = (now - loginDate) / (1000 * 60 * 60)

    // Session expires after 24 hours
    if (hoursSinceLogin > 24) {
      clearSession()
      return false
    }

    // Verify cryptographic signature
    const expectedSig = await computeSessionSignature(userId, loginTime)
    if (signature !== expectedSig) {
      clearSession()
      return false
    }

    return true
  } catch (error) {
    console.error('Session verification error:', error)
    return false
  }
}

/**
 * Clears all auth sessions
 */
export async function clearSession() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('vvn_auth_token')
      localStorage.removeItem('vvn_user_id')
      localStorage.removeItem('vvn_login_time')
      localStorage.removeItem('vvn_auth_sig')
    }
    if (supabase) {
      await supabase.auth.signOut().catch(() => {})
    }
  } catch (error) {
    console.error('Logout error:', error)
  }
}

/**
 * Handles login attempts with Supabase Auth and environment credentials
 */
export async function attemptLogin(id, password) {
  const cleanId = (id || '').trim()
  const cleanPassword = (password || '').trim()

  if (!cleanId || !cleanPassword) {
    return { success: false, error: 'Please enter both ID and password' }
  }

  // 1. If Supabase is available and ID looks like an email, try Supabase Auth
  if (supabase && cleanId.includes('@') && cleanId.includes('.')) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanId,
        password: cleanPassword
      })

      if (!error && data?.session) {
        return { success: true, method: 'supabase' }
      }
    } catch {
      // Fall through to environment credentials
    }
  }

  // 2. Environment credentials check
  const envAdminId = (import.meta.env.VITE_ADMIN_ID || '').trim()
  const envAdminPass = (import.meta.env.VITE_ADMIN_PASSWORD || '').trim()

  if (!envAdminId || !envAdminPass) {
    return { success: false, error: 'System error: Admin credentials are not configured in environment variables' }
  }

  if (cleanId !== envAdminId) {
    return { success: false, error: 'Invalid ID' }
  }

  if (cleanPassword !== envAdminPass) {
    return { success: false, error: 'Invalid Password' }
  }

  // 3. Create cryptographically signed session
  const timestamp = new Date().toISOString()
  const sessionToken = `vvn_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
  const signature = await computeSessionSignature(cleanId, timestamp)

  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem('vvn_auth_token', sessionToken)
    localStorage.setItem('vvn_user_id', cleanId)
    localStorage.setItem('vvn_login_time', timestamp)
    localStorage.setItem('vvn_auth_sig', signature)
  }

  return { success: true, method: 'env' }
}
