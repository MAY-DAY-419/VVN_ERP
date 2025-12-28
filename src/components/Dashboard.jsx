import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

function Dashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    regularStudents: 0,
    tuitionStudents: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      if (!supabase) {
        console.error('Supabase not configured. Skipping dashboard load.')
        setLoading(false)
        return
      }
      const { data: students, error } = await supabase
        .from('students')
        .select('*')

      if (error) throw error

      // Calculate stats
      const total = students.length
      
      // Count regular students
      const regular = students.filter(s => s.admissiontype === 'Regular').length
      
      // Count tuition students
      const tuition = students.filter(s => s.admissiontype === 'Tuition').length

      setStats({
        totalStudents: total,
        regularStudents: regular,
        tuitionStudents: tuition
      })
      
      setLoading(false)
    } catch (error) {
      console.error('Error loading dashboard:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading dashboard...</div>
  }

  return (
    <div className="container">
      <h2 style={{ marginBottom: '30px', color: '#333' }}>📊 Dashboard Overview</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{stats.totalStudents}</h3>
          <p>Total Students</p>
        </div>
        <div className="stat-card">
          <h3>{stats.regularStudents}</h3>
          <p>Regular Students</p>
        </div>
        <div className="stat-card">
          <h3>{stats.tuitionStudents}</h3>
          <p>Tuition Students</p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
