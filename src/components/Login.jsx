import React, { useState, useEffect } from 'react'
import '../styles/Login.css'

function Login({ onLoginSuccess }) {
  const [id, setId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Clear any existing sessions on component mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('vvn_auth_token')
      localStorage.removeItem('vvn_user_id')
      localStorage.removeItem('vvn_login_time')
    }
  }, [])

  const handleClearSession = () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.clear()
      setError('')
      alert('Session cleared. Please log in again.')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Get credentials from environment variables ONLY
      const correctId = import.meta.env.VITE_ADMIN_ID
      const correctPassword = import.meta.env.VITE_ADMIN_PASSWORD

      console.log('Auth attempt:', { hasEnvId: !!correctId, hasEnvPass: !!correctPassword })

      if (!correctId || !correctPassword) {
        setError('❌ System error: Credentials not configured')
        setLoading(false)
        return
      }

      // Direct comparison - no hashing
      if (id.trim() !== correctId.trim()) {
        setError('❌ Invalid ID')
        setLoading(false)
        return
      }

      if (password !== correctPassword) {
        setError('❌ Invalid Password')
        setLoading(false)
        return
      }

      // Create new session token
      const sessionToken = `vvn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('vvn_auth_token', sessionToken)
        localStorage.setItem('vvn_user_id', id)
        localStorage.setItem('vvn_login_time', new Date().toISOString())
      }

      setError('')
      setLoading(false)
      onLoginSuccess()
    } catch (err) {
      setError('❌ Login error: ' + err.message)
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <img src="/logo.jpeg" alt="VIPIN VIDHYA NIKETAN" className="login-logo" />
          <h1>VIPIN VIDHYA NIKETAN</h1>
          <p>Student Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="id">ID</label>
            <input
              type="text"
              id="id"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="Enter your ID"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={loading}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Logging in...' : '🔐 Login'}
          </button>

          <button
            type="button"
            className="clear-session-btn"
            onClick={handleClearSession}
            style={{ marginTop: '10px', padding: '8px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' }}
          >
            Clear Session & Logout
          </button>
        </form>

        <div className="login-footer">
          <p>Secure access for authorized users only</p>
        </div>
      </div>

      {/* Bottom watermark */}
      <div className="watermark-footer">
        <p>© 2025 VIPIN VIDHYA NIKETAN. All rights reserved.</p>
      </div>
    </div>
  )
}

export default Login
