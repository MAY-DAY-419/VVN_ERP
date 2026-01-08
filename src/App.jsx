import React, { useState, useEffect } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import Landing from './components/Landing'
import Dashboard from './components/Dashboard'
import AddStudent from './components/AddStudent'
import ViewStudents from './components/ViewStudents'
import FeeDetail from './components/FeeDetail'
import EditStudent from './components/EditStudent'
import Staff from './components/Staff'
import Expenses from './components/Expenses'
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
    // Only check auth if not on landing or login page
    const path = window.location.pathname
    if (path === '/' || path === '/login') {
      setLoading(false)
      return
    }

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
    navigate('/dashboard', { replace: true })
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
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
      <Route path="/app" element={<Login onLoginSuccess={handleLoginSuccess} />} />
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
                  to="/dashboard" 
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
                <Link 
                  to="/fee-detail" 
                  className={`nav-btn ${activeTab === 'fees' ? 'active' : ''}`}
                  onClick={() => setActiveTab('fees')}
                >
                  💳 Fees Detail
                </Link>
                <Link 
                  to="/edit-student" 
                  className={`nav-btn ${activeTab === 'edit' ? 'active' : ''}`}
                  onClick={() => setActiveTab('edit')}
                >
                  ✏️ Edit Student
                </Link>
                <Link 
                  to="/staff" 
                  className={`nav-btn ${activeTab === 'staff' ? 'active' : ''}`}
                  onClick={() => setActiveTab('staff')}
                >
                  👨‍💼 Staff
                </Link>
                <Link 
                  to="/expenses" 
                  className={`nav-btn ${activeTab === 'expenses' ? 'active' : ''}`}
                  onClick={() => setActiveTab('expenses')}
                >
                  💰 Expenses
                </Link>
              </nav>

              <main className="main-content">
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/add-student" element={<AddStudent />} />
                  <Route path="/view-students" element={<ViewStudents />} />
                  <Route path="/fee-detail" element={<FeeDetail />} />
                  <Route path="/edit-student" element={<EditStudent />} />
                  <Route path="/staff" element={<Staff />} />
                  <Route path="/expenses" element={<Expenses />} />
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
