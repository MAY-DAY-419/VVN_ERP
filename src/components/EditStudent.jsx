import React, { useEffect, useState } from 'react'
import { supabase, supabaseReady } from '../supabaseClient'

const villages = [
  'Konhar', 'Dhanoli', 'Parrawan', 'Madanpur', 'Palia', 
  'Kuthonda', 'Ajnol', 'Gata', 'Gutore', 'Taragarh', 
  'Padkoli', 'Devra', 'Harisingh Pura', 'Hirapura'
]

const classes = [
  'Nursery', 'LKG', 'UKG', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'
]

const hindiClassFees = {
  'Nursery': 8000, 'LKG': 8000, 'UKG': 8000,
  '1st': 9000, '2nd': 9000, '3rd': 9000, '4th': 9000,
  '5th': 9000, '6th': 9000, '7th': 9000, '8th': 9000
}

const englishClassFees = {
  'Nursery': 8000, 'LKG': 8000, 'UKG': 8000,
  '1st': 9000, '2nd': 9000, '3rd': 9000, '4th': 9000,
  '5th': 10000, '6th': 10000, '7th': 10000, '8th': 10000
}

function getClassFees(medium, cls) {
  if (!medium || !cls) return 0
  const table = medium === 'English' ? englishClassFees : hindiClassFees
  return table[cls] || 0
}

function EditStudent() {
  const [students, setStudents] = useState([])
  const [filteredStudents, setFilteredStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [message, setMessage] = useState(null)
  const [showOtherVillage, setShowOtherVillage] = useState(false)
  const [displayedFees, setDisplayedFees] = useState(null)

  const [formData, setFormData] = useState({
    fullname: '',
    rollnumber: '',
    dob: '',
    placeofbirth: '',
    gender: '',
    category: '',
    medium: '',
    class: '',
    division: '',
    fathername: '',
    mothername: '',
    parentname: '',
    contactnumber: '',
    emergencycontact: '',
    address: '',
    village: '',
    otherVillage: '',
    state: 'Madhya Pradesh',
    district: 'Bhind',
    admissiontype: '',
    admissiondate: '',
    vanapplied: '',
    vancharges: '',
    fees: 0,
    totalfees: 0,
    feewaiver: 'No',
    feewaiveramt: 0
  })

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

      setStudents(data)
      setFilteredStudents(data)
      setLoading(false)
    } catch (error) {
      console.error('Error loading students:', error)
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase()
    setSearchTerm(term)

    const filtered = students.filter(student => {
      const name = (student.studentfullname || student.fullname || '').toLowerCase()
      const roll = (student.rollnumber || '').toLowerCase()
      const father = (student.fathername || '').toLowerCase()
      return name.includes(term) || roll.includes(term) || father.includes(term)
    })

    setFilteredStudents(filtered)
  }

  const openEditModal = (student) => {
    setSelectedStudent(student)
    setFormData({
      fullname: student.studentfullname || student.fullname || '',
      rollnumber: student.rollnumber || '',
      dob: student.dob || '',
      placeofbirth: student.placeofbirth || '',
      gender: (student.gender || '').toString().toLowerCase() === 'male' ? 'Male' : (student.gender || '').toLowerCase() === 'female' ? 'Female' : '',
      category: student.category || '',
      medium: student.medium || '',
      class: student.class || '',
      division: student.division || '',
      fathername: student.fathername || '',
      mothername: student.mothername || '',
      parentname: student.parentname || '',
      contactnumber: student.fathermobile || student.contactnumber || '',
      emergencycontact: student.emergencycontact || '',
      address: student.address || '',
      village: student.village || '',
      otherVillage: '',
      state: student.state || 'Madhya Pradesh',
      district: student.district || 'Bhind',
      admissiontype: student.admissiontype || '',
      admissiondate: student.admissiondate || '',
      vanapplied: student.vanapplied || '',
      vancharges: '',
      fees: student.fees || 0,
      totalfees: student.totalfees || 0,
      feewaiver: student.feewaiver || 'No',
      feewaiveramt: student.feewaiveramt || 0
    })

    setShowOtherVillage(student.village === 'Other')
    const fees = getClassFees(student.medium, student.class)
    setDisplayedFees(fees)
    setShowEditModal(true)
  }

  const closeEditModal = () => {
    setShowEditModal(false)
    setSelectedStudent(null)
    setDisplayedFees(null)
    setShowOtherVillage(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData({
      ...formData,
      [name]: value
    })

    if (name === 'village') {
      setShowOtherVillage(value === 'Other')
    }

    if ((name === 'class' && value) || (name === 'medium' && value)) {
      const cls = name === 'class' ? value : formData.class
      const med = name === 'medium' ? value : formData.medium
      const fees = getClassFees(med, cls)
      const waiverAmt = parseFloat(formData.feewaiveramt || 0)
      const totalfees = fees - (isNaN(waiverAmt) ? 0 : waiverAmt)
      setFormData(prev => ({ ...prev, fees, totalfees }))
      setDisplayedFees(fees)
    }

    if (name === 'feewaiveramt') {
      const waiverAmt = parseFloat(value || 0)
      const baseFees = (formData.fees || 0)
      const totalfees = baseFees - (isNaN(waiverAmt) ? 0 : waiverAmt)
      setFormData(prev => ({ ...prev, feewaiveramt: waiverAmt, totalfees }))
    }

    if (name === 'feewaiver') {
      if (value !== 'Yes') {
        const baseFees = (formData.fees || 0)
        setFormData(prev => ({ ...prev, feewaiver: value, feewaiveramt: 0, totalfees: baseFees }))
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (!supabaseReady) {
        setMessage({ type: 'error', text: '❌ Supabase not configured' })
        setTimeout(() => setMessage(null), 3000)
        return
      }

      const dataToUpdate = {
        ...formData,
        village: formData.village === 'Other' ? formData.otherVillage : formData.village
      }

      delete dataToUpdate.otherVillage

      // Only send columns that exist in the students table to avoid schema errors
      const normalizeGender = (val) => {
        const map = { boy: 'Boy', male: 'Boy', m: 'Boy', girl: 'Girl', female: 'Girl', f: 'Girl' }
        return map[(val || '').toLowerCase()] || val
      }
      const normalizeCategory = (val) => {
        const map = { general: 'General', obc: 'OBC', sc: 'SC', st: 'ST' }
        return map[(val || '').toLowerCase()] || val
      }

      const allowedGender = ['Boy', 'Girl']
      const allowedCategory = ['General', 'OBC', 'SC', 'ST']

      const dbRecord = {
        studentfullname: dataToUpdate.fullname,
        dob: dataToUpdate.dob,
        class: dataToUpdate.class,
        fathername: dataToUpdate.fathername || null,
        mothername: dataToUpdate.mothername || null,
        fathermobile: dataToUpdate.contactnumber || null,
        mothermobile: dataToUpdate.mothermobile || null,
        address: dataToUpdate.address,
        village: dataToUpdate.village,
        state: dataToUpdate.state,
        district: dataToUpdate.district,
        admissiondate: dataToUpdate.admissiondate,
        totalfees: dataToUpdate.totalfees,
        feewaiver: dataToUpdate.feewaiver
      }

      // Apply safe enum updates only when provided
      const genderFinal = dataToUpdate.gender ? normalizeGender(dataToUpdate.gender) : undefined
      if (genderFinal) {
        if (!allowedGender.includes(genderFinal)) {
          throw new Error('Invalid gender. Use Boy or Girl.')
        }
        dbRecord.gender = genderFinal
      }

      const categoryFinal = dataToUpdate.category ? normalizeCategory(dataToUpdate.category) : undefined
      if (categoryFinal) {
        if (!allowedCategory.includes(categoryFinal)) {
          throw new Error('Invalid category. Use General, OBC, SC or ST.')
        }
        dbRecord.category = categoryFinal
      }

      const { error } = await supabase
        .from('students')
        .update(dbRecord)
        .eq('id', selectedStudent.id)

      if (error) {
        throw new Error(`${error.message}`)
      }

      setMessage({ type: 'success', text: '🎉 Student information updated successfully!' })
      setTimeout(() => setMessage(null), 3000)

      closeEditModal()
      loadStudents()
    } catch (error) {
      setMessage({ type: 'error', text: '❌ Error: ' + error.message })
      setTimeout(() => setMessage(null), 5000)
    }
  }

  const handleDelete = async (studentId) => {
    if (!confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
      return
    }

    try {
      if (!supabaseReady) {
        setMessage({ type: 'error', text: '❌ Supabase not configured' })
        setTimeout(() => setMessage(null), 3000)
        return
      }

      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', studentId)

      if (error) throw error

      setMessage({ type: 'success', text: '✅ Student deleted successfully!' })
      setTimeout(() => setMessage(null), 3000)
      
      closeEditModal()
      loadStudents()
    } catch (error) {
      setMessage({ type: 'error', text: '❌ Error: ' + error.message })
      setTimeout(() => setMessage(null), 5000)
    }
  }

  if (loading) {
    return <div className="loading">Loading students...</div>
  }

  return (
    <div className="container">
      <h2 style={{ marginBottom: '30px', color: '#333' }}>✏️ Edit Student</h2>

      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="search-bar" style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="🔍 Search by name, roll number, or parent name..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      {filteredStudents.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          {searchTerm ? 'No students found matching your search.' : 'No students added yet.'}
        </p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="students-table">
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Name</th>
                <th>Class/Div</th>
                <th>Guardian</th>
                <th>Contact</th>
                <th>Village</th>
                <th>Total Fees</th>
                <th>Paid</th>
                <th>Progress</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => (
                <tr key={student.id}>
                  <td>{student.rollnumber || '—'}</td>
                  <td>{student.studentfullname || student.fullname || '—'}</td>
                  <td>{student.class || '—'} / {student.division || '—'}</td>
                  <td>{student.fathername || student.mothername || '—'}</td>
                  <td>{student.fathermobile || student.contactnumber || '—'}</td>
                  <td>{student.village || '—'}</td>
                  <td>₹{Number(student.totalfees || 0).toLocaleString()}</td>
                  <td>₹{Number(student.feespaid || 0).toLocaleString()}</td>
                  <td>
                    {(() => {
                      const total = Number(student.totalfees || 0)
                      const paid = Number(student.feespaid || 0)
                      const pct = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0
                      return <span style={{ fontWeight: 'bold', color: pct >= 100 ? '#2e7d32' : '#1976d2' }}>{pct}%</span>
                    })()}
                  </td>
                  <td style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => openEditModal(student)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '0.9em'
                      }}
                    >
                      ✏️ Edit
                    </button>
                    {(() => {
                      const total = Number(student.totalfees || 0)
                      const paid = Number(student.feespaid || 0)
                      const isComplete = paid >= total && total > 0
                      
                      if (isComplete) return null
                      
                      return (
                        <button
                          onClick={async () => {
                            const amtStr = window.prompt('Enter fees received (₹):', '0')
                            if (amtStr === null) return
                            const amount = Number(amtStr)
                            if (isNaN(amount) || amount <= 0) {
                              setMessage({ type: 'error', text: '❌ Enter a valid amount' })
                              setTimeout(() => setMessage(null), 3000)
                              return
                            }
                            try {
                              if (!supabaseReady) {
                                setMessage({ type: 'error', text: '❌ Supabase not configured' })
                                setTimeout(() => setMessage(null), 3000)
                                return
                              }
                              const currentPaid = Number(student.feespaid || 0)
                              const total = Number(student.totalfees || 0)
                              const newPaid = Math.min(total, currentPaid + amount)
                              const { error } = await supabase
                                .from('students')
                                .update({ feespaid: newPaid })
                                .eq('id', student.id)
                              if (error) throw error
                              // Log transaction in history
                              const tx = {
                                transactionDate: new Date().toISOString().split('T')[0],
                                transactionType: 'Fee',
                                amount: amount,
                                paymentMode: null,
                                description: `Fees received for ${student.studentfullname || student.fullname}`,
                                reference: `StudentID:${student.id}`,
                                studentId: student.id
                              }
                              const { error: txErr } = await supabase.from('transactions').insert([tx])
                              if (txErr) console.warn('Transaction log error:', txErr.message)
                              setMessage({ type: 'success', text: '✅ Fees updated successfully' })
                              setTimeout(() => setMessage(null), 3000)
                              loadStudents()
                            } catch (err) {
                              setMessage({ type: 'error', text: '❌ Error: ' + err.message })
                              setTimeout(() => setMessage(null), 3000)
                            }
                          }}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#1976d2',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '0.9em'
                          }}
                        >
                          💳 Fill Fees
                        </button>
                      )
                    })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p style={{ marginTop: '20px', textAlign: 'center', color: '#666' }}>
        Total: {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
      </p>

      {/* Edit Modal */}
      {showEditModal && selectedStudent && (
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
          zIndex: 1000,
          overflowY: 'auto'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            maxWidth: '900px',
            width: '95%',
            margin: '20px auto',
            boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ marginTop: 0, color: '#333' }}>✏️ Edit Student Information</h3>

            {message && (
              <div className={`alert alert-${message.type}`} style={{ marginBottom: '20px' }}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              {/* Basic Details */}
              <div className="form-section">
                <h4>📝 Basic Details</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      name="fullname"
                      value={formData.fullname}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Roll Number *</label>
                    <input
                      type="text"
                      name="rollnumber"
                      value={formData.rollnumber}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Date of Birth *</label>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Place of Birth *</label>
                    <input
                      type="text"
                      name="placeofbirth"
                      value={formData.placeofbirth}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Gender *</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Category *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="GENERAL">GENERAL</option>
                      <option value="OBC">OBC</option>
                      <option value="SC">SC</option>
                      <option value="ST">ST</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Class *</label>
                    <select
                      name="class"
                      value={formData.class}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Class</option>
                      {classes.map(cls => (
                        <option key={cls} value={cls}>{cls}</option>
                      ))}
                    </select>
                  </div>
                  {/* Division not stored in DB, keep optional */}
                  <div className="form-group">
                    <label>Division</label>
                    <input
                      type="text"
                      name="division"
                      value={formData.division}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Family Information */}
              <div className="form-section">
                <h4>👨‍👩‍👧 Family Information</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Father Name</label>
                    <input
                      type="text"
                      name="fathername"
                      value={formData.fathername}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Mother Name</label>
                    <input
                      type="text"
                      name="mothername"
                      value={formData.mothername}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Guardian Name (Optional)</label>
                  <input
                    type="text"
                    name="parentname"
                    value={formData.parentname}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Contact Number *</label>
                  <input
                    type="tel"
                    name="contactnumber"
                    value={formData.contactnumber}
                    onChange={handleChange}
                    required
                    pattern="[0-9]{10}"
                  />
                </div>
                <div className="form-group">
                  <label>Emergency Contact (optional)</label>
                  <input
                    type="tel"
                    name="emergencycontact"
                    value={formData.emergencycontact}
                    onChange={handleChange}
                    pattern="[0-9]{10}"
                  />
                </div>
                <div className="form-group">
                  <label>Address *</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Location Information */}
              <div className="form-section">
                <h4>🏘️ Location Information</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>State *</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      readOnly
                    />
                  </div>
                  <div className="form-group">
                    <label>District *</label>
                    <input
                      type="text"
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      readOnly
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Village Name *</label>
                  <select
                    name="village"
                    value={formData.village}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Village</option>
                    {villages.map(village => (
                      <option key={village} value={village}>{village}</option>
                    ))}
                    <option value="Other">Other (Enter Manually)</option>
                  </select>
                </div>
                {showOtherVillage && (
                  <div className="form-group">
                    <label>Enter Village Name *</label>
                    <input
                      type="text"
                      name="otherVillage"
                      value={formData.otherVillage}
                      onChange={handleChange}
                      required={showOtherVillage}
                    />
                  </div>
                )}
              </div>

              {/* Admission Information */}
              <div className="form-section">
                <h4>📅 Admission Information</h4>
                <div className="form-row">
                  <div className="form-group">
                    {/* Admission Type field not stored in DB; keep optional */}
                    <label>Admission Type</label>
                    <select
                      name="admissiontype"
                      value={formData.admissiontype}
                      onChange={handleChange}
                    >
                      <option value="">Select Type</option>
                      <option value="Regular">Regular</option>
                      <option value="Tuition">Tuition</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Admission Medium *</label>
                    <select
                      name="medium"
                      value={formData.medium}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Medium</option>
                      <option value="English">English</option>
                      <option value="Hindi">Hindi</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Admission Date *</label>
                    <input
                      type="date"
                      name="admissiondate"
                      value={formData.admissiondate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Transport Information */}
              <div className="form-section">
                <h4>🚐 Transport Information</h4>
                <div className="form-group">
                  <label>School Van Applied *</label>
                  <select
                    name="vanapplied"
                    value={formData.vanapplied}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Option</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                {formData.vanapplied === 'Yes' && (
                  <div className="form-group">
                    <label>Van Charges (₹) *</label>
                    <input
                      type="number"
                      name="vancharges"
                      value={formData.vancharges}
                      onChange={handleChange}
                      min="0"
                      step="1"
                      required
                    />
                  </div>
                )}
              </div>

              {/* Fee Waiver */}
              <div className="form-section">
                <h4>🛡️ Fee Waiver (Admin Only)</h4>
                <div className="form-group">
                  <label>Grant Fee Waiver *</label>
                  <select
                    name="feewaiver"
                    value={formData.feewaiver}
                    onChange={handleChange}
                    required
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes (Full/Partial waiver to be decided by admin)</option>
                  </select>
                </div>
                {formData.feewaiver === 'Yes' && (
                  <div className="form-group">
                    <label>Fee Waiver Amount (₹) *</label>
                    <input
                      type="number"
                      name="feewaiveramt"
                      value={formData.feewaiveramt}
                      onChange={handleChange}
                      min="0"
                      step="1"
                      required
                    />
                  </div>
                )}
              </div>

              {displayedFees !== null && (
                <div className="form-section" style={{ background: '#e8f5e9', border: '2px solid #4caf50' }}>
                  <h4>💰 Fees Details</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <strong>Class Fees ({formData.medium}):</strong> ₹{displayedFees}
                    </div>
                    <div>
                      <strong>Van Fees:</strong> ₹{parseFloat(formData.vancharges || 0)}
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <strong>Subtotal:</strong> ₹{(formData.fees || 0) + parseFloat(formData.vancharges || 0)}
                    </div>
                    {formData.feewaiver === 'Yes' && formData.feewaiveramt > 0 && (
                      <div style={{ gridColumn: '1 / -1', color: '#d32f2f' }}>
                        <strong>Fee Waiver (-):</strong> ₹{formData.feewaiveramt}
                      </div>
                    )}
                    <div style={{ gridColumn: '1 / -1', fontSize: '1.2em', fontWeight: 'bold', color: '#2e7d32' }}>
                      Final Total Fees: ₹{(formData.totalfees || 0)}
                    </div>
                  </div>
                </div>
              )}

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
                  ✅ Update Student
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(selectedStudent.id)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: '#ff5722',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  🗑️ Delete
                </button>
                <button
                  type="button"
                  onClick={closeEditModal}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: '#757575',
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
    </div>
  )
}

export default EditStudent
