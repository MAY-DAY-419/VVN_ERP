import React, { useState, useEffect } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import AddStudent from './components/AddStudent'
import ViewStudents from './components/ViewStudents'
import Login from './components/Login'
import InstallPrompt from './components/InstallPrompt'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Check authentication on mount
  useEffect(() => {
    try {
      const token = localStorage.getItem('vvn_auth_token')
      const userId = localStorage.getItem('vvn_user_id')
      
      console.log('Auth check - Token:', !!token, 'UserId:', !!userId)
      
      if (token && userId) {
        setIsAuthenticated(true)
      } else {
        setIsAuthenticated(false)
        navigate('/login', { replace: true })
      }
    } catch (error) {
      console.error('Auth check error:', error)
      setIsAuthenticated(false)
      navigate('/login', { replace: true })
    } finally {
      setLoading(false)
    }
  }, [navigate])

  const handleLoginSuccess = () => {
    setIsAuthenticated(true)
    navigate('/', { replace: true })
  }

  const handleLogout = () => {
    try {
      localStorage.removeItem('vvn_auth_token')
      localStorage.removeItem('vvn_user_id')
      localStorage.removeItem('vvn_login_time')
    } catch (error) {
      console.error('Logout error:', error)
    }
    setIsAuthenticated(false)
    setActiveTab('dashboard')
    navigate('/login', { replace: true })
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <Routes>
      <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
      <Route 
        path="/*" 
        element={
          isAuthenticated ? (
            <div className="app">
              <header className="header">
                <div className="header-content">
                  <div className="logo-container">
                    <img src="/logo.jpeg" alt="VVN Logo" className="logo" loading="lazy" />
                    <div>
                      <h1>🎓 VIPIN VIDHYA NIKETAN</h1>
                      <p>Student Management System</p>
                    </div>
                  </div>
                  <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
                </div>
              </header>

              <nav className="nav-buttons">
                <Link 
                  to="/" 
                  className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                  onClick={() => setActiveTab('dashboard')}
                >
                  📊 Dashboard
                </Link>
                <Link 
                  to="/add-student" 
                  className={`nav-btn ${activeTab === 'add' ? 'active' : ''}`}
                  onClick={() => setActiveTab('add')}
                >
                  ➕ Add Student
                </Link>
                <Link 
                  to="/view-students" 
                  className={`nav-btn ${activeTab === 'view' ? 'active' : ''}`}
                  onClick={() => setActiveTab('view')}
                >
                  👥 View Students
                </Link>
              </nav>

              <main className="main-content">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/add-student" element={<AddStudent />} />
                  <Route path="/view-students" element={<ViewStudents />} />
                </Routes>
              </main>

              {/* Install prompt for PWA */}
              <InstallPrompt />
            </div>
          ) : null
        } 
      />
    </Routes>
  )
}

export default App
