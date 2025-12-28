import React, { useState } from 'react'
import { jsPDF } from 'jspdf'
import { supabase, supabaseReady, invalidKeyReason } from '../supabaseClient'

const villages = [
  'Konhar', 'Dhanoli', 'Parrawan', 'Madanpur', 'Palia', 
  'Kuthonda', 'Ajnol', 'Gata', 'Gutore', 'Taragarh', 
  'Padkoli', 'Devra', 'Harisingh Pura', 'Hirapura'
]

const classes = [
  'Nursery', 'LKG', 'UKG', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'
]

const hindiClassFees = {
  'Nursery': 8000,
  'LKG': 8000,
  'UKG': 8000,
  '1st': 9000,
  '2nd': 9000,
  '3rd': 9000,
  '4th': 9000,
  '5th': 9000,
  '6th': 9000,
  '7th': 9000,
  '8th': 9000
}

const englishClassFees = {
  'Nursery': 8000,
  'LKG': 8000,
  'UKG': 8000,
  '1st': 9000,
  '2nd': 9000,
  '3rd': 9000,
  '4th': 9000,
  '5th': 10000,
  '6th': 10000,
  '7th': 10000,
  '8th': 10000
}

function getClassFees(medium, cls) {
  if (!medium || !cls) return 0
  const table = medium === 'English' ? englishClassFees : hindiClassFees
  return table[cls] || 0
}

function AddStudent() {
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
    totalfees: 0
  })

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
      const vanChargesNum = parseFloat(formData.vancharges || 0)
      const totalfees = fees + (isNaN(vanChargesNum) ? 0 : vanChargesNum)
      setFormData(prev => ({ ...prev, fees, totalfees }))
      setDisplayedFees(fees)
    }

    if (name === 'vanapplied') {
      // If van not applied, clear charges and recompute total
      if (value !== 'Yes') {
        const totalfees = (formData.fees || 0)
        setFormData(prev => ({ ...prev, vancharges: '', totalfees }))
      }
    }

    if (name === 'vancharges') {
      const vanChargesNum = parseFloat(value || 0)
      const totalfees = (formData.fees || 0) + (isNaN(vanChargesNum) ? 0 : vanChargesNum)
      setFormData(prev => ({ ...prev, totalfees }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      // Guard: Supabase must be configured and key valid
      if (!supabaseReady) {
        const reason = invalidKeyReason ? ` (${invalidKeyReason})` : ''
        setMessage({ type: 'error', text: `❌ Error: Supabase not configured or invalid key${reason}. Set VITE_SUPABASE_URL and VITE_SUPABASE_KEY (Anon Public Key) in Vercel → Project Settings → Environment Variables, then redeploy.` })
        setTimeout(() => setMessage(null), 6000)
        return
      }

      const dataToSubmit = {
        ...formData,
        village: formData.village === 'Other' ? formData.otherVillage : formData.village
      }
      // Remove otherVillage as it's not a database column
      delete dataToSubmit.otherVillage
      // Ensure parentname is set (fallback to father/mother if provided)
      if (!dataToSubmit.parentname) {
        dataToSubmit.parentname = dataToSubmit.fathername || dataToSubmit.mothername || null
      }
      // Normalize vancharges to number
      dataToSubmit.vancharges = parseFloat(dataToSubmit.vancharges || 0)
      dataToSubmit.totalfees = (dataToSubmit.fees || 0) + (dataToSubmit.vancharges || 0)

      const { data, error } = await supabase
        .from('students')
        .insert([dataToSubmit])

      if (error) {
        console.error('Supabase insert error:', error)
        throw new Error(`${error.message || 'Insert failed'}${error.code ? ` (code: ${error.code})` : ''}`)
      }

      setMessage({ type: 'success', text: '🎉 Congratulations! Student added successfully. Generating PDF...' })

      // Generate PDF with details
      await generateStudentPdf(dataToSubmit)
      
      setFormData({
        fullname: '',
        rollnumber: '',
        dob: '',
        placeofbirth: '',
        gender: '',
        category: '',
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
        totalfees: 0
      })
      setShowOtherVillage(false)
      setDisplayedFees(null)

      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      setMessage({ type: 'error', text: '❌ Error: ' + error.message })
      setTimeout(() => setMessage(null), 5000)
    }
  }

  async function getBase64ImageFromUrl(url) {
    const res = await fetch(url)
    const blob = await res.blob()
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.readAsDataURL(blob)
    })
  }

  async function generateStudentPdf(s) {
    const doc = new jsPDF()
    const logo = await getBase64ImageFromUrl('/logo.jpeg')

    // Header
    if (logo) {
      doc.addImage(logo, 'JPEG', 15, 10, 20, 20)
    }
    doc.setFontSize(16)
    doc.text('VIPIN VIDHYA NIKETAN', 40, 18)
    doc.setFontSize(11)
    doc.text('Dantare Tiraha Konhar, Near Indian Petrol Pump, Konhar, Mehgaon, Bhind, Madhya Pradesh - 477557', 40, 24)
    doc.text('Contact: +91-98765-43210', 40, 30)

    doc.setDrawColor(0)
    doc.line(15, 35, 195, 35)

    // Title
    doc.setFontSize(14)
    doc.text('Admission Details', 15, 45)

    // Student Details
    doc.setFontSize(11)
    const lines = [
      `Full Name: ${s.fullname}`,
      `Roll Number: ${s.rollnumber}`,
      `DOB: ${s.dob}    Place of Birth: ${s.placeofbirth}`,
      `Gender: ${s.gender}    Category: ${s.category}`,
      `Class: ${s.class}    Division: ${s.division}    Medium: ${s.medium}`,
      `Admission Type: ${s.admissiontype}    Admission Date: ${s.admissiondate}`,
      `Father Name: ${s.fathername || '—'}    Mother Name: ${s.mothername || '—'}`,
      `Guardian: ${s.parentname}`,
      `Contact: ${s.contactnumber}    Emergency: ${s.emergencycontact || '—'}`,
      `Address: ${s.address}`,
      `Village: ${s.village}    District: ${s.district}    State: ${s.state}`
    ]
    let y = 55
    lines.forEach(line => {
      doc.text(line, 15, y)
      y += 7
    })

    // Fees Breakdown
    y += 3
    doc.setFontSize(13)
    doc.text('Fees Breakdown (₹)', 15, y)
    y += 8
    doc.setFontSize(11)
    doc.text(`Class Fees (${s.medium}): ₹${s.fees}`, 20, y)
    y += 6
    doc.text(`Van Fees: ₹${s.vancharges}`, 20, y)
    y += 6
    doc.setFontSize(12)
    doc.text(`Total Fees: ₹${s.totalfees}`, 20, y)

    // Footer / Stamp placeholder
    doc.setFontSize(10)
    doc.text('Principal Signature: ______________________', 15, 270)
    doc.text('School Stamp: _____________________________', 120, 270)

    const filename = `Admission_${s.rollNumber || 'NA'}_${(s.fullName || 'Student').replace(/\s+/g,'_')}.pdf`
    doc.save(filename)
  }

  return (
    <div className="container">
      <h2 style={{ marginBottom: '30px', color: '#333' }}>➕ Add New Student</h2>
      
      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>📝 Basic Details</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="fullname"
                value={formData.fullname}
                onChange={handleChange}
                required
                placeholder="Enter student's full name"
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
                placeholder="Enter roll number"
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
                placeholder="Enter place of birth"
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
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
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
            <div className="form-group">
              <label>Division *</label>
              <input
                type="text"
                name="division"
                value={formData.division}
                onChange={handleChange}
                required
                placeholder="e.g., A"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>👨‍👩‍👧 Family Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Father Name </label>
              <input
                type="text"
                name="fathername"
                value={formData.fathername}
                onChange={handleChange}
                placeholder="Enter father's name"
              />
            </div>
            <div className="form-group">
              <label>Mother Name</label>
              <input
                type="text"
                name="mothername"
                value={formData.mothername}
                onChange={handleChange}
                placeholder="Enter mother's name"
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
              placeholder="Enter guardian name (optional)"
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
              placeholder="10-digit mobile number"
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
              placeholder="10-digit mobile number"
            />
          </div>
          <div className="form-group">
            <label>Address *</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              placeholder="Enter complete address"
            />
          </div>
        </div>

        <div className="form-section">
          <h3>🏘️ Location Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>State *</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
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
                required
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
                placeholder="Enter village name"
              />
            </div>
          )}
        </div>

        <div className="form-section">
          <h3>📅 Admission Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Admission Type *</label>
              <select
                name="admissiontype"
                value={formData.admissiontype}
                onChange={handleChange}
                required
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

        <div className="form-section">
          <h3>🚐 Transport Information</h3>
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
                placeholder="Enter van charges in ₹"
              />
            </div>
          )}
        </div>

        {displayedFees !== null && (
          <div className="form-section" style={{ background: '#e8f5e9', border: '2px solid #4caf50' }}>
            <h3>💰 Fees Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <strong>Class Fees ({formData.medium}):</strong> ₹{displayedFees}
              </div>
              <div>
                <strong>Van Fees:</strong> ₹{parseFloat(formData.vancharges || 0)}
              </div>
              <div style={{ gridColumn: '1 / -1', fontSize: '1.2em', fontWeight: 'bold', color: '#2e7d32' }}>
                Total Fees: ₹{(formData.totalfees || 0)}
              </div>
            </div>
            <p style={{ textAlign: 'center', color: '#666', marginTop: '10px' }}>
              Standard annual fee shown for {formData.class} ({formData.medium})
            </p>
          </div>
        )}

        <button type="submit" className="btn">Add Student</button>
      </form>
    </div>
  )
}

export default AddStudent
