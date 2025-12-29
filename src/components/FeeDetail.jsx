import React, { useEffect, useState } from 'react'
import { supabase, supabaseReady } from '../supabaseClient'

function FeeDetail() {
  const [students, setStudents] = useState([])
  const [filteredStudents, setFilteredStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('pending') // 'pending' or 'completed'
  const [timePeriod, setTimePeriod] = useState('monthly') // 'monthly' or 'yearly'
  const [showFeeModal, setShowFeeModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [feeAmount, setFeeAmount] = useState('')
  const [message, setMessage] = useState(null)

  useEffect(() => {
    loadStudents()
  }, [])

  const loadStudents = async () => {
    try {
      if (!supabaseReady) {
        console.error('Supabase not configured.')
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('fullname', { ascending: true })

      if (error) throw error

      // Process students to calculate remaining fees
      const processedStudents = data.map(student => {
        const totalFees = student.totalfees || 0
        const feesPaid = student.feespaid || 0
        const feesRemaining = totalFees - feesPaid
        const isCompleted = feesRemaining <= 0

        return {
          ...student,
          feesRemaining: Math.max(0, feesRemaining),
          isCompleted: isCompleted
        }
      })

      setStudents(processedStudents)
      filterStudents(processedStudents, activeTab, '')
      setLoading(false)
    } catch (error) {
      console.error('Error loading students:', error)
      setLoading(false)
    }
  }

  const filterStudents = (studentList, tab, searchText) => {
    let filtered = studentList

    // Filter by completion status
    if (tab === 'pending') {
      filtered = filtered.filter(s => !s.isCompleted)
    } else {
      filtered = filtered.filter(s => s.isCompleted)
    }

    // Filter by search term
    if (searchText) {
      const term = searchText.toLowerCase()
      filtered = filtered.filter(s =>
        s.fullname.toLowerCase().includes(term) ||
        s.rollnumber.toLowerCase().includes(term) ||
        (s.fathername && s.fathername.toLowerCase().includes(term))
      )
    }

    setFilteredStudents(filtered)
  }

  const handleSearch = (e) => {
    const term = e.target.value
    setSearchTerm(term)
    filterStudents(students, activeTab, term)
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    filterStudents(students, tab, searchTerm)
  }

  const calculateSummary = () => {
    const totalFeesToCollect = students.reduce((sum, s) => sum + (s.totalfees || 0), 0)
    const totalFeesPaid = students.reduce((sum, s) => sum + (s.feespaid || 0), 0)
    const totalFeesPending = totalFeesToCollect - totalFeesPaid

    return {
      totalFeesToCollect,
      totalFeesPaid,
      totalFeesPending
    }
  }

  const openFeeModal = (student) => {
    setSelectedStudent(student)
    setFeeAmount('')
    setShowFeeModal(true)
  }

  const closeFeeModal = () => {
    setShowFeeModal(false)
    setSelectedStudent(null)
    setFeeAmount('')
  }

  const handleFeeReceived = async (e) => {
    e.preventDefault()

    try {
      if (!feeAmount || isNaN(feeAmount) || parseFloat(feeAmount) <= 0) {
        setMessage({ type: 'error', text: '❌ Please enter a valid amount' })
        setTimeout(() => setMessage(null), 3000)
        return
      }

      const amountReceived = parseFloat(feeAmount)
      const newFeesPaid = (selectedStudent.feespaid || 0) + amountReceived
      const maxFees = selectedStudent.totalfees || 0

      // Don't allow fees paid to exceed total fees
      if (newFeesPaid > maxFees) {
        setMessage({ type: 'error', text: `❌ Amount exceeds total fees. Remaining: ₹${selectedStudent.feesRemaining}` })
        setTimeout(() => setMessage(null), 3000)
        return
      }

      // Update student record
      const { error } = await supabase
        .from('students')
        .update({ feespaid: newFeesPaid })
        .eq('id', selectedStudent.id)

      if (error) throw error

      setMessage({ type: 'success', text: `🎉 Fees updated successfully! Amount received: ₹${amountReceived}` })
      setTimeout(() => setMessage(null), 3000)

      // Reload students
      closeFeeModal()
      loadStudents()
    } catch (error) {
      setMessage({ type: 'error', text: '❌ Error: ' + error.message })
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const summary = calculateSummary()

  if (loading) {
    return <div className="loading">Loading fee details...</div>
  }

  return (
    <div className="container">
      <h2 style={{ marginBottom: '30px', color: '#333' }}>💳 Fees Detail</h2>

      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: '#e3f2fd', padding: '20px', borderRadius: '8px', border: '2px solid #1976d2' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#1565c0' }}>📊 Total to Collect</h4>
          <p style={{ margin: 0, fontSize: '1.8em', fontWeight: 'bold', color: '#0d47a1' }}>
            ₹{summary.totalFeesToCollect.toLocaleString()}
          </p>
        </div>
        <div style={{ background: '#e8f5e9', padding: '20px', borderRadius: '8px', border: '2px solid #388e3c' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#2e7d32' }}>✅ Fees Received</h4>
          <p style={{ margin: 0, fontSize: '1.8em', fontWeight: 'bold', color: '#1b5e20' }}>
            ₹{summary.totalFeesPaid.toLocaleString()}
          </p>
        </div>
        <div style={{ background: '#fff3e0', padding: '20px', borderRadius: '8px', border: '2px solid #f57c00' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#e65100' }}>⏳ Fees Pending</h4>
          <p style={{ margin: 0, fontSize: '1.8em', fontWeight: 'bold', color: '#bf360c' }}>
            ₹{summary.totalFeesPending.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Time Period Toggle */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button
          onClick={() => setTimePeriod('monthly')}
          style={{
            padding: '8px 16px',
            backgroundColor: timePeriod === 'monthly' ? '#1976d2' : '#e0e0e0',
            color: timePeriod === 'monthly' ? 'white' : '#333',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          📅 Monthly
        </button>
        <button
          onClick={() => setTimePeriod('yearly')}
          style={{
            padding: '8px 16px',
            backgroundColor: timePeriod === 'yearly' ? '#1976d2' : '#e0e0e0',
            color: timePeriod === 'yearly' ? 'white' : '#333',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          📆 Yearly
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #ddd' }}>
        <button
          onClick={() => handleTabChange('pending')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'pending' ? '#ff9800' : 'transparent',
            color: activeTab === 'pending' ? 'white' : '#333',
            border: 'none',
            borderBottom: activeTab === 'pending' ? '3px solid #f57c00' : 'none',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '1em'
          }}
        >
          ⏳ Fees Pending ({students.filter(s => !s.isCompleted).length})
        </button>
        <button
          onClick={() => handleTabChange('completed')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'completed' ? '#4caf50' : 'transparent',
            color: activeTab === 'completed' ? 'white' : '#333',
            border: 'none',
            borderBottom: activeTab === 'completed' ? '3px solid #388e3c' : 'none',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '1em'
          }}
        >
          ✅ Fees Completed ({students.filter(s => s.isCompleted).length})
        </button>
      </div>

      {/* Search Bar */}
      <div className="search-bar" style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="🔍 Search by name, roll number, or parent name..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      {/* Students Table */}
      {filteredStudents.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          {activeTab === 'pending' ? 'All fees have been collected!' : 'No students with pending fees.'}
        </p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="students-table">
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Name</th>
                <th>Class</th>
                <th>Guardian</th>
                <th>Total Fees</th>
                <th>Fees Paid</th>
                <th>Fees Remaining</th>
                <th>Payment %</th>
                {activeTab === 'pending' && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => {
                const paymentPercent = student.totalfees > 0
                  ? Math.round((student.feespaid / student.totalfees) * 100)
                  : 0

                return (
                  <tr key={student.id}>
                    <td>{student.rollnumber}</td>
                    <td>{student.fullname}</td>
                    <td>{student.class}</td>
                    <td>{student.fathername || student.mothername || '—'}</td>
                    <td>₹{(student.totalfees || 0).toLocaleString()}</td>
                    <td style={{ color: '#4caf50', fontWeight: 'bold' }}>
                      ₹{(student.feespaid || 0).toLocaleString()}
                    </td>
                    <td style={{ color: student.feesRemaining > 0 ? '#f57c00' : '#4caf50', fontWeight: 'bold' }}>
                      ₹{student.feesRemaining.toLocaleString()}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <div style={{
                          width: '100%',
                          height: '20px',
                          backgroundColor: '#e0e0e0',
                          borderRadius: '10px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${paymentPercent}%`,
                            height: '100%',
                            backgroundColor: paymentPercent === 100 ? '#4caf50' : '#ff9800',
                            transition: 'width 0.3s ease'
                          }} />
                        </div>
                        <span style={{ minWidth: '40px', fontWeight: 'bold' }}>{paymentPercent}%</span>
                      </div>
                    </td>
                    {activeTab === 'pending' && (
                      <td>
                        <button
                          onClick={() => openFeeModal(student)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#4caf50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '0.9em'
                          }}
                        >
                          💰 Received
                        </button>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Fee Modal */}
      {showFeeModal && selectedStudent && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ marginTop: 0, color: '#333' }}>💳 Record Fee Payment</h3>

            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
              <p style={{ margin: '5px 0' }}>
                <strong>Student:</strong> {selectedStudent.fullname}
              </p>
              <p style={{ margin: '5px 0' }}>
                <strong>Roll No:</strong> {selectedStudent.rollnumber}
              </p>
              <p style={{ margin: '5px 0' }}>
                <strong>Total Fees:</strong> ₹{(selectedStudent.totalfees || 0).toLocaleString()}
              </p>
              <p style={{ margin: '5px 0' }}>
                <strong>Already Paid:</strong> ₹{(selectedStudent.feespaid || 0).toLocaleString()}
              </p>
              <p style={{ margin: '5px 0', color: '#f57c00', fontWeight: 'bold' }}>
                <strong>Remaining:</strong> ₹{selectedStudent.feesRemaining.toLocaleString()}
              </p>
            </div>

            <form onSubmit={handleFeeReceived}>
              <div className="form-group">
                <label>Amount Received (₹) *</label>
                <input
                  type="number"
                  value={feeAmount}
                  onChange={(e) => setFeeAmount(e.target.value)}
                  min="1"
                  max={selectedStudent.feesRemaining}
                  step="1"
                  placeholder={`Enter amount (Max: ₹${selectedStudent.feesRemaining})`}
                  required
                />
                <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
                  Maximum amount you can receive: ₹{selectedStudent.feesRemaining}
                </small>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: '#4caf50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  ✅ Confirm Payment
                </button>
                <button
                  type="button"
                  onClick={closeFeeModal}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  ❌ Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <p style={{ marginTop: '30px', textAlign: 'center', color: '#666', fontSize: '0.9em' }}>
        Total Students: {students.length} | Pending: {students.filter(s => !s.isCompleted).length} | Completed: {students.filter(s => s.isCompleted).length}
      </p>
    </div>
  )
}

export default FeeDetail
