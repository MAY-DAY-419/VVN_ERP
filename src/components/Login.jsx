import React, { useState } from 'react'
import '../styles/Login.css'

function Login({ onLoginSuccess }) {
  const [id, setId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Hash function using Web Crypto API
  async function hashPassword(pass) {
    const encoder = new TextEncoder()
    const data = encoder.encode(pass)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Get credentials from environment variables
      const correctId = import.meta.env.VITE_ADMIN_ID || 'admin'
      const correctPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'vvn@12345'

      // Validate
      if (id !== correctId) {
        setError('❌ Invalid ID')
        setLoading(false)
        return
      }

      if (password !== correctPassword) {
        setError('❌ Invalid Password')
        setLoading(false)
        return
      }

      // Hash the password and store session
      const hashedPassword = await hashPassword(password)
      localStorage.setItem('vvn_auth_token', hashedPassword)
      localStorage.setItem('vvn_user_id', id)
      localStorage.setItem('vvn_login_time', new Date().toISOString())

      setError('')
      setLoading(false)
      onLoginSuccess()
    } catch (err) {
      setError('❌ Error during login: ' + err.message)
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      {/* Watermark Background */}
      <div className="watermark-bg">
        <div className="watermark-logo">
          <img src="/logo.jpeg" alt="VVN Logo" className="watermark-img" />
        </div>
      </div>

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
