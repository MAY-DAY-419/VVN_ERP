import React, { useEffect, useState } from 'react'
import { supabase, supabaseReady } from '../supabaseClient'

function Dashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    regularStudents: 0,
    tuitionStudents: 0,
    totalFees: 0,
    paidFees: 0,
    unpaidFees: 0,
    feePercentage: 0
  })
  const [staffList, setStaffList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      if (!supabaseReady) {
        console.error('Supabase not configured. Skipping dashboard load.')
        setLoading(false)
        return
      }
      
      // Load students
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('*')

      if (studentsError) throw studentsError

      // Calculate student stats
      const total = students?.length || 0
      const regular = students?.filter(s => s.admissiontype === 'Regular').length || 0
      const tuition = students?.filter(s => s.admissiontype === 'Tuition' || s.admissiontype === 'Tution').length || 0

      // Calculate fees from transactions
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('transactionType', 'Fee')

      const paidFees = transactions?.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0) || 0

      // Get total expected fees from feedetail table
      const { data: feeDetails, error: feeError } = await supabase
        .from('feedetail')
        .select('totalfees')

      const totalExpectedFees = feeDetails?.reduce((sum, f) => sum + parseFloat(f.totalfees || 0), 0) || (total * 10000)
      const unpaidFees = totalExpectedFees - paidFees
      const feePercentage = totalExpectedFees > 0 ? (paidFees / totalExpectedFees) * 100 : 0

      // Load staff members
      const { data: staff, error: staffError } = await supabase
        .from('staff')
        .select('name, position, post')
        .order('name', { ascending: true })

      setStaffList(staff || [])

      setStats({
        totalStudents: total,
        regularStudents: regular,
        tuitionStudents: tuition,
        totalFees: totalExpectedFees,
        paidFees: paidFees,
        unpaidFees: unpaidFees,
        feePercentage: feePercentage
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
      <h2 style={{ marginBottom: '30px', color: '#1e293b', fontWeight: '700' }}>Dashboard Overview</h2>
      
      {/* Student Statistics */}
      <div className="dashboard-section">
        <h3 className="section-title">Student Statistics</h3>
        <div className="stats-grid-dashboard">
          <div className="stat-card-flat">
            <div className="stat-number">{stats.totalStudents}</div>
            <div className="stat-label">Total Students</div>
          </div>
          <div className="stat-card-flat">
            <div className="stat-number">{stats.regularStudents}</div>
            <div className="stat-label">Regular Students</div>
          </div>
          <div className="stat-card-flat">
            <div className="stat-number">{stats.tuitionStudents}</div>
            <div className="stat-label">Tuition Students</div>
          </div>
        </div>
      </div>

      {/* Fee Collection Progress */}
      <div className="dashboard-section">
        <h3 className="section-title">Fee Collection Progress</h3>
        <div className="fee-progress-container">
          <div className="circular-progress-wrapper">
            <svg className="circular-progress" viewBox="0 0 200 200">
              <circle
                className="circular-progress-bg"
                cx="100"
                cy="100"
                r="85"
              />
              <circle
                className="circular-progress-fill"
                cx="100"
                cy="100"
                r="85"
                style={{
                  strokeDasharray: `${2 * Math.PI * 85}`,
                  strokeDashoffset: `${2 * Math.PI * 85 * (1 - stats.feePercentage / 100)}`
                }}
              />
              <text x="100" y="95" className="progress-percentage">
                {stats.feePercentage.toFixed(1)}%
              </text>
              <text x="100" y="115" className="progress-label">
                Collected
              </text>
            </svg>
          </div>
          <div className="fee-details">
            <div className="fee-item">
              <span className="fee-label">Total Expected:</span>
              <span className="fee-value">₹{stats.totalFees.toLocaleString()}</span>
            </div>
            <div className="fee-item">
              <span className="fee-label">Fees Paid:</span>
              <span className="fee-value fee-paid">₹{stats.paidFees.toLocaleString()}</span>
            </div>
            <div className="fee-item">
              <span className="fee-label">Fees Pending:</span>
              <span className="fee-value fee-unpaid">₹{stats.unpaidFees.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Members */}
      <div className="dashboard-section">
        <h3 className="section-title">Staff Members</h3>
        {staffList.length > 0 ? (
          <div className="staff-list">
            {staffList.map((staff, index) => (
              <div key={index} className="staff-item">
                <div className="staff-name">{staff.name}</div>
                <div className="staff-position">
                  {staff.position || staff.post || 'Staff Member'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-data">No staff members added yet</div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
