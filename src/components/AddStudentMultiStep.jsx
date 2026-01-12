import React, { useState, useEffect } from 'react'
import { supabase, supabaseReady } from '../supabaseClient'

const initialFormState = {
  formNumber: '',
  admissionNumber: '',
  admissionDate: '',
  academicYear: '',
  class: '',
  mediumOfStudy: '',
  admissionType: 'Regular',

  studentFullName: '',
  rollNumber: '',
  studentSamagraId: '',
  studentAadhaar: '',
  udisePen: '',
  apaarId: '',
  dob: '',
  gender: '',
  bloodGroup: '',
  category: 'General',
  religion: 'Hindu',

  fatherName: '',
  fatherEducation: 'NA',
  fatherMobile: '',
  fatherAadhaar: '',
  motherName: '',
  motherEducation: 'NA',
  motherMobile: '',
  motherAadhaar: '',

  address: '',
  village: '',
  district: 'Bhind',
  state: 'Madhya Pradesh',
  pinCode: '',
  residentType: 'Rural',
  domicileMp: 'Yes',

  classFees: 0,
  vanFare: 0,
  schoolVanApplied: 'No',
  totalFees: 0,
  feeWaiver: 'No',
  feeWaiverAmount: 0,
  finalFees: 0,

  photoSubmitted: 'No',
  tcSubmitted: 'No',
  aadhaarCardSubmitted: 'No',
  birthCertificateSubmitted: 'No',
  marksheetSubmitted: 'No',
  bankPassbookSubmitted: 'No',
  samagraIdSubmitted: 'No',
  bloodGroupReportSubmitted: 'No',
  casteCertificateSubmitted: 'No',
  domicileCertificateSubmitted: 'No',
  incomeCertificateSubmitted: 'No',
  bplCardSubmitted: 'No',
  labourCardSubmitted: 'No',
  cwsnCertificateSubmitted: 'No',
  apaarIdCardSubmitted: 'No',
  motherAadhaarSubmitted: 'No',
  fatherAadhaarSubmitted: 'No',
  ladliLaxmiCardSubmitted: 'No',
  bankAccountHolder: 'Parent'
}

function AddStudentMultiStep() {
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 6
  const [message, setMessage] = useState(null)
  const [formData, setFormData] = useState(() => ({ ...initialFormState }))

  const getNextNumbers = () => {
    const lastForm = localStorage.getItem('lastFormNumber') || 'F0000'
    const lastAdmission = localStorage.getItem('lastAdmissionNumber') || 'A0000'
    const nextFormNum = 'F' + String(parseInt(lastForm.slice(1) || '0', 10) + 1).padStart(4, '0')
    const nextAdmissionNum = 'A' + String(parseInt(lastAdmission.slice(1) || '0', 10) + 1).padStart(4, '0')
    const today = new Date().toISOString().split('T')[0]

    localStorage.setItem('lastFormNumber', nextFormNum)
    localStorage.setItem('lastAdmissionNumber', nextAdmissionNum)

    return { nextFormNum, nextAdmissionNum, today }
  }

  useEffect(() => {
    const { nextFormNum, nextAdmissionNum, today } = getNextNumbers()
    setFormData(prev => ({ ...prev, formNumber: nextFormNum, admissionNumber: nextAdmissionNum, admissionDate: today }))
  }, [])

  useEffect(() => {
    const classFees = {
      English: {
        Nursery: 12000, LKG: 12000, UKG: 12000,
        '1st': 13000, '2nd': 13000, '3rd': 13000, '4th': 13000,
        '5th': 14000, '6th': 14000, '7th': 14000, '8th': 14000
      },
      Hindi: {
        Nursery: 9000, LKG: 9000, UKG: 9000,
        '1st': 9000, '2nd': 9000, '3rd': 9000, '4th': 9000,
        '5th': 9000, '6th': 9000, '7th': 9000, '8th': 9000
      }
    }

    const fees = classFees[formData.mediumOfStudy]?.[formData.class] || 0
    const van = formData.schoolVanApplied === 'Yes' ? Number(formData.vanFare || 0) : 0
    const total = fees + van
    const waiver = formData.feeWaiver === 'Yes' ? Number(formData.feeWaiverAmount || 0) : 0
    const final = Math.max(0, total - waiver)

    if (formData.classFees === fees && formData.totalFees === total && formData.finalFees === final) {
      return
    }

    setFormData(prev => ({
      ...prev,
      classFees: fees,
      totalFees: total,
      finalFees: final
    }))
  }, [formData.class, formData.mediumOfStudy, formData.schoolVanApplied, formData.vanFare, formData.feeWaiver, formData.feeWaiverAmount])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const validateStep = (step) => {
    const requiredFields = {
      1: ['admissionDate', 'academicYear', 'class', 'mediumOfStudy', 'admissionType'],
      2: ['studentFullName', 'dob', 'gender', 'category', 'religion'],
      3: ['fatherName', 'fatherEducation', 'fatherMobile'],
      4: ['address', 'village', 'district'],
      5: [], // Fees are auto-calculated
      6: [] // Documents are optional
    }

    const fieldsToCheck = requiredFields[step] || []
    const missingFields = fieldsToCheck.filter(field => !formData[field] || formData[field] === '')

    if (missingFields.length > 0) {
      const fieldLabels = {
        admissionDate: 'Admission Date',
        academicYear: 'Academic Year',
        class: 'Class',
        mediumOfStudy: 'Medium of Study',
        admissionType: 'Admission Type',
        studentFullName: 'Student Full Name',
        dob: 'Date of Birth',
        gender: 'Gender',
        category: 'Category',
        religion: 'Religion',
        fatherName: "Father's Name",
        fatherEducation: "Father's Education",
        fatherMobile: "Father's Mobile",
        address: 'Address',
        village: 'Village',
        district: 'District'
      }

      const missingLabels = missingFields.map(f => fieldLabels[f] || f).join(', ')
      setMessage({ type: 'error', text: `⚠️ Please fill all required fields: ${missingLabels}` })
      return false
    }

    return true
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      if (validateStep(currentStep)) {
        setCurrentStep(currentStep + 1)
        window.scrollTo(0, 0)
        setMessage(null)
      }
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      window.scrollTo(0, 0)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (!supabaseReady) {
        setMessage({ type: 'error', text: '❌ Database not configured' })
        return
      }

      // Basic validation to avoid CHECK constraint violations
      const allowedGender = ['Boy', 'Girl']
      const allowedCategory = ['General', 'OBC', 'SC', 'ST']
      const allowedAdmissionType = ['Regular', 'Tution']
      const allowedMedium = ['English', 'Hindi']
      const allowedClasses = ['Nursery', 'LKG', 'UKG', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th']

      const normalizeGender = (val) => {
        const map = { boy: 'Boy', male: 'Boy', girl: 'Girl', female: 'Girl' }
        return map[(val || '').toLowerCase()] || val
      }

      const genderFinal = normalizeGender(formData.gender)
      if (!allowedGender.includes(genderFinal)) {
        setMessage({ type: 'error', text: '❌ Please select Gender as Boy or Girl.' })
        return
      }

      if (!allowedCategory.includes((formData.category || '').trim())) {
        setMessage({ type: 'error', text: '❌ Invalid Category. Choose General, OBC, SC or ST.' })
        return
      }

      if (!allowedAdmissionType.includes(formData.admissionType)) {
        setMessage({ type: 'error', text: '❌ Invalid Admission Type. Choose Regular or Private.' })
        return
      }

      if (!allowedMedium.includes(formData.mediumOfStudy)) {
        setMessage({ type: 'error', text: '❌ Invalid Medium of Study. Choose English or Hindi.' })
        return
      }

      if (!allowedClasses.includes(formData.class)) {
        setMessage({ type: 'error', text: '❌ Invalid Class selected.' })
        return
      }

      const normalizeCategory = (val) => {
        const map = { general: 'General', obc: 'OBC', sc: 'SC', st: 'ST' }
        return map[(val || '').toLowerCase()] || 'General'
      }

      const payload = {
        formnumber: formData.formNumber,
        admissionnumber: formData.admissionType === 'Tution' ? null : formData.admissionNumber,
        admissiondate: formData.admissionDate,
        academicyear: formData.academicYear,
        class: formData.class,
        admissiontype: formData.admissionType,
        mediumofstudy: formData.mediumOfStudy,
        studentfullname: formData.studentFullName,
        studentsamagraid: formData.studentSamagraId || null,
        studentaadhaar: formData.studentAadhaar || null,
        udisepen: formData.udisePen || null,
        apaarid: formData.apaarId || null,
        dob: formData.dob,
        gender: genderFinal,
        bloodgroup: formData.bloodGroup,
        category: normalizeCategory(formData.category),
        religion: formData.religion,
        fathername: formData.fatherName,
        fathereducation: formData.fatherEducation,
        fathermobile: formData.fatherMobile,
        fatheraadhaar: formData.fatherAadhaar || null,
        mothername: formData.motherName,
        mothereducation: formData.motherEducation,
        mothermobile: formData.motherMobile,
        motheraadhaar: formData.motherAadhaar || null,
        domicilemp: formData.domicileMp,
        residenttype: formData.residentType,
        bplcardholder: 'No',
        studentdisability: 'No',
        address: formData.address,
        village: formData.village,
        district: formData.district,
        state: formData.state,
        pincode: formData.pinCode,
        numberofsiblings: 0,
        onlygirlchild: 'No',
        ischildtwins: 'No',
        isstudentorphan: 'No',
        isfatherdead: 'No',
        ismotherdead: 'No',
        fatherdisability: 'No',
        motherdisability: 'No',
        fatheroccupation: 'NA',
        meansoflivelihood: 'Non-Govt',
        isfatherretired: 'No',
        motheroccupation: 'NA',
        familyincome: 0,
        // NOT NULL defaults for occupation & residence constraints
        isfathertaxpayer: 'No',
        landmorethan10acres: 'No',
        distancefromschool: 0,
        mothertongue: 'Hindi',
        residenceapplicable: 'No',
        schoolvanapplied: formData.schoolVanApplied,
        photosubmitted: formData.photoSubmitted,
        tcsubmitted: formData.tcSubmitted,
        marksheetsubmitted: formData.marksheetSubmitted,
        aadhaarcardsubmitted: formData.aadhaarCardSubmitted,
        birthcertificatesubmitted: formData.birthCertificateSubmitted,
        bankpassbooksubmitted: formData.bankPassbookSubmitted,
        samagraidsubmitted: formData.samagraIdSubmitted,
        bloodgroupreportsubmitted: formData.bloodGroupReportSubmitted,
        castecertificatesubmitted: formData.casteCertificateSubmitted,
        domicilecertificatesubmitted: formData.domicileCertificateSubmitted,
        incomecertificatesubmitted: formData.incomeCertificateSubmitted,
        bplcardsubmitted: formData.bplCardSubmitted,
        labourcardsubmitted: formData.labourCardSubmitted,
        cwsncertificatesubmitted: formData.cwsnCertificateSubmitted,
        apaaridcardsubmitted: formData.apaarIdCardSubmitted,
        motheraadhaarsubmitted: formData.motherAadhaarSubmitted,
        fatheraadhaarsubmitted: formData.fatherAadhaarSubmitted,
        ladlilaxmiyojanacardsubmitted: formData.ladliLaxmiCardSubmitted,
        classfees: Number(formData.classFees) || 0,
        vanfare: Number(formData.vanFare) || 0,
        totalfees: Number(formData.totalFees) || 0,
        feewaiver: formData.feeWaiver,
        feewaiveramount: Number(formData.feeWaiverAmount) || 0,
        finalfees: Number(formData.finalFees) || 0,
        feedetailsprovided: 'Yes',
        feespaid: 0
      }

      const { error } = await supabase.from('students').insert([payload])
      if (error) throw error

      setMessage({ type: 'success', text: '🎉 Student added successfully!' })

      setTimeout(() => {
        const { nextFormNum, nextAdmissionNum, today } = getNextNumbers()
        setCurrentStep(1)
        setFormData({
          ...initialFormState,
          formNumber: nextFormNum,
          admissionNumber: nextAdmissionNum,
          admissionDate: today
        })
        setMessage(null)
      }, 1500)
    } catch (error) {
      setMessage({ type: 'error', text: '❌ Error: ' + error.message })
    }
  }

  const renderProgressBar = () => {
    const steps = [
      { num: 1, label: 'Form & Admission' },
      { num: 2, label: 'Personal Info' },
      { num: 3, label: 'Parent Info' },
      { num: 4, label: 'Address' },
      { num: 5, label: 'Fees' },
      { num: 6, label: 'Documents' }
    ]

    return (
      <div style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          {steps.map((step) => (
            <div key={step.num} style={{ flex: 1, textAlign: 'center' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: currentStep >= step.num ? '#4CAF50' : '#ddd',
                  color: currentStep >= step.num ? 'white' : '#666',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  margin: '0 auto 5px'
                }}
              >
                {step.num}
              </div>
              <div style={{ fontSize: '12px', color: currentStep >= step.num ? '#4CAF50' : '#666' }}>
                {step.label}
              </div>
            </div>
          ))}
        </div>
        <div style={{ background: '#ddd', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
          <div
            style={{
              background: '#4CAF50',
              height: '100%',
              width: `${(currentStep / totalSteps) * 100}%`,
              transition: 'width 0.3s'
            }}
          />
        </div>
        <div style={{ textAlign: 'center', marginTop: '10px', color: '#666', fontSize: '14px' }}>
          Step {currentStep} of {totalSteps}
        </div>
      </div>
    )
  }

  const renderStep = () => {
    const inputStyle = { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px' }
    const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: '500', color: '#333' }

    switch (currentStep) {
      case 1:
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={labelStyle}>Form Number *</label>
              <input type="text" name="formNumber" value={formData.formNumber} onChange={handleChange} required style={{ ...inputStyle, background: '#f5f5f5' }} readOnly />
            </div>
            <div>
              <label style={labelStyle}>Admission Number *</label>
              <input type="text" name="admissionNumber" value={formData.admissionNumber} onChange={handleChange} required style={{ ...inputStyle, background: '#f5f5f5' }} readOnly={formData.admissionType !== 'Regular'} />
            </div>
            <div>
              <label style={labelStyle}>Admission Date *</label>
              <input type="date" name="admissionDate" value={formData.admissionDate} onChange={handleChange} required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Academic Year *</label>
              <input type="text" name="academicYear" value={formData.academicYear} onChange={handleChange} placeholder="e.g., 2025-26" required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Class *</label>
              <select name="class" value={formData.class} onChange={handleChange} required style={inputStyle}>
                <option value="">Select Class</option>
                {['Nursery', 'LKG', 'UKG', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'].map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Medium of Study *</label>
              <select name="mediumOfStudy" value={formData.mediumOfStudy} onChange={handleChange} required style={inputStyle}>
                <option value="">Select Medium</option>
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Admission Type *</label>
              <select name="admissionType" value={formData.admissionType} onChange={handleChange} required style={inputStyle}>
                <option value="Regular">Regular</option>
                <option value="Tution">Tution</option>
              </select>
            </div>
          </div>
        )

      case 2:
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Student Full Name *</label>
              <input type="text" name="studentFullName" value={formData.studentFullName} onChange={handleChange} required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Roll Number</label>
              <input type="text" name="rollNumber" value={formData.rollNumber} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Date of Birth *</label>
              <input type="date" name="dob" value={formData.dob} onChange={handleChange} required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Gender *</label>
              <select name="gender" value={formData.gender} onChange={handleChange} required style={inputStyle}>
                <option value="">Select Gender</option>
                <option value="Boy">Boy</option>
                <option value="Girl">Girl</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Blood Group</label>
              <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} style={inputStyle}>
                <option value="">Select Blood Group</option>
                {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Category *</label>
              <select name="category" value={formData.category} onChange={handleChange} required style={inputStyle}>
                <option value="">Select Category</option>
                <option value="General">General</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Religion *</label>
              <select name="religion" value={formData.religion} onChange={handleChange} required style={inputStyle}>
                <option value="Hindu">Hindu</option>
                <option value="Muslim">Muslim</option>
                <option value="Jain">Jain</option>
                <option value="Sikh">Sikh</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Student Samagra ID</label>
              <input type="text" name="studentSamagraId" value={formData.studentSamagraId} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Student Aadhaar</label>
              <input type="text" name="studentAadhaar" value={formData.studentAadhaar} onChange={handleChange} pattern="[0-9]{12}" maxLength="12" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>UDISE/PEN Number</label>
              <input type="text" name="udisePen" value={formData.udisePen} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>APAAR ID</label>
              <input type="text" name="apaarId" value={formData.apaarId} onChange={handleChange} style={inputStyle} />
            </div>
          </div>
        )

      case 3:
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Father's Name *</label>
              <input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Father's Education *</label>
              <input type="text" name="fatherEducation" value={formData.fatherEducation} onChange={handleChange} required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Father's Mobile *</label>
              <input type="tel" name="fatherMobile" value={formData.fatherMobile} onChange={handleChange} pattern="[0-9]{10}" maxLength="10" required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Father's Aadhaar</label>
              <input type="text" name="fatherAadhaar" value={formData.fatherAadhaar} onChange={handleChange} pattern="[0-9]{12}" maxLength="12" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Mother's Name</label>
              <input type="text" name="motherName" value={formData.motherName} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Mother's Education</label>
              <input type="text" name="motherEducation" value={formData.motherEducation} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Mother's Mobile</label>
              <input type="tel" name="motherMobile" value={formData.motherMobile} onChange={handleChange} pattern="[0-9]{10}" maxLength="10" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Mother's Aadhaar</label>
              <input type="text" name="motherAadhaar" value={formData.motherAadhaar} onChange={handleChange} pattern="[0-9]{12}" maxLength="12" style={inputStyle} />
            </div>
          </div>
        )

      case 4:
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Address *</label>
              <textarea name="address" value={formData.address} onChange={handleChange} required rows="3" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Village *</label>
              <input type="text" name="village" value={formData.village} onChange={handleChange} required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>District *</label>
              <input type="text" name="district" value={formData.district} onChange={handleChange} required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>State *</label>
              <input type="text" name="state" value={formData.state} onChange={handleChange} required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Pin Code</label>
              <input type="text" name="pinCode" value={formData.pinCode} onChange={handleChange} pattern="[0-9]{6}" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Resident Type *</label>
              <select name="residentType" value={formData.residentType} onChange={handleChange} required style={inputStyle}>
                <option value="Rural">Rural</option>
                <option value="Urban">Urban</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Domicile MP *</label>
              <select name="domicileMp" value={formData.domicileMp} onChange={handleChange} required style={inputStyle}>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>
        )

      case 5:
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div style={{ gridColumn: '1 / -1', background: '#e3f2fd', padding: '15px', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>📊 Fee Calculation</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '14px' }}>
                <div><strong>Class Fees:</strong></div>
                <div>₹{formData.classFees}</div>
                <div><strong>Van Fare:</strong></div>
                <div>₹{formData.vanFare}</div>
                <div><strong>Total Fees:</strong></div>
                <div>₹{formData.totalFees}</div>
                <div><strong>Fee Waiver:</strong></div>
                <div>₹{formData.feeWaiverAmount}</div>
                <div style={{ borderTop: '2px solid #1976d2', paddingTop: '5px' }}><strong>Final Fees:</strong></div>
                <div style={{ borderTop: '2px solid #1976d2', paddingTop: '5px', fontWeight: 'bold', color: '#1976d2' }}>₹{formData.finalFees}</div>
              </div>
            </div>
            <div>
              <label style={labelStyle}>School Van Applied</label>
              <select name="schoolVanApplied" value={formData.schoolVanApplied} onChange={handleChange} style={inputStyle}>
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
            {formData.schoolVanApplied === 'Yes' && (
              <div>
                <label style={labelStyle}>Van Fare (₹)</label>
                <input type="number" name="vanFare" value={formData.vanFare} onChange={handleChange} min="0" style={inputStyle} />
              </div>
            )}
            <div>
              <label style={labelStyle}>Fee Waiver</label>
              <select name="feeWaiver" value={formData.feeWaiver} onChange={handleChange} style={inputStyle}>
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
            {formData.feeWaiver === 'Yes' && (
              <div>
                <label style={labelStyle}>Waiver Amount (₹)</label>
                <input type="number" name="feeWaiverAmount" value={formData.feeWaiverAmount} onChange={handleChange} min="0" max={formData.totalFees} style={inputStyle} />
              </div>
            )}
          </div>
        )

      case 6:
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
            <div style={{ marginBottom: '10px' }}>
              <h4 style={{ color: '#333', fontSize: '18px', marginBottom: '5px' }}>📄 Documents Submitted (Optional)</h4>
              <p style={{ fontSize: '13px', color: '#666' }}>Check all the documents that have been submitted:</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              {[
                { name: 'photoSubmitted', label: '📷 Photo' },
                { name: 'tcSubmitted', label: '📋 Transfer Certificate (TC)' },
                { name: 'marksheetSubmitted', label: '📊 Marksheet' },
                { name: 'aadhaarCardSubmitted', label: '🆔 Student Aadhaar Card' },
                { name: 'birthCertificateSubmitted', label: '🎂 Birth Certificate' },
                { name: 'bankPassbookSubmitted', label: '🏦 Bank Passbook' },
                { name: 'samagraIdSubmitted', label: '🆔 Samagra ID Card' },
                { name: 'bloodGroupReportSubmitted', label: '🩸 Blood Group Report' },
                { name: 'casteCertificateSubmitted', label: '📝 Caste Certificate' },
                { name: 'domicileCertificateSubmitted', label: '🏠 Domicile Certificate' },
                { name: 'incomeCertificateSubmitted', label: '💰 Income Certificate' },
                { name: 'bplCardSubmitted', label: '🎫 BPL Card' },
                { name: 'labourCardSubmitted', label: '🏷️ Labour Card' },
                { name: 'cwsnCertificateSubmitted', label: '♿ CWSN Certificate' },
                { name: 'apaarIdCardSubmitted', label: '🆔 APAAR ID Card' },
                { name: 'motherAadhaarSubmitted', label: '👩 Mother\'s Aadhaar' },
                { name: 'fatherAadhaarSubmitted', label: '👨 Father\'s Aadhaar' },
                { name: 'ladliLaxmiCardSubmitted', label: '👧 Ladli Laxmi Yojana Card' }
              ].map(doc => (
                <div 
                  key={doc.name} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: '8px',
                    background: formData[doc.name] === 'Yes' ? '#e8f5e9' : '#f5f5f5',
                    border: `2px solid ${formData[doc.name] === 'Yes' ? '#4CAF50' : '#ddd'}`,
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    const currentValue = formData[doc.name] === 'Yes' ? 'No' : 'Yes'
                    handleChange({ target: { name: doc.name, value: currentValue } })
                  }}
                >
                  <input
                    type="checkbox"
                    name={doc.name}
                    checked={formData[doc.name] === 'Yes'}
                    onChange={(e) => handleChange({ target: { name: doc.name, value: e.target.checked ? 'Yes' : 'No' } })}
                    style={{ 
                      width: '24px', 
                      height: '24px',
                      cursor: 'pointer',
                      accentColor: '#4CAF50'
                    }}
                  />
                  <label 
                    style={{ 
                      fontSize: '14px',
                      fontWeight: formData[doc.name] === 'Yes' ? '600' : '500',
                      color: formData[doc.name] === 'Yes' ? '#4CAF50' : '#333',
                      cursor: 'pointer',
                      margin: 0
                    }}
                  >
                    {doc.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ marginBottom: '30px', color: '#333', textAlign: 'center' }}>➕ Add New Student</h2>

      {message && (
        <div style={{
          padding: '15px',
          marginBottom: '20px',
          borderRadius: '8px',
          background: message.type === 'success' ? '#d4edda' : '#f8d7da',
          color: message.type === 'success' ? '#155724' : '#721c24',
          border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          {message.text}
        </div>
      )}

      {renderProgressBar()}

      <form onSubmit={currentStep === totalSteps ? handleSubmit : (e) => { e.preventDefault(); nextStep() }}>
        <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
          {renderStep()}
        </div>

        <div style={{ display: 'flex', gap: '15px', justifyContent: 'space-between' }}>
          {currentStep > 1 && (
            <button
              type="button"
              onClick={prevStep}
              style={{
                flex: 1,
                padding: '12px',
                background: '#757575',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '16px'
              }}
            >
              ← Previous
            </button>
          )}
          <button
            type="submit"
            style={{
              flex: 1,
              padding: '12px',
              background: currentStep === totalSteps ? '#4CAF50' : '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '16px'
            }}
          >
            {currentStep === totalSteps ? '✅ Submit' : 'Next →'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddStudentMultiStep
