import React, { useState, useEffect } from 'react'
import { jsPDF } from 'jspdf'
import { supabase, supabaseReady, invalidKeyReason } from '../supabaseClient'

const classes = [
  'Nursery', 'LKG', 'UKG', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'
]

// Class-wise fees (in Rupees)
const classFees = {
  'English': {
    'Nursery': 8000, 'LKG': 8000, 'UKG': 8000,
    '1st': 9000, '2nd': 9000, '3rd': 9000, '4th': 9000,
    '5th': 10000, '6th': 10000, '7th': 10000, '8th': 10000
  },
  'Hindi': {
    'Nursery': 8000, 'LKG': 8000, 'UKG': 8000,
    '1st': 9000, '2nd': 9000, '3rd': 9000, '4th': 9000,
    '5th': 9000, '6th': 9000, '7th': 9000, '8th': 9000
  }
}

// Helper function to convert date to words
function dateToWords(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const day = date.getDate()
  const month = months[date.getMonth()]
  const year = date.getFullYear()

  const dayWithSuffix = (d) => {
    if (d > 3 && d < 21) return d + 'th'
    switch (d % 10) {
      case 1: return d + 'st'
      case 2: return d + 'nd'
      case 3: return d + 'rd'
      default: return d + 'th'
    }
  }

  return `${dayWithSuffix(day)} ${month}, ${year}`
}

function AddStudent() {
  const [message, setMessage] = useState(null)
  const [formNumber, setFormNumber] = useState('')
  const [admissionNumber, setAdmissionNumber] = useState('')
  const [dobInWords, setDobInWords] = useState('')

  const [formData, setFormData] = useState({
    // Form & Admission Info
    formNumber: '',
    admissionNumber: '',
    admissionDate: '',
    academicYear: '',
    admissionType: '',
    mediumOfStudy: '',
    class: '',

    // Fees Information
    feeDetailsProvided: 'Yes',
    classFees: 0,
    vanFare: 0,
    totalFees: 0,
    feeWaiver: 'No',
    feeWaiverAmount: 0,
    finalFees: 0,

    // Student Basic Info
    studentSamagraId: '',
    studentAadhaar: '',
    studentFullName: '',
    gender: '',
    dob: '',
    dobInWords: '',
    bloodGroup: '',
    category: '',
    religion: '',

    // Father Details
    fatherName: '',
    fatherEducation: '',
    fatherMobile: '',
    fatherAadhaar: '',

    // Mother Details
    motherName: '',
    motherEducation: '',
    motherMobile: '',
    motherAadhaar: '',

    // Domicile & BPL
    domicileMP: '',
    residentType: '',
    bplCardHolder: '',
    bplCardNumber: '',

    // Disability Info
    studentDisability: '',
    disabilityType: '',
    disabilityPercentage: '',

    // Physical Info
    studentWeight: '',
    studentHeight: '',

    // Address
    address: '',
    village: '',
    district: '',
    division: 'Chambal',
    state: 'Madhya Pradesh',
    pinCode: '',
    emailAddress: '',

    // Family Details
    familyId: '',
    numberOfSiblings: '',
    onlyGirlChild: '',
    isChildTwins: '',
    isStudentOrphan: '',
    isFatherDead: '',
    isMotherDead: '',
    fatherDisability: '',
    motherDisability: '',

    // Occupation & Income
    fatherOccupation: '',
    meansOfLivelihood: '',
    isFatherRetired: '',
    departmentName: '',
    motherOccupation: '',
    familyIncome: '',
    isFatherTaxPayer: '',
    landMoreThan10Acres: '',

    // Additional Info
    distanceFromSchool: '',
    motherTongue: '',

    // Previous School (if applicable)
    previousSchoolUDISE: '',
    previousSchoolName: '',
    previousClass: '',
    previousEnrolmentNumber: '',
    previousAdmissionNumber: '',
    previousPercentage: '',
    tcNumber: '',
    tcDate: '',

    // Residence
    residenceApplicable: '',
    residenceType: '',
    residenceSubType: '',

    // IDs
    udisePen: '',
    apaarId: '',

    // Bank Details (All Optional)
    studentBankName: '',
    bankIFSC: '',
    bankAccountNumber: '',
    accountHolder: '',

    // Transport
    schoolVanApplied: '',

    // Declaration
    declarationDate: '',

    // Documents Submitted
    photoSubmitted: '',
    tcSubmitted: '',
    marksheetSubmitted: '',
    aadhaarCardSubmitted: '',
    birthCertificateSubmitted: '',
    bankPassbookSubmitted: '',
    samagraIdSubmitted: '',
    bloodGroupReportSubmitted: '',
    casteCertificateSubmitted: '',
    domicileCertificateSubmitted: '',
    incomeCertificateSubmitted: '',
    bplCardSubmitted: '',
    labourCardSubmitted: '',
    cwsnCertificateSubmitted: '',
    apaarIdCardSubmitted: '',
    motherAadhaarSubmitted: '',
    fatherAadhaarSubmitted: '',
    ladliLaxmiYojanaCardSubmitted: ''
  })

  const feesReady = formData.class && formData.mediumOfStudy

  // Auto-generate form number and admission number on component mount
  useEffect(() => {
    const generateNumbers = async () => {
      try {
        const { data, error } = await supabase
          .from('students')
          .select('formnumber, admissionnumber')
          .order('created_at', { ascending: false })
          .limit(1)
        
        if (!error && data && data.length > 0) {
          const lastFormNumber = parseInt(data[0].formnumber) || 0
          const lastAdmissionNumber = parseInt(data[0].admissionnumber) || 0
          setFormNumber(String(lastFormNumber + 1).padStart(5, '0'))
          setAdmissionNumber(String(lastAdmissionNumber + 1).padStart(5, '0'))
        } else {
          setFormNumber('00001')
          setAdmissionNumber('00001')
        }
      } catch (err) {
        setFormNumber('00001')
        setAdmissionNumber('00001')
      }
    }
    
    if (supabaseReady) {
      generateNumbers()
    }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    
    // Handle admission type specific behavior
    if (name === 'admissionType') {
      if (value === 'Tution') {
        // Tution entries should not auto-generate admission numbers
        setAdmissionNumber('')
      } else {
        // Restore auto-generated number if available
        if (!admissionNumber) {
          setAdmissionNumber(formNumber || '00001')
        }
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Auto-generate DOB in words when DOB changes
    if (name === 'dob') {
      setDobInWords(dateToWords(value))
      setFormData(prev => ({
        ...prev,
        dob: value,
        dobInWords: dateToWords(value)
      }))
    }
    
    // Set declaration date same as admission date
    if (name === 'admissionDate') {
      setFormData(prev => ({
        ...prev,
        admissionDate: value,
        declarationDate: value
      }))
    }
    
    // Calculate fees when class or medium changes
    if (name === 'class' || name === 'mediumOfStudy') {
      const medium = name === 'mediumOfStudy' ? value : formData.mediumOfStudy
      const selectedClass = name === 'class' ? value : formData.class

      if (medium && selectedClass && classFees[medium] && classFees[medium][selectedClass]) {
        const fees = classFees[medium][selectedClass]
        const vanFare = parseFloat(formData.vanFare || 0)
        const totalFees = fees + vanFare
        const waiverAmount = parseFloat(formData.feeWaiverAmount || 0)
        const finalFees = totalFees - waiverAmount

        setFormData(prev => ({
          ...prev,
          [name]: value,
          classFees: fees,
          totalFees: totalFees,
          finalFees: finalFees
        }))
      }
    }
    
    // Recalculate when van fare changes
    if (name === 'vanFare') {
      const vanFare = parseFloat(value || 0)
      const classFees = formData.classFees || 0
      const totalFees = classFees + vanFare
      const waiverAmount = parseFloat(formData.feeWaiverAmount || 0)
      const finalFees = totalFees - waiverAmount
      
      setFormData(prev => ({
        ...prev,
        vanFare: vanFare,
        totalFees: totalFees,
        finalFees: finalFees
      }))
    }
    
    // Recalculate when fee waiver amount changes
    if (name === 'feeWaiverAmount') {
      const waiverAmount = parseFloat(value || 0)
      const totalFees = formData.totalFees || 0
      const finalFees = totalFees - waiverAmount
      
      setFormData(prev => ({
        ...prev,
        feeWaiverAmount: waiverAmount,
        finalFees: finalFees
      }))
    }
    
    // Reset fee waiver amount when changing from Yes to No
    if (name === 'feeWaiver' && value === 'No') {
      const totalFees = formData.totalFees || 0
      setFormData(prev => ({
        ...prev,
        feeWaiver: 'No',
        feeWaiverAmount: 0,
        finalFees: totalFees
      }))
    }

    // Handle van toggle: reset fare and recalc when set to 'No',
    // and recalc totals when set to 'Yes'
    if (name === 'schoolVanApplied') {
      if (value === 'No') {
        const classFees = formData.classFees || 0
        const totalFees = classFees
        const waiverAmount = parseFloat(formData.feeWaiverAmount || 0)
        const finalFees = totalFees - waiverAmount

        setFormData(prev => ({
          ...prev,
          schoolVanApplied: 'No',
          vanFare: 0,
          totalFees,
          finalFees
        }))
      } else if (value === 'Yes') {
        const vanFare = parseFloat(formData.vanFare || 0)
        const classFees = formData.classFees || 0
        const totalFees = classFees + vanFare
        const waiverAmount = parseFloat(formData.feeWaiverAmount || 0)
        const finalFees = totalFees - waiverAmount

        setFormData(prev => ({
          ...prev,
          schoolVanApplied: 'Yes',
          totalFees,
          finalFees
        }))
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (!supabaseReady) {
        const reason = invalidKeyReason ? ` (${invalidKeyReason})` : ''
        setMessage({ type: 'error', text: `❌ Error: Supabase not configured${reason}` })
        setTimeout(() => setMessage(null), 6000)
        return
      }

      // Prepare data with proper handling of numeric fields
      const dataToClean = {
        ...formData,
        formNumber: formNumber,
        admissionNumber: formData.admissionType === 'Tution' ? null : admissionNumber
      }

      // Convert empty numeric fields to null
      const numericFields = [
        'classFees', 'vanFare', 'totalFees', 'feeWaiverAmount', 'finalFees',
        'disabilityPercentage', 'studentWeight', 'studentHeight',
        'numberOfSiblings', 'previousPercentage', 'familyIncome', 'distanceFromSchool'
      ]

      numericFields.forEach(field => {
        if (dataToClean[field] === '' || dataToClean[field] === null) {
          dataToClean[field] = null
        } else {
          dataToClean[field] = parseFloat(dataToClean[field]) || null
        }
      })

      // Convert empty date fields to null
      const dateFields = ['admissionDate', 'dob', 'tcDate', 'declarationDate']
      dateFields.forEach(field => {
        if (dataToClean[field] === '') {
          dataToClean[field] = null
        }
      })

      // Convert empty enum/select fields to null (for CHECK constraints)
      const enumFields = ['accountHolder', 'residenceApplicable', 'residenceType', 'residenceSubType', 'disabilityType']
      enumFields.forEach(field => {
        if (dataToClean[field] === '') {
          dataToClean[field] = null
        }
      })

      // Map all keys to lowercase to match Postgres column names
      const dataToSubmit = Object.fromEntries(
        Object.entries(dataToClean).map(([k, v]) => [k.toLowerCase(), v])
      )

      const { data, error } = await supabase
        .from('students')
        .insert([dataToSubmit])

      if (error) {
        console.error('Supabase insert error:', error)
        throw new Error(`${error.message || 'Insert failed'}`)
      }

      setMessage({ type: 'success', text: '🎉 Student admission completed successfully!' })

      // Reset form
      setFormData({
        formNumber: '',
        admissionNumber: '',
        admissionDate: '',
        academicYear: '',
        admissionType: '',
        mediumOfStudy: '',
        class: '',
        classFees: 0,
        feeDetailsProvided: 'Yes',
        vanFare: 0,
        totalFees: 0,
        feeWaiver: 'No',
        feeWaiverAmount: 0,
        finalFees: 0,
        studentSamagraId: '',
        studentAadhaar: '',
        studentFullName: '',
        gender: '',
        dob: '',
        dobInWords: '',
        bloodGroup: '',
        category: '',
        religion: '',
        fatherName: '',
        fatherEducation: '',
        fatherMobile: '',
        fatherAadhaar: '',
        motherName: '',
        motherEducation: '',
        motherMobile: '',
        motherAadhaar: '',
        domicileMP: '',
        residentType: '',
        bplCardHolder: '',
        bplCardNumber: '',
        studentDisability: '',
        disabilityType: '',
        disabilityPercentage: '',
        studentWeight: '',
        studentHeight: '',
        address: '',
        village: '',
        district: '',
        division: 'Chambal',
        state: 'Madhya Pradesh',
        pinCode: '',
        emailAddress: '',
        familyId: '',
        numberOfSiblings: '',
        onlyGirlChild: '',
        isChildTwins: '',
        isStudentOrphan: '',
        isFatherDead: '',
        isMotherDead: '',
        fatherDisability: '',
        motherDisability: '',
        fatherOccupation: '',
        meansOfLivelihood: '',
        isFatherRetired: '',
        departmentName: '',
        motherOccupation: '',
        familyIncome: '',
        isFatherTaxPayer: '',
        landMoreThan10Acres: '',
        distanceFromSchool: '',
        motherTongue: '',
        previousSchoolUDISE: '',
        previousSchoolName: '',
        previousClass: '',
        previousEnrolmentNumber: '',
        previousAdmissionNumber: '',
        previousPercentage: '',
        tcNumber: '',
        tcDate: '',
        residenceApplicable: '',
        residenceType: '',
        residenceSubType: '',
        udisePen: '',
        apaarId: '',
        studentBankName: '',
        bankIFSC: '',
        bankAccountNumber: '',
        accountHolder: '',
        schoolVanApplied: '',
        declarationDate: '',
        photoSubmitted: '',
        tcSubmitted: '',
        marksheetSubmitted: '',
        aadhaarCardSubmitted: '',
        birthCertificateSubmitted: '',
        bankPassbookSubmitted: '',
        samagraIdSubmitted: '',
        bloodGroupReportSubmitted: '',
        casteCertificateSubmitted: '',
        domicileCertificateSubmitted: '',
        incomeCertificateSubmitted: '',
        bplCardSubmitted: '',
        labourCardSubmitted: '',
        cwsnCertificateSubmitted: '',
        apaarIdCardSubmitted: '',
        motherAadhaarSubmitted: '',
        fatherAadhaarSubmitted: '',
        ladliLaxmiYojanaCardSubmitted: ''
      })
      
      setDobInWords('')
      
      // Generate new form and admission numbers
      const newFormNum = String(parseInt(formNumber) + 1).padStart(5, '0')
      const newAdmissionNum = String(parseInt(admissionNumber || '0') + 1).padStart(5, '0')
      setFormNumber(newFormNum)
      if (formData.admissionType !== 'Tution') {
        setAdmissionNumber(newAdmissionNum)
      }

      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      setMessage({ type: 'error', text: '❌ Error: ' + error.message })
      setTimeout(() => setMessage(null), 5000)
    }
  }

  return (
    <div className="container">
      <h2 style={{ marginBottom: '30px', color: '#333' }}>📝 Student Admission Form</h2>
      
      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        
        {/* SECTION 1: Form & Admission Information */}
        <div className="form-section">
          <h3>📋 Form & Admission Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Form Number (Auto-generated)</label>
              <input
                type="text"
                value={formNumber}
                readOnly
                style={{ backgroundColor: '#f0f0f0' }}
              />
            </div>
            <div className="form-group">
              <label>Admission Number (Auto-generated)</label>
              <input
                type="text"
                value={admissionNumber}
                readOnly={formData.admissionType !== 'Tution'}
                placeholder={formData.admissionType === 'Tution' ? 'Not required for Tution' : ''}
                style={{ backgroundColor: formData.admissionType === 'Tution' ? '#fff' : '#f0f0f0' }}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Admission Date *</label>
              <input
                type="date"
                name="admissionDate"
                value={formData.admissionDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Academic Year *</label>
              <input
                type="text"
                name="academicYear"
                value={formData.academicYear}
                onChange={handleChange}
                placeholder="e.g., 2024-2025"
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Admission Type *</label>
              <select
                name="admissionType"
                value={formData.admissionType}
                onChange={handleChange}
                required
              >
                <option value="">Select Type</option>
                <option value="Regular">Regular</option>
                <option value="Tution">Tution</option>
              </select>
            </div>
            <div className="form-group">
              <label>Medium of Study *</label>
              <select
                name="mediumOfStudy"
                value={formData.mediumOfStudy}
                onChange={handleChange}
                required
              >
                <option value="">Select Medium</option>
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
              </select>
            </div>
          </div>
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
        </div>

        {/* SECTION 2: Fees Information */}
        <div className="form-section" style={{ background: '#e8f5e9', border: '2px solid #4caf50' }}>
          <h3>💰 Fees Information</h3>

          {!feesReady && (
            <div style={{ marginBottom: '10px', color: '#555' }}>
              Select medium and class to enable fees, van, and waiver inputs.
            </div>
          )}

          <div className="form-group">
            <label>Do you have fee details?</label>
            <select
              name="feeDetailsProvided"
              value={formData.feeDetailsProvided}
              onChange={handleChange}
            >
              <option value="Yes">Yes</option>
              <option value="No">No (use sample fees below)</option>
            </select>
          </div>

          <div style={{ padding: '12px', background: '#fff', borderRadius: '8px', border: '1px dashed #4caf50', marginBottom: '12px' }}>
            <strong>Sample Fees (update anytime):</strong>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px', fontSize: '0.95em' }}>
              <div><u>English Medium</u>: Nursery/LKG/UKG ₹8000, 1st-4th ₹9000, 5th-8th ₹10000</div>
              <div><u>Hindi Medium</u>: 6th-8th ₹9000 </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Class Fees ({formData.mediumOfStudy || '---'})</label>
              <input
                type="number"
                value={formData.classFees}
                readOnly
                style={{ backgroundColor: '#f0f0f0', fontWeight: 'bold' }}
              />
            </div>
            <div className="form-group">
              <label>School Van Applied *</label>
              <select
                name="schoolVanApplied"
                value={formData.schoolVanApplied}
                onChange={handleChange}
                required={feesReady}
                disabled={!feesReady}
              >
                <option value="">Select Option</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>
          
          {formData.schoolVanApplied === 'Yes' && (
            <div className="form-group">
              <label>Van Fare (₹) *</label>
              <input
                type="number"
                name="vanFare"
                value={formData.vanFare}
                onChange={handleChange}
                min="0"
                step="1"
                required={feesReady}
                disabled={!feesReady}
                placeholder="Enter van fare"
              />
            </div>
          )}
          
          <div className="form-group">
            <label>Total Fees (Class + Van)</label>
            <input
              type="number"
              value={formData.totalFees}
              readOnly
              style={{ backgroundColor: '#fff3cd', fontWeight: 'bold', fontSize: '1.1em' }}
            />
          </div>
          
          <div className="form-group">
            <label>Fee Waiver *</label>
            <select
              name="feeWaiver"
              value={formData.feeWaiver}
              onChange={handleChange}
              required={feesReady}
              disabled={!feesReady}
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>
          
          {formData.feeWaiver === 'Yes' && (
            <div className="form-group">
              <label>Fee Waiver Amount (₹) *</label>
              <input
                type="number"
                name="feeWaiverAmount"
                value={formData.feeWaiverAmount}
                onChange={handleChange}
                min="0"
                max={formData.totalFees}
                step="1"
                required={feesReady}
                disabled={!feesReady}
                placeholder="Enter amount to be waived"
              />
              <small style={{ color: '#d32f2f', display: 'block', marginTop: '5px' }}>
                ⚠️ This amount will be deducted from total fees
              </small>
            </div>
          )}
          
          <div className="form-group">
            <label>Final Fees to be Paid (After Waiver)</label>
            <input
              type="number"
              value={formData.finalFees}
              readOnly
              style={{ backgroundColor: '#c8e6c9', fontWeight: 'bold', fontSize: '1.2em', color: '#2e7d32' }}
            />
          </div>
          
          <div style={{ padding: '15px', background: '#fff', borderRadius: '8px', marginTop: '15px' }}>
            <h4 style={{ marginBottom: '10px', color: '#333' }}>Fees Breakdown:</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.95em' }}>
              <div><strong>Class Fees:</strong> ₹{formData.classFees || 0}</div>
              <div><strong>Van Fare:</strong> ₹{formData.vanFare || 0}</div>
              <div><strong>Subtotal:</strong> ₹{formData.totalFees || 0}</div>
              {formData.feeWaiver === 'Yes' && (
                <div style={{ color: '#d32f2f' }}><strong>Waiver (-):</strong> ₹{formData.feeWaiverAmount || 0}</div>
              )}
              <div style={{ gridColumn: '1 / -1', fontSize: '1.1em', color: '#2e7d32', padding: '10px', background: '#c8e6c9', borderRadius: '5px', textAlign: 'center' }}>
                <strong>FINAL AMOUNT: ₹{formData.finalFees || 0}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: Student Basic Information */}
        <div className="form-section">
          <h3>👤 Student Basic Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Student Samagra ID (9 digits)</label>
              <input
                type="text"
                name="studentSamagraId"
                value={formData.studentSamagraId}
                onChange={handleChange}
                pattern="[0-9]{9}"
                placeholder="9-digit Samagra ID"
                maxLength="9"
              />
            </div>
            <div className="form-group">
              <label>Student Aadhaar Number</label>
              <input
                type="text"
                name="studentAadhaar"
                value={formData.studentAadhaar}
                onChange={handleChange}
                pattern="[0-9]{12}"
                placeholder="12-digit Aadhaar"
                maxLength="12"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Student Full Name (English) *</label>
            <input
              type="text"
              name="studentFullName"
              value={formData.studentFullName}
              onChange={handleChange}
              placeholder="Enter full name"
              required
            />
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
                <option value="Boy">Boy</option>
                <option value="Girl">Girl</option>
              </select>
            </div>
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
          </div>
          <div className="form-group">
            <label>Date of Birth (in words) - Auto-generated</label>
            <input
              type="text"
              value={dobInWords}
              readOnly
              style={{ backgroundColor: '#f0f0f0' }}
              placeholder="Will be generated from date"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Blood Group</label>
              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
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
                <option value="General">General</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Religion *</label>
            <select
              name="religion"
              value={formData.religion}
              onChange={handleChange}
              required
            >
              <option value="">Select Religion</option>
              <option value="Hindu">Hindu</option>
              <option value="Muslim">Muslim</option>
              <option value="Jain">Jain</option>
              <option value="Sikh">Sikh</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* SECTION 3: Father Details */}
        <div className="form-section">
          <h3>👨 Father Details</h3>
          <div className="form-group">
            <label>Father Name *</label>
            <input
              type="text"
              name="fatherName"
              value={formData.fatherName}
              onChange={handleChange}
              placeholder="Enter father's name"
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Father Education Qualification *</label>
              <input
                type="text"
                name="fatherEducation"
                value={formData.fatherEducation}
                onChange={handleChange}
                placeholder="e.g., 10th, 12th, Graduate"
                required
              />
            </div>
            <div className="form-group">
              <label>Father Mobile Number *</label>
              <input
                type="tel"
                name="fatherMobile"
                value={formData.fatherMobile}
                onChange={handleChange}
                pattern="[0-9]{10}"
                placeholder="10-digit mobile"
                maxLength="10"
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label>Father Aadhaar Number</label>
            <input
              type="text"
              name="fatherAadhaar"
              value={formData.fatherAadhaar}
              onChange={handleChange}
              pattern="[0-9]{12}"
              placeholder="12-digit Aadhaar"
              maxLength="12"
            />
          </div>
        </div>

        {/* SECTION 4: Mother Details */}
        <div className="form-section">
          <h3>👩 Mother Details</h3>
          <div className="form-group">
            <label>Mother Name *</label>
            <input
              type="text"
              name="motherName"
              value={formData.motherName}
              onChange={handleChange}
              placeholder="Enter mother's name"
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Mother Education Qualification *</label>
              <input
                type="text"
                name="motherEducation"
                value={formData.motherEducation}
                onChange={handleChange}
                placeholder="e.g., 10th, 12th, Graduate"
                required
              />
            </div>
            <div className="form-group">
              <label>Mother Mobile Number</label>
              <input
                type="tel"
                name="motherMobile"
                value={formData.motherMobile}
                onChange={handleChange}
                pattern="[0-9]{10}"
                placeholder="10-digit mobile"
                maxLength="10"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Mother Aadhaar Number</label>
            <input
              type="text"
              name="motherAadhaar"
              value={formData.motherAadhaar}
              onChange={handleChange}
              pattern="[0-9]{12}"
              placeholder="12-digit Aadhaar"
              maxLength="12"
            />
          </div>
        </div>

        {/* SECTION 5: Domicile & BPL Information */}
        <div className="form-section">
          <h3>🏠 Domicile & BPL Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Domicile of MP *</label>
              <select
                name="domicileMP"
                value={formData.domicileMP}
                onChange={handleChange}
                required
              >
                <option value="">Select Option</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div className="form-group">
              <label>Resident Type *</label>
              <select
                name="residentType"
                value={formData.residentType}
                onChange={handleChange}
                required
              >
                <option value="">Select Type</option>
                <option value="Rural">Rural</option>
                <option value="Urban">Urban</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>BPL Card Holder *</label>
              <select
                name="bplCardHolder"
                value={formData.bplCardHolder}
                onChange={handleChange}
                required
              >
                <option value="">Select Option</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            {formData.bplCardHolder === 'Yes' && (
              <div className="form-group">
                <label>BPL Card Number *</label>
                <input
                  type="text"
                  name="bplCardNumber"
                  value={formData.bplCardNumber}
                  onChange={handleChange}
                  placeholder="Enter BPL Card Number"
                  required
                />
              </div>
            )}
          </div>
        </div>

        {/* SECTION 6: Disability Information */}
        <div className="form-section">
          <h3>♿ Disability Information</h3>
          <div className="form-group">
            <label>Student Disability *</label>
            <select
              name="studentDisability"
              value={formData.studentDisability}
              onChange={handleChange}
              required
            >
              <option value="">Select Option</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
          {formData.studentDisability === 'Yes' && (
            <>
              <div className="form-group">
                <label>Type of Disability *</label>
                <input
                  type="text"
                  name="disabilityType"
                  value={formData.disabilityType}
                  onChange={handleChange}
                  placeholder="Enter disability type"
                  required
                />
              </div>
              <div className="form-group">
                <label>Percentage of Disability *</label>
                <input
                  type="number"
                  name="disabilityPercentage"
                  value={formData.disabilityPercentage}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  placeholder="Enter percentage"
                  required
                />
              </div>
            </>
          )}
        </div>

        {/* SECTION 7: Physical Information */}
        <div className="form-section">
          <h3>📏 Physical Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Student Weight (Kg)</label>
              <input
                type="number"
                name="studentWeight"
                value={formData.studentWeight}
                onChange={handleChange}
                step="0.1"
                placeholder="Enter weight"
              />
            </div>
            <div className="form-group">
              <label>Student Height (Cm)</label>
              <input
                type="number"
                name="studentHeight"
                value={formData.studentHeight}
                onChange={handleChange}
                step="0.1"
                placeholder="Enter height"
              />
            </div>
          </div>
        </div>

        {/* SECTION 8: Address Details */}
        <div className="form-section">
          <h3>📍 Address Details</h3>
          <div className="form-group">
            <label>Address *</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter complete address"
              required
              rows="3"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Village *</label>
              <input
                type="text"
                name="village"
                value={formData.village}
                onChange={handleChange}
                placeholder="Enter village name"
                required
              />
            </div>
            <div className="form-group">
              <label>District *</label>
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleChange}
                placeholder="Enter district"
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Division</label>
              <input
                type="text"
                name="division"
                value={formData.division}
                onChange={handleChange}
                readOnly
                style={{ backgroundColor: '#f0f0f0' }}
              />
            </div>
            <div className="form-group">
              <label>State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                readOnly
                style={{ backgroundColor: '#f0f0f0' }}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>PIN Code *</label>
              <input
                type="text"
                name="pinCode"
                value={formData.pinCode}
                onChange={handleChange}
                pattern="[0-9]{6}"
                placeholder="6-digit PIN"
                maxLength="6"
                required
              />
            </div>
            <div className="form-group">
              <label>Email Address (Parent)</label>
              <input
                type="email"
                name="emailAddress"
                value={formData.emailAddress}
                onChange={handleChange}
                placeholder="parent@example.com"
              />
            </div>
          </div>
        </div>

        {/* SECTION 9: Family Details */}
        <div className="form-section">
          <h3>👪 Family Details</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Family ID</label>
              <input
                type="text"
                name="familyId"
                value={formData.familyId}
                onChange={handleChange}
                placeholder="Enter family ID"
              />
            </div>
            <div className="form-group">
              <label>Number of Siblings *</label>
              <input
                type="number"
                name="numberOfSiblings"
                value={formData.numberOfSiblings}
                onChange={handleChange}
                min="0"
                placeholder="Enter number"
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Only Girl Child *</label>
              <select
                name="onlyGirlChild"
                value={formData.onlyGirlChild}
                onChange={handleChange}
                required
              >
                <option value="">Select Option</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div className="form-group">
              <label>Is Child Twins *</label>
              <select
                name="isChildTwins"
                value={formData.isChildTwins}
                onChange={handleChange}
                required
              >
                <option value="">Select Option</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Is Student Orphan *</label>
              <select
                name="isStudentOrphan"
                value={formData.isStudentOrphan}
                onChange={handleChange}
                required
              >
                <option value="">Select Option</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div className="form-group">
              <label>Is Father Dead *</label>
              <select
                name="isFatherDead"
                value={formData.isFatherDead}
                onChange={handleChange}
                required
              >
                <option value="">Select Option</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Is Mother Dead *</label>
              <select
                name="isMotherDead"
                value={formData.isMotherDead}
                onChange={handleChange}
                required
              >
                <option value="">Select Option</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div className="form-group">
              <label>Father Disability *</label>
              <select
                name="fatherDisability"
                value={formData.fatherDisability}
                onChange={handleChange}
                required
              >
                <option value="">Select Option</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Mother Disability *</label>
            <select
              name="motherDisability"
              value={formData.motherDisability}
              onChange={handleChange}
              required
            >
              <option value="">Select Option</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
        </div>

        {/* SECTION 10: Occupation & Income */}
        <div className="form-section">
          <h3>💼 Occupation & Income Details</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Father Occupation *</label>
              <input
                type="text"
                name="fatherOccupation"
                value={formData.fatherOccupation}
                onChange={handleChange}
                placeholder="Enter occupation"
                required
              />
            </div>
            <div className="form-group">
              <label>Means of Livelihood *</label>
              <select
                name="meansOfLivelihood"
                value={formData.meansOfLivelihood}
                onChange={handleChange}
                required
              >
                <option value="">Select Option</option>
                <option value="Govt">Govt</option>
                <option value="Non-Govt">Non-Govt</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Is Father / Guardian Retired *</label>
              <select
                name="isFatherRetired"
                value={formData.isFatherRetired}
                onChange={handleChange}
                required
              >
                <option value="">Select Option</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div className="form-group">
              <label>Department Name (If applicable)</label>
              <input
                type="text"
                name="departmentName"
                value={formData.departmentName}
                onChange={handleChange}
                placeholder="Enter department name"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Mother Occupation *</label>
              <input
                type="text"
                name="motherOccupation"
                value={formData.motherOccupation}
                onChange={handleChange}
                placeholder="Enter occupation"
                required
              />
            </div>
            <div className="form-group">
              <label>Family Income (Yearly) *</label>
              <input
                type="number"
                name="familyIncome"
                value={formData.familyIncome}
                onChange={handleChange}
                placeholder="Enter yearly income"
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Is Father Tax Payer *</label>
              <select
                name="isFatherTaxPayer"
                value={formData.isFatherTaxPayer}
                onChange={handleChange}
                required
              >
                <option value="">Select Option</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div className="form-group">
              <label>Land More Than 10 Acres *</label>
              <select
                name="landMoreThan10Acres"
                value={formData.landMoreThan10Acres}
                onChange={handleChange}
                required
              >
                <option value="">Select Option</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 11: Additional Information */}
        <div className="form-section">
          <h3>📌 Additional Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Distance from Home to School (Km) *</label>
              <input
                type="number"
                name="distanceFromSchool"
                value={formData.distanceFromSchool}
                onChange={handleChange}
                step="0.1"
                placeholder="Enter distance"
                required
              />
            </div>
            <div className="form-group">
              <label>Mother Tongue *</label>
              <input
                type="text"
                name="motherTongue"
                value={formData.motherTongue}
                onChange={handleChange}
                placeholder="Enter mother tongue"
                required
              />
            </div>
          </div>
        </div>

        {/* SECTION 12: Previous School Details (Only if applicable) */}
        <div className="form-section">
          <h3>🏫 Previous School Details (If Applicable)</h3>
          <p style={{ fontSize: '0.9em', color: '#666', marginBottom: '15px' }}>
            Fill this section only if VVN is not the student's first school
          </p>
          <div className="form-row">
            <div className="form-group">
              <label>Previous School UDISE Code</label>
              <input
                type="text"
                name="previousSchoolUDISE"
                value={formData.previousSchoolUDISE}
                onChange={handleChange}
                placeholder="Enter UDISE code"
              />
            </div>
            <div className="form-group">
              <label>Previous School Name</label>
              <input
                type="text"
                name="previousSchoolName"
                value={formData.previousSchoolName}
                onChange={handleChange}
                placeholder="Enter school name"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Previous Class</label>
              <input
                type="text"
                name="previousClass"
                value={formData.previousClass}
                onChange={handleChange}
                placeholder="e.g., 5th"
              />
            </div>
            <div className="form-group">
              <label>Previous Enrolment Number</label>
              <input
                type="text"
                name="previousEnrolmentNumber"
                value={formData.previousEnrolmentNumber}
                onChange={handleChange}
                placeholder="Enter enrolment number"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Previous Admission Number</label>
              <input
                type="text"
                name="previousAdmissionNumber"
                value={formData.previousAdmissionNumber}
                onChange={handleChange}
                placeholder="Enter admission number"
              />
            </div>
            <div className="form-group">
              <label>Previous Percentage</label>
              <input
                type="number"
                name="previousPercentage"
                value={formData.previousPercentage}
                onChange={handleChange}
                step="0.01"
                min="0"
                max="100"
                placeholder="Enter percentage"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Transfer Certificate Number</label>
              <input
                type="text"
                name="tcNumber"
                value={formData.tcNumber}
                onChange={handleChange}
                placeholder="Enter TC number"
              />
            </div>
            <div className="form-group">
              <label>Transfer Certificate Date</label>
              <input
                type="date"
                name="tcDate"
                value={formData.tcDate}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* SECTION 13: Residence Information */}
        <div className="form-section">
          <h3>🏘️ Residence Information</h3>
          <div className="form-group">
            <label>Residence Applicable *</label>
            <select
              name="residenceApplicable"
              value={formData.residenceApplicable}
              onChange={handleChange}
              required
            >
              <option value="">Select Option</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
          {formData.residenceApplicable === 'Yes' && (
            <>
              <div className="form-group">
                <label>Residence Type *</label>
                <input
                  type="text"
                  name="residenceType"
                  value={formData.residenceType}
                  onChange={handleChange}
                  placeholder="Enter residence type"
                  required
                />
              </div>
              <div className="form-group">
                <label>Residence Sub-Type *</label>
                <input
                  type="text"
                  name="residenceSubType"
                  value={formData.residenceSubType}
                  onChange={handleChange}
                  placeholder="Enter residence sub-type"
                  required
                />
              </div>
            </>
          )}
        </div>

        {/* SECTION 14: Student IDs */}
        <div className="form-section">
          <h3>🆔 Student IDs</h3>
          <div className="form-row">
            <div className="form-group">
              <label>UDISE PEN</label>
              <input
                type="text"
                name="udisePen"
                value={formData.udisePen}
                onChange={handleChange}
                placeholder="Enter UDISE PEN"
              />
            </div>
            <div className="form-group">
              <label>APAAR ID</label>
              <input
                type="text"
                name="apaarId"
                value={formData.apaarId}
                onChange={handleChange}
                placeholder="Enter APAAR ID"
              />
            </div>
          </div>
        </div>

        {/* SECTION 15: Bank Details (All Optional) */}
        <div className="form-section">
          <h3>🏦 Bank Details (Optional)</h3>
          <p style={{ fontSize: '0.9em', color: '#666', marginBottom: '15px' }}>
            All bank details are optional
          </p>
          <div className="form-row">
            <div className="form-group">
              <label>Student Bank Name</label>
              <input
                type="text"
                name="studentBankName"
                value={formData.studentBankName}
                onChange={handleChange}
                placeholder="Enter bank name"
              />
            </div>
            <div className="form-group">
              <label>Bank IFSC Code</label>
              <input
                type="text"
                name="bankIFSC"
                value={formData.bankIFSC}
                onChange={handleChange}
                placeholder="Enter IFSC code"
                maxLength="11"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Bank Account Number</label>
              <input
                type="text"
                name="bankAccountNumber"
                value={formData.bankAccountNumber}
                onChange={handleChange}
                placeholder="Enter account number"
              />
            </div>
            <div className="form-group">
              <label>Account Holder</label>
              <select
                name="accountHolder"
                value={formData.accountHolder}
                onChange={handleChange}
              >
                <option value="">Select Option</option>
                <option value="Student">Student</option>
                <option value="Parent">Parent</option>
                <option value="Guardian">Guardian</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 16: Declaration */}
        <div className="form-section">
          <h3>📝 Declaration</h3>
          <div className="form-group">
            <label>Declaration Date (Auto-set from Admission Date)</label>
            <input
              type="date"
              name="declarationDate"
              value={formData.declarationDate}
              readOnly
              style={{ backgroundColor: '#f0f0f0' }}
            />
          </div>
        </div>

        {/* SECTION 17: Documents Submitted */}
        <div className="form-section">
          <h3>📄 Documents Submitted</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
            {[
              { name: 'photoSubmitted', label: 'Photo' },
              { name: 'tcSubmitted', label: 'Transfer Certificate' },
              { name: 'marksheetSubmitted', label: 'Marksheet' },
              { name: 'aadhaarCardSubmitted', label: 'Aadhaar Card' },
              { name: 'birthCertificateSubmitted', label: 'Birth Certificate' },
              { name: 'bankPassbookSubmitted', label: 'Bank Passbook' },
              { name: 'samagraIdSubmitted', label: 'Samagra ID' },
              { name: 'bloodGroupReportSubmitted', label: 'Blood Group Report' },
              { name: 'casteCertificateSubmitted', label: 'Caste Certificate' },
              { name: 'domicileCertificateSubmitted', label: 'Domicile Certificate' },
              { name: 'incomeCertificateSubmitted', label: 'Income Certificate' },
              { name: 'bplCardSubmitted', label: 'BPL Card' },
              { name: 'labourCardSubmitted', label: 'Labour Card' },
              { name: 'cwsnCertificateSubmitted', label: 'CWSN Certificate' },
              { name: 'apaarIdCardSubmitted', label: 'APAAR ID Card' },
              { name: 'motherAadhaarSubmitted', label: 'Mother Aadhaar' },
              { name: 'fatherAadhaarSubmitted', label: 'Father Aadhaar' },
              { name: 'ladliLaxmiYojanaCardSubmitted', label: 'Ladli Laxmi Yojana Card' }
            ].map(doc => (
              <div key={doc.name} className="form-group">
                <label>{doc.label} Submitted *</label>
                <select
                  name={doc.name}
                  value={formData[doc.name]}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="btn" style={{ marginTop: '20px', padding: '15px 40px', fontSize: '16px' }}>
          Submit Admission Form
        </button>
      </form>
    </div>
  )
}

export default AddStudent
