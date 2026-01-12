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
        .order('id', { ascending: false })

      if (error) throw error

      // Use feesPaid to compute remaining and completion
      const processedStudents = data.map(student => {
        const totalFees = Number(student.totalfees || 0)
        const feesPaid = Number(student.feespaid || 0)
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
      filtered = filtered.filter(s => {
        const name = (s.studentfullname || s.fullname || '').toLowerCase()
        const father = (s.fathername || '').toLowerCase()
        return name.includes(term) || father.includes(term)
      })
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
    const totalFeesToCollect = students.reduce((sum, s) => sum + Number(s.totalfees || 0), 0)
    const totalFeesPaid = students.reduce((sum, s) => sum + Number(s.feespaid || 0), 0)
    const totalFeesPending = Math.max(0, totalFeesToCollect - totalFeesPaid)

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
      if (!supabaseReady) {
        setMessage({ type: 'error', text: '❌ Supabase not configured' })
        setTimeout(() => setMessage(null), 3000)
        return
      }

      const amount = Number(feeAmount || 0)
      if (isNaN(amount) || amount <= 0) {
        setMessage({ type: 'error', text: '❌ Enter a valid amount' })
        setTimeout(() => setMessage(null), 3000)
        return
      }

      const currentPaid = Number(selectedStudent.feespaid || 0)
      const total = Number(selectedStudent.totalfees || 0)
      const newPaid = Math.min(total, currentPaid + amount)

      const { error } = await supabase
        .from('students')
        .update({ feespaid: newPaid })
        .eq('id', selectedStudent.id)

      if (error) throw error

      // Log transaction in history
      const tx = {
        transactionDate: new Date().toISOString().split('T')[0],
        transactionType: 'Fee',
        amount: amount,
        paymentMode: null,
        description: `Fees received for ${selectedStudent.studentfullname || selectedStudent.fullname}`,
        reference: `StudentID:${selectedStudent.id}`,
        studentId: selectedStudent.id
      }
      const { error: txErr } = await supabase.from('transactions').insert([tx])
      if (txErr) console.warn('Transaction log error:', txErr.message)

      setMessage({ type: 'success', text: '✅ Fees updated successfully' })
      setTimeout(() => setMessage(null), 3000)
      closeFeeModal()
      loadStudents()
    } catch (err) {
      setMessage({ type: 'error', text: '❌ Error: ' + err.message })
      setTimeout(() => setMessage(null), 4000)
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
                <th>Paid</th>
                <th>Remaining</th>
                <th>Progress</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => {
                return (
                  <tr key={student.id}>
                    <td>{student.rollnumber || '—'}</td>
                    <td>{student.fullname}</td>
                    <td>{student.class}</td>
                    <td>{student.fathername || student.mothername || '—'}</td>
                    <td>₹{Number(student.totalfees || 0).toLocaleString()}</td>
                    <td>₹{Number(student.feespaid || 0).toLocaleString()}</td>
                    <td style={{ color: student.feesRemaining > 0 ? '#f57c00' : '#4caf50', fontWeight: 'bold' }}>
                      ₹{Number(student.feesRemaining || 0).toLocaleString()}
                    </td>
                    <td>
                      {(() => {
                        const total = Number(student.totalfees || 0)
                        const paid = Number(student.feespaid || 0)
                        const pct = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0
                        return <span style={{ fontWeight: 'bold', color: pct >= 100 ? '#2e7d32' : '#1976d2' }}>{pct}%</span>
                      })()}
                    </td>
                    <td>
                      {(() => {
                        const total = Number(student.totalfees || 0)
                        const paid = Number(student.feespaid || 0)
                        const isComplete = paid >= total && total > 0
                        
                        if (isComplete) {
                          return <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>✅ Complete</span>
                        }
                        
                        return (
                          <button
                            onClick={() => openFeeModal(student)}
                            style={{ padding: '6px 12px', backgroundColor: '#1976d2', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                          >
                            Fill Fees
                          </button>
                        )
                      })()}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <p style={{ marginTop: '30px', textAlign: 'center', color: '#666', fontSize: '0.9em' }}>
        Total Students: {students.length} | Pending: {students.filter(s => !s.isCompleted).length} | Completed: {students.filter(s => s.isCompleted).length}
      </p>

      {showFeeModal && selectedStudent && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '90%', maxWidth: '420px' }}>
            <h3 style={{ marginTop: 0 }}>💳 Fill Fees</h3>
            <p style={{ color: '#555' }}>
              {selectedStudent.studentfullname || selectedStudent.fullname} — Total: ₹{Number(selectedStudent.totalfees || 0).toLocaleString()} — Paid: ₹{Number(selectedStudent.feespaid || 0).toLocaleString()}
            </p>
            <form onSubmit={handleFeeReceived}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '6px' }}>Amount (₹)</label>
                <input type="number" min="1" step="1" value={feeAmount} onChange={(e) => setFeeAmount(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={closeFeeModal} style={{ flex: 1, padding: '10px', background: '#757575', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '10px', background: '#1976d2', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default FeeDetail
