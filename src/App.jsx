import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
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

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('vvn_auth_token')
    const userId = localStorage.getItem('vvn_user_id')
    
    if (token && userId) {
      setIsAuthenticated(true)
    }
    setLoading(false)
  }, [])

  const handleLoginSuccess = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('vvn_auth_token')
    localStorage.removeItem('vvn_user_id')
    localStorage.removeItem('vvn_login_time')
    setIsAuthenticated(false)
    setActiveTab('dashboard')
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />
  }

  return (
    <Router>
      <div className="app">
        <header className="header">
          <div className="header-content">
            <div className="logo-container">
              <img src="/Assets/logo.jpeg" alt="VVN Logo" className="logo" />
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
    </Router>
  )
}

export default App
