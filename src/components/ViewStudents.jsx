import React, { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'
import { supabase, supabaseReady } from '../supabaseClient'

function ViewStudents() {
  const [students, setStudents] = useState([])
  const [filteredStudents, setFilteredStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => {
    // expose data for export action
    if (typeof window !== 'undefined') {
      window.__VIEW_STUDENTS__ = filteredStudents.map(s => ({
        RollNo: s.rollnumber || '',
        FormNo: s.formnumber || '',
        Name: s.studentfullname || s.fullname || '',
        FatherName: s.fathername || '',
        Village: s.village || '',
        Mobile: s.fathermobile || s.contactnumber || '',
        Class: s.class || '',
        Medium: s.medium || '',
        TotalFees: s.totalfees || 0,
        FeesPaid: s.feespaid || 0
      }))
    }
  }, [filteredStudents])

  useEffect(() => {
    loadStudents()
  }, [])

  const loadStudents = async () => {
    try {
      if (!supabaseReady) {
        console.error('Supabase not configured. Skipping students load.')
        setLoading(false)
        return
      }
      const { data, error } = await supabase
        .from('students')
        .select('*')

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
      const vill = (student.village || '').toLowerCase()
      return name.includes(term) || vill.includes(term)
    })

    setFilteredStudents(filtered)
  }

  const getSiblings = (student) => {
    return students.filter(s => 
      (s.fathermobile === student.fathermobile && student.fathermobile) && s.id !== student.id
    )
  }

  if (loading) {
    return <div className="loading">Loading students...</div>
  }

  return (
    <div className="container">
      <h2 style={{ marginBottom: '20px', color: '#333' }}>👥 All Students</h2>
      
      <div className="search-bar">
        <input
          type="text"
          placeholder="🔍 Search by name, roll number, or village..."
          value={searchTerm}
          onChange={handleSearch}
        />
        <button className="btn" style={{ maxWidth: 220 }} onClick={() => exportToExcel()}>
          ⬇️ Export to Excel
        </button>
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
                <th>Form No</th>
                <th>Student Name</th>
                <th>Class</th>
                <th>Father Name</th>
                <th>Mobile</th>
                <th>Samagra ID</th>
                <th>Village</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => {
                const siblings = getSiblings(student)
                return (
                  <tr key={student.id}>
                    <td>{student.rollnumber || '—'}</td>
                    <td>{student.formnumber || '—'}</td>
                    <td><strong>{student.studentfullname || student.fullname || '—'}</strong></td>
                    <td>{student.class || '—'}</td>
                    <td>{student.fathername || '—'}</td>
                    <td>{student.fathermobile || student.contactnumber || '—'}</td>
                    <td>{student.studentsamagraid || '—'}</td>
                    <td>{student.village || '—'}</td>
                    <td>
                      <button 
                        className="btn-small" 
                        onClick={() => {
                          setSelectedStudent(student)
                          setShowDetailModal(true)
                        }}
                        style={{ padding: '5px 12px', fontSize: '13px' }}
                      >
                        👁️ View
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
      
      <p style={{ marginTop: '20px', textAlign: 'center', color: '#666' }}>
        Total: {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
      </p>

      {/* Detail Modal */}
      {showDetailModal && selectedStudent && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: '#fff', padding: 24, borderRadius: 8, width: '90%', maxWidth: 700, maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginTop: 0, color: '#333' }}>👁️ Student Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <DetailRow label="Form No" value={selectedStudent.formnumber} />
              <DetailRow label="Admission No" value={selectedStudent.admissionnumber} />
              <DetailRow label="Roll No" value={selectedStudent.rollnumber} />
              <DetailRow label="Name" value={selectedStudent.studentfullname || selectedStudent.fullname} />
              <DetailRow label="DOB" value={selectedStudent.dob} />
              <DetailRow label="Gender" value={selectedStudent.gender} />
              <DetailRow label="Blood Group" value={selectedStudent.bloodgroup} />
              <DetailRow label="Category" value={selectedStudent.category} />
              <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #e0e0e0', paddingTop: 10, marginTop: 5 }}>
                <strong style={{ color: '#1976d2' }}>📋 Student IDs</strong>
              </div>
              <DetailRow label="Samagra ID" value={selectedStudent.studentsamagraid} />
              <DetailRow label="Student Aadhaar" value={selectedStudent.studentaadhaar} />
              <DetailRow label="UDISE/PEN" value={selectedStudent.udisepen} />
              <DetailRow label="APAAR ID" value={selectedStudent.apaarid} />
              <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #e0e0e0', paddingTop: 10, marginTop: 5 }}>
                <strong style={{ color: '#1976d2' }}>👨‍👩‍👧 Parent Details</strong>
              </div>
              <DetailRow label="Father" value={selectedStudent.fathername} />
              <DetailRow label="Father's Aadhaar" value={selectedStudent.fatheraadhaar} />
              <DetailRow label="Father's Mobile" value={selectedStudent.fathermobile || selectedStudent.contactnumber} />
              <DetailRow label="Mother" value={selectedStudent.mothername} />
              <DetailRow label="Mother's Aadhaar" value={selectedStudent.motheraadhaar} />
              <DetailRow label="Mother's Mobile" value={selectedStudent.mothermobile} />
              <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #e0e0e0', paddingTop: 10, marginTop: 5 }}>
                <strong style={{ color: '#1976d2' }}>🏫 Academic Details</strong>
              </div>
              <DetailRow label="Class" value={selectedStudent.class} />
              <DetailRow label="Medium" value={selectedStudent.mediumofstudy} />
              <DetailRow label="Admission Date" value={selectedStudent.admissiondate} />
              <DetailRow label="Academic Year" value={selectedStudent.academicyear} />
              <DetailRow label="Village" value={selectedStudent.village} />
              <DetailRow label="Address" value={selectedStudent.address} />
              <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #e0e0e0', paddingTop: 10, marginTop: 5 }}>
                <strong style={{ color: '#1976d2' }}>💰 Fee Details</strong>
              </div>
              <DetailRow label="Total Fees" value={selectedStudent.totalfees ? `₹${selectedStudent.totalfees}` : '—'} />
              <DetailRow label="Fees Paid" value={selectedStudent.feespaid ? `₹${selectedStudent.feespaid}` : '—'} />
            </div>
            <div style={{ marginTop: 20, textAlign: 'right' }}>
              <button
                className="btn"
                onClick={() => setShowDetailModal(false)}
                style={{ background: '#f44336', color: '#fff' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ViewStudents

function exportToExcelWrapper(rows) {
  const sheet = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, sheet, 'Students')
  XLSX.writeFile(wb, 'VIPIN_VIDHYA_NIKETAN_Students.xlsx')
}

function exportToExcel() {
  const rows = window.__VIEW_STUDENTS__ || []
  exportToExcelWrapper(rows)
}

// Simple detail display row
function DetailRow({ label, value }) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <strong style={{ minWidth: 130, color: '#555' }}>{label}:</strong>
      <span style={{ color: '#222' }}>{value || '—'}</span>
    </div>
  )
}
