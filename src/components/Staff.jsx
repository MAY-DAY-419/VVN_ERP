import React, { useEffect, useState } from 'react'
import { supabase, supabaseReady } from '../supabaseClient'

function Staff() {
  const [staffMembers, setStaffMembers] = useState([])
  const [filteredStaff, setFilteredStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [message, setMessage] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    post: '',
    department: '',
    joindate: '',
    dob: '',
    salary: '',
    address: '',
    qualification: ''
  })

  useEffect(() => {
    loadStaffMembers()
  }, [])

  const loadStaffMembers = async () => {
    try {
      setLoading(true)
      
      if (!supabaseReady) {
        console.error('Supabase not configured.')
        setMessage({ type: 'error', text: '❌ Supabase not configured' })
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .order('name', { ascending: true })

      if (error) {
        throw error
      }

      setStaffMembers(data || [])
      setFilteredStaff(data || [])
      setMessage(null)
    } catch (error) {
      console.error('Error loading staff:', error)
      setMessage({ type: 'error', text: '❌ Error loading staff: ' + error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase()
    setSearchTerm(term)

    const filtered = staffMembers.filter(staff =>
      staff.name.toLowerCase().includes(term) ||
      (staff.position && staff.position.toLowerCase().includes(term)) ||
      (staff.post && staff.post.toLowerCase().includes(term)) ||
      (staff.department && staff.department.toLowerCase().includes(term)) ||
      (staff.email && staff.email.toLowerCase().includes(term))
    )

    setFilteredStaff(filtered)
  }

  const openAddModal = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      position: '',
      post: '',
      department: '',
      joindate: '',
      dob: '',
      salary: '',
      address: '',
      qualification: ''
    })
    setShowAddModal(true)
    setMessage(null)
  }

  const closeAddModal = () => {
    setShowAddModal(false)
    setFormData({
      name: '',
      email: '',
      phone: '',
      position: '',
      post: '',
      department: '',
      joindate: '',
      dob: '',
      salary: '',
      address: '',
      qualification: ''
    })
    setMessage(null)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setIsSubmitting(true)

      if (!supabaseReady) {
        setMessage({ type: 'error', text: '❌ Supabase not configured' })
        setIsSubmitting(false)
        return
      }

      // Validation
      if (!formData.name.trim()) {
        setMessage({ type: 'error', text: '❌ Name is required' })
        setIsSubmitting(false)
        return
      }

      if (!formData.position.trim()) {
        setMessage({ type: 'error', text: '❌ Position is required' })
        setIsSubmitting(false)
        return
      }

      if (!formData.post.trim()) {
        setMessage({ type: 'error', text: '❌ Post is required' })
        setIsSubmitting(false)
        return
      }

      if (!formData.department.trim()) {
        setMessage({ type: 'error', text: '❌ Department is required' })
        setIsSubmitting(false)
        return
      }

      // Prepare data
      const dataToSubmit = {
        name: formData.name.trim(),
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        position: formData.position.trim(),
        post: formData.post.trim(),
        department: formData.department.trim(),
        joindate: formData.joindate || null,
        dob: formData.dob || null,
        salary: formData.salary ? parseFloat(formData.salary) : null,
        address: formData.address.trim() || null,
        qualification: formData.qualification.trim() || null
      }

      const { data, error } = await supabase
        .from('staff')
        .insert([dataToSubmit])
        .select()

      if (error) {
        throw error
      }

      setMessage({ type: 'success', text: '🎉 Staff member added successfully!' })
      
      setTimeout(() => {
        closeAddModal()
        loadStaffMembers()
      }, 1500)
    } catch (error) {
      console.error('Error adding staff:', error)
      setMessage({ type: 'error', text: '❌ Error: ' + error.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getPostColor = (post) => {
    const colors = {
      'Teacher': '#e3f2fd',
      'Principal': '#f3e5f5',
      'Peon': '#e8f5e9',
      'Accountant': '#fff3e0',
      'Librarian': '#fce4ec',
      'Support Staff': '#e0f2f1'
    }
    return colors[post] || '#f5f5f5'
  }

  const getPostTextColor = (post) => {
    const colors = {
      'Teacher': '#1565c0',
      'Principal': '#6a1b9a',
      'Peon': '#2e7d32',
      'Accountant': '#e65100',
      'Librarian': '#c2185b',
      'Support Staff': '#00695c'
    }
    return colors[post] || '#333'
  }

  if (loading) {
    return <div className="loading">📂 Loading staff information...</div>
  }

  return (
    <div className="container">
      <h2 style={{ marginBottom: '30px', color: '#333' }}>👨‍💼 Staff Management</h2>

      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ flex: 1, margin: 0, minWidth: '200px' }}>
          <input
            type="text"
            placeholder="🔍 Search by name, position, post, or email..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <button
          onClick={openAddModal}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '0.95em',
            whiteSpace: 'nowrap'
          }}
        >
          ➕ Add New Staff
        </button>
      </div>

      {filteredStaff.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          {searchTerm ? '🔍 No staff members found matching your search.' : '📭 No staff members added yet.'}
        </p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="students-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>DOB</th>
                <th>Position</th>
                <th>Post</th>
                <th>Department</th>
                <th>Salary</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Join Date</th>
                <th>Qualification</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map(staff => (
                <tr key={staff.id}>
                  <td style={{ fontWeight: 'bold' }}>{staff.name}</td>
                  <td>{staff.dob ? new Date(staff.dob).toLocaleDateString('en-IN') : '—'}</td>
                  <td>
                    <span style={{
                      backgroundColor: '#e3f2fd',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      color: '#1565c0',
                      fontWeight: '500'
                    }}>
                      {staff.position}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      backgroundColor: getPostColor(staff.post),
                      padding: '4px 8px',
                      borderRadius: '4px',
                      color: getPostTextColor(staff.post),
                      fontWeight: '500'
                    }}>
                      {staff.post}
                    </span>
                  </td>
                  <td>{staff.department}</td>
                  <td style={{ fontWeight: 'bold', color: '#2e7d32' }}>
                    {staff.salary ? `₹${(staff.salary || 0).toLocaleString()}` : '—'}
                  </td>
                  <td style={{ fontSize: '0.9em' }}>{staff.email || '—'}</td>
                  <td>{staff.phone || '—'}</td>
                  <td>{staff.joindate ? new Date(staff.joindate).toLocaleDateString('en-IN') : '—'}</td>
                  <td style={{ fontSize: '0.9em' }}>{staff.qualification || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p style={{ marginTop: '20px', textAlign: 'center', color: '#666' }}>
        Total Staff: {filteredStaff.length} member{filteredStaff.length !== 1 ? 's' : ''}
      </p>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'center',
          zIndex: 10000,
          padding: '20px',
          overflowY: 'auto',
          paddingTop: '200px'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '40px',
            borderRadius: '12px',
            maxWidth: '700px',
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
            marginBottom: '100px'
          }}>
            <h3 style={{ marginTop: 0, color: '#333', marginBottom: '25px' }}>➕ Add New Staff Member</h3>

            {message && (
              <div className={`alert alert-${message.type}`} style={{ marginBottom: '20px' }}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter staff name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Position *</label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    placeholder="e.g., Senior Teacher, Junior Teacher, etc."
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Post *</label>
                  <select
                    name="post"
                    value={formData.post}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Post</option>
                    <option value="Teacher">Teacher</option>
                    <option value="Principal">Principal</option>
                    <option value="Peon">Peon</option>
                    <option value="Accountant">Accountant</option>
                    <option value="Librarian">Librarian</option>
                    <option value="Support Staff">Support Staff</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Department *</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="e.g., English, Mathematics, Admin, etc."
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Salary (₹)</label>
                  <input
                    type="number"
                    name="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    placeholder="Enter monthly salary"
                    min="0"
                    step="100"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    pattern="[0-9]{10}"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Join Date</label>
                  <input
                    type="date"
                    name="joindate"
                    value={formData.joindate}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Qualification</label>
                  <input
                    type="text"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    placeholder="e.g., B.A., M.Sc., B.Ed., etc."
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter complete address"
                  rows="3"
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    flex: 1,
                    padding: '14px',
                    backgroundColor: isSubmitting ? '#ccc' : '#4caf50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    fontSize: '1.05em',
                    transition: 'background-color 0.3s'
                  }}
                >
                  {isSubmitting ? '⏳ Adding...' : '✅ Add Staff Member'}
                </button>
                <button
                  type="button"
                  onClick={closeAddModal}
                  disabled={isSubmitting}
                  style={{
                    flex: 1,
                    padding: '14px',
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    fontSize: '1.05em',
                    opacity: isSubmitting ? 0.6 : 1,
                    transition: 'opacity 0.3s'
                  }}
                >
                  ❌ Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Staff
