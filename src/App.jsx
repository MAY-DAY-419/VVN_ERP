import React, { useState, useEffect } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import Landing from './components/Landing'
import Dashboard from './components/Dashboard'
import AddStudentMultiStep from './components/AddStudentMultiStep'
import ViewStudents from './components/ViewStudents'
import FeeDetail from './components/FeeDetail'
import EditStudent from './components/EditStudent'
import Staff from './components/Staff'
import Expenses from './components/Expenses'
import PaymentHistory from './components/PaymentHistory'
import News from './components/News'
import Login from './components/Login'
import InstallPrompt from './components/InstallPrompt'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isNavOpen, setIsNavOpen] = useState(false)
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
      // Check if running in browser
      if (typeof window === 'undefined' || !window.localStorage) {
        setLoading(false)
        return
      }

      const token = localStorage.getItem('vvn_auth_token')
      const userId = localStorage.getItem('vvn_user_id')
      const loginTime = localStorage.getItem('vvn_login_time')
      
      // Check if session exists and is valid
      if (token && userId && loginTime) {
        const loginDate = new Date(loginTime)
        const now = new Date()
        const hoursSinceLogin = (now - loginDate) / (1000 * 60 * 60)
        
        // Session expires after 24 hours
        if (hoursSinceLogin > 24) {
          localStorage.clear()
          setIsAuthenticated(false)
          navigate('/login', { replace: true })
        } else {
          setIsAuthenticated(true)
        }
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
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem('vvn_auth_token')
        localStorage.removeItem('vvn_user_id')
        localStorage.removeItem('vvn_login_time')
      }
    } catch (error) {
      console.error('Logout error:', error)
    }
    setIsAuthenticated(false)
    setActiveTab('dashboard')
    navigate('/', { replace: true })
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
                      <h1>VIPIN VIDHYA NIKETAN</h1>
                      <p>Student Management System</p>
                    </div>
                  </div>
                  <button className="logout-btn" onClick={handleLogout}>Logout</button>
                </div>
              </header>

              <button className="hamburger-menu" onClick={() => setIsNavOpen(!isNavOpen)}>
                <span></span>
                <span></span>
                <span></span>
              </button>

              <nav className={`nav-buttons ${isNavOpen ? 'open' : ''}`}>
                <Link 
                  to="/dashboard" 
                  className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('dashboard'); setIsNavOpen(false); }}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/add-student" 
                  className={`nav-btn ${activeTab === 'add' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('add'); setIsNavOpen(false); }}
                >
                  Add Student
                </Link>
                <Link 
                  to="/view-students" 
                  className={`nav-btn ${activeTab === 'view' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('view'); setIsNavOpen(false); }}
                >
                  View Students
                </Link>
                <Link 
                  to="/fee-detail" 
                  className={`nav-btn ${activeTab === 'fees' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('fees'); setIsNavOpen(false); }}
                >
                  Fees Detail
                </Link>
                <Link 
                  to="/edit-student" 
                  className={`nav-btn ${activeTab === 'edit' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('edit'); setIsNavOpen(false); }}
                >
                  Edit Student
                </Link>
                <Link 
                  to="/staff" 
                  className={`nav-btn ${activeTab === 'staff' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('staff'); setIsNavOpen(false); }}
                >
                  Staff
                </Link>
                <Link 
                  to="/expenses" 
                  className={`nav-btn ${activeTab === 'expenses' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('expenses'); setIsNavOpen(false); }}
                >
                  Expenses
                </Link>
                <Link 
                  to="/payment-history" 
                  className={`nav-btn ${activeTab === 'payments' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('payments'); setIsNavOpen(false); }}
                >
                  Payment History
                </Link>
                <Link 
                  to="/news" 
                  className={`nav-btn ${activeTab === 'news' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('news'); setIsNavOpen(false); }}
                >
                  News
                </Link>
              </nav>

              {/* Backdrop overlay for mobile menu */}
              {isNavOpen && <div className="nav-backdrop" onClick={() => setIsNavOpen(false)}></div>}

              <main className="main-content">
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/add-student" element={<AddStudentMultiStep />} />
                  <Route path="/view-students" element={<ViewStudents />} />
                  <Route path="/fee-detail" element={<FeeDetail />} />
                  <Route path="/edit-student" element={<EditStudent />} />
                  <Route path="/staff" element={<Staff />} />
                  <Route path="/expenses" element={<Expenses />} />
                  <Route path="/payment-history" element={<PaymentHistory />} />
                  <Route path="/news" element={<News />} />
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
