import React, { useEffect, useState } from 'react'
import { supabase, supabaseReady } from '../supabaseClient'

function PaymentHistory() {
  const [transactions, setTransactions] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all') // all | Fee | Expense | Salary | Other
  const [period, setPeriod] = useState('all') // all | month | year

  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = async () => {
    try {
      if (!supabaseReady) {
        console.error('Supabase not configured')
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('transactionDate', { ascending: false })

      if (error) throw error

      setTransactions(data || [])
      applyFilters(data || [], typeFilter, searchTerm, period)
      setLoading(false)
    } catch (err) {
      console.error('Error loading transactions:', err)
      setLoading(false)
      setMessage({ type: 'error', text: '❌ ' + err.message })
      setTimeout(() => setMessage(null), 4000)
    }
  }

  const applyFilters = (list, type, term, periodSel) => {
    let result = [...list]

    if (type !== 'all') {
      result = result.filter(t => t.transactionType === type)
    }

    if (term) {
      const q = term.toLowerCase()
      result = result.filter(t => (
        (t.description || '').toLowerCase().includes(q) ||
        (t.reference || '').toLowerCase().includes(q) ||
        (String(t.studentId || '')).includes(q) ||
        (String(t.expenseId || '')).includes(q)
      ))
    }

    const now = new Date()
    if (periodSel === 'month') {
      const y = now.getFullYear()
      const m = now.getMonth()
      result = result.filter(t => {
        const d = new Date(t.transactionDate)
        return d.getFullYear() === y && d.getMonth() === m
      })
    } else if (periodSel === 'year') {
      const y = now.getFullYear()
      result = result.filter(t => (new Date(t.transactionDate)).getFullYear() === y)
    }

    setFiltered(result)
  }

  const handleSearch = (e) => {
    const term = e.target.value
    setSearchTerm(term)
    applyFilters(transactions, typeFilter, term, period)
  }

  const totals = {
    fees: filtered.filter(t => t.transactionType === 'Fee').reduce((s, t) => s + Number(t.amount || 0), 0),
    expenses: filtered.filter(t => t.transactionType === 'Expense').reduce((s, t) => s + Number(t.amount || 0), 0),
    salary: filtered.filter(t => t.transactionType === 'Salary').reduce((s, t) => s + Number(t.amount || 0), 0),
    all: filtered.reduce((s, t) => s + Number(t.amount || 0), 0)
  }

  if (loading) return <div className="loading">Loading history...</div>

  return (
    <div className="container">
      <h2 style={{ marginBottom: '20px', color: '#333' }}>📜 Payment History</h2>

      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
        <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); applyFilters(transactions, e.target.value, searchTerm, period) }}>
          <option value="all">All Types</option>
          <option value="Fee">Fee</option>
          <option value="Expense">Expense</option>
          <option value="Salary">Salary</option>
          <option value="Other">Other</option>
        </select>
        <select value={period} onChange={(e) => { setPeriod(e.target.value); applyFilters(transactions, typeFilter, searchTerm, e.target.value) }}>
          <option value="all">All Time</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
        <input type="text" placeholder="🔍 Search description/reference" value={searchTerm} onChange={handleSearch} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        <div style={{ background: '#e3f2fd', padding: '12px', borderRadius: '8px' }}>
          <div style={{ color: '#1976d2' }}>Fees</div>
          <div style={{ fontWeight: 'bold' }}>₹{totals.fees.toLocaleString()}</div>
        </div>
        <div style={{ background: '#fff3e0', padding: '12px', borderRadius: '8px' }}>
          <div style={{ color: '#f57c00' }}>Expenses</div>
          <div style={{ fontWeight: 'bold' }}>₹{totals.expenses.toLocaleString()}</div>
        </div>
        <div style={{ background: '#f3e5f5', padding: '12px', borderRadius: '8px' }}>
          <div style={{ color: '#7b1fa2' }}>Salary</div>
          <div style={{ fontWeight: 'bold' }}>₹{totals.salary.toLocaleString()}</div>
        </div>
        <div style={{ background: '#e8f5e9', padding: '12px', borderRadius: '8px' }}>
          <div style={{ color: '#2e7d32' }}>Total</div>
          <div style={{ fontWeight: 'bold' }}>₹{totals.all.toLocaleString()}</div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '30px', color: '#666' }}>No transactions found.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="students-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Mode</th>
                <th>Description</th>
                <th>Reference</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(tx => (
                <tr key={tx.id}>
                  <td>{new Date(tx.transactionDate).toLocaleDateString()}</td>
                  <td>{tx.transactionType}</td>
                  <td>₹{Number(tx.amount || 0).toLocaleString()}</td>
                  <td>{tx.paymentMode || '—'}</td>
                  <td>{tx.description || '—'}</td>
                  <td>{tx.reference || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default PaymentHistory
