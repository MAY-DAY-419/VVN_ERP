import React, { useState, useEffect } from 'react'
import { supabase, supabaseReady } from '../supabaseClient'

function Expenses() {
  const [expenses, setExpenses] = useState([])
  const [filteredExpenses, setFilteredExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  
  const [formData, setFormData] = useState({
    expenseDate: new Date().toISOString().split('T')[0],
    expenseCategory: '',
    expenseDescription: '',
    amount: '',
    paymentMode: '',
    paidTo: '',
    remarks: ''
  })

  const expenseCategories = [
    'Salary', 'Stationary', 'Electricity', 'Water', 'Maintenance',
    'Transport', 'Food', 'Medical', 'Event', 'Equipment',
    'Books', 'Furniture', 'Repairs', 'Internet', 'Marketing',
    'Other'
  ]

  const paymentModes = ['Cash', 'Online', 'Cheque', 'UPI']

  useEffect(() => {
    loadExpenses()
  }, [])

  const loadExpenses = async () => {
    try {
      if (!supabaseReady) {
        console.error('Supabase not configured')
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('expenseDate', { ascending: false })

      if (error) throw error

      setExpenses(data || [])
      setFilteredExpenses(data || [])
      setLoading(false)
    } catch (error) {
      console.error('Error loading expenses:', error)
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase()
    setSearchTerm(term)

    const filtered = expenses.filter(expense =>
      (expense.expenseCategory && expense.expenseCategory.toLowerCase().includes(term)) ||
      (expense.expenseDescription && expense.expenseDescription.toLowerCase().includes(term)) ||
      (expense.paidTo && expense.paidTo.toLowerCase().includes(term))
    )

    setFilteredExpenses(filtered)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (!supabaseReady) {
        setMessage({ type: 'error', text: '❌ Supabase not configured' })
        setTimeout(() => setMessage(null), 3000)
        return
      }

      const dataToSubmit = {
        ...formData,
        amount: formData.amount ? parseFloat(formData.amount) : null
      }

      const { data, error } = await supabase
        .from('expenses')
        .insert([dataToSubmit])

      if (error) throw error

      setMessage({ type: 'success', text: '✅ Expense added successfully!' })
      setShowForm(false)
      
      // Reset form
      setFormData({
        expenseDate: new Date().toISOString().split('T')[0],
        expenseCategory: '',
        expenseDescription: '',
        amount: '',
        paymentMode: '',
        paidTo: '',
        remarks: ''
      })

      // Reload expenses
      await loadExpenses()
      
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      setMessage({ type: 'error', text: '❌ Error: ' + error.message })
      setTimeout(() => setMessage(null), 5000)
    }
  }

  const calculateTotalExpenses = () => {
    return filteredExpenses.reduce((total, expense) => total + parseFloat(expense.amount || 0), 0)
  }

  const getCategoryTotal = (category) => {
    return expenses
      .filter(e => e.expenseCategory === category)
      .reduce((total, expense) => total + parseFloat(expense.amount || 0), 0)
  }

  if (loading) {
    return <div className="loading">Loading expenses...</div>
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#333' }}>💰 Expenses Management</h2>
        <button 
          className="btn" 
          onClick={() => setShowForm(!showForm)}
          style={{ maxWidth: '200px' }}
        >
          {showForm ? '❌ Cancel' : '➕ Add Expense'}
        </button>
      </div>

      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Add Expense Form */}
      {showForm && (
        <div className="form-section" style={{ marginBottom: '30px' }}>
          <h3>Add New Expense</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Expense Date *</label>
                <input
                  type="date"
                  name="expenseDate"
                  value={formData.expenseDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Category *</label>
                <select
                  name="expenseCategory"
                  value={formData.expenseCategory}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Category</option>
                  {expenseCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea
                name="expenseDescription"
                value={formData.expenseDescription}
                onChange={handleChange}
                placeholder="Enter expense description"
                required
                rows="2"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Amount (₹) *</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  placeholder="Enter amount"
                  required
                />
              </div>
              <div className="form-group">
                <label>Payment Mode *</label>
                <select
                  name="paymentMode"
                  value={formData.paymentMode}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Mode</option>
                  {paymentModes.map(mode => (
                    <option key={mode} value={mode}>{mode}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Paid To</label>
                <input
                  type="text"
                  name="paidTo"
                  value={formData.paidTo}
                  onChange={handleChange}
                  placeholder="Vendor/Person name"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Remarks</label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                placeholder="Additional notes (optional)"
                rows="2"
              />
            </div>

            <button type="submit" className="btn">Add Expense</button>
          </form>
        </div>
      )}

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: '#e3f2fd', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>Total Expenses</h4>
          <p style={{ fontSize: '2em', fontWeight: 'bold', margin: 0, color: '#0d47a1' }}>
            ₹{calculateTotalExpenses().toLocaleString()}
          </p>
        </div>
        <div style={{ background: '#fff3e0', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#f57c00' }}>Total Entries</h4>
          <p style={{ fontSize: '2em', fontWeight: 'bold', margin: 0, color: '#e65100' }}>
            {filteredExpenses.length}
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="🔍 Search by category, description, or paid to..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      {/* Expenses Table */}
      {filteredExpenses.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          {searchTerm ? 'No expenses found matching your search.' : 'No expenses recorded yet.'}
        </p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="students-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th>Amount (₹)</th>
                <th>Payment Mode</th>
                <th>Paid To</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map(expense => (
                <tr key={expense.id}>
                  <td>{new Date(expense.expenseDate).toLocaleDateString()}</td>
                  <td>
                    <span className="badge" style={{ 
                      backgroundColor: expense.expenseCategory === 'Salary' ? '#e3f2fd' : 
                                       expense.expenseCategory === 'Maintenance' ? '#fff3e0' : 
                                       expense.expenseCategory === 'Event' ? '#f3e5f5' : '#e8f5e9',
                      color: '#333'
                    }}>
                      {expense.expenseCategory}
                    </span>
                  </td>
                  <td>{expense.expenseDescription}</td>
                  <td><strong>₹{parseFloat(expense.amount).toLocaleString()}</strong></td>
                  <td>{expense.paymentMode}</td>
                  <td>{expense.paidTo || '—'}</td>
                  <td>{expense.remarks || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Category-wise Summary */}
      {expenses.length > 0 && (
        <div style={{ marginTop: '40px' }}>
          <h3 style={{ marginBottom: '20px' }}>📊 Category-wise Breakdown</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            {expenseCategories.map(category => {
              const total = getCategoryTotal(category)
              if (total > 0) {
                return (
                  <div key={category} style={{ 
                    background: '#f5f5f5', 
                    padding: '15px', 
                    borderRadius: '8px',
                    border: '1px solid #ddd'
                  }}>
                    <div style={{ fontSize: '0.9em', color: '#666', marginBottom: '5px' }}>
                      {category}
                    </div>
                    <div style={{ fontSize: '1.3em', fontWeight: 'bold', color: '#333' }}>
                      ₹{total.toLocaleString()}
                    </div>
                  </div>
                )
              }
              return null
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default Expenses
