import React, { useState, useEffect } from 'react'
import { attemptLogin, clearSession } from '../auth'
import '../styles/Login.css'

function Login({ onLoginSuccess }) {
  const [id, setId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Clear any existing sessions on component mount
  useEffect(() => {
    clearSession()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await attemptLogin(id, password)

      if (!result.success) {
        setError(`❌ ${result.error}`)
        setLoading(false)
        return
      }

      setError('')
      setLoading(false)
      onLoginSuccess()
    } catch (err) {
      setError('❌ Login error: ' + (err?.message || 'Authentication failed'))
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
            {loading ? 'Logging in...' : 'Login'}
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
