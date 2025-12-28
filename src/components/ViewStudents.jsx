import React, { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'
import { supabase, supabaseReady } from '../supabaseClient'

function ViewStudents() {
  const [students, setStudents] = useState([])
  const [filteredStudents, setFilteredStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

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

    const filtered = students.filter(student =>
      student.fullname.toLowerCase().includes(term) ||
      student.rollnumber.toLowerCase().includes(term) ||
      student.village.toLowerCase().includes(term) ||
      (student.fathername && student.fathername.toLowerCase().includes(term)) ||
      student.class.toLowerCase().includes(term)
    )

    setFilteredStudents(filtered)
  }

  const getSiblings = (student) => {
    return students.filter(s => 
      s.contactnumber === student.contactnumber && s.id !== student.id
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
          placeholder="🔍 Search by name, roll number, class, village, or parent..."
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
                <th>Name</th>
                <th>Class/Div</th>
                <th>Guardian</th>
                <th>Contact</th>
                <th>Village</th>
                <th>Admission</th>
                <th>Van</th>
                <th>Siblings</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => {
                const siblings = getSiblings(student)
                const hasSiblings = siblings.length > 0

                return (
                  <tr key={student.id}>
                    <td>{student.rollnumber || student.rollNumber}</td>
                    <td>{student.fullname || student.fullName}</td>
                    <td>{student.class} / {student.division}</td>
                    <td>{student.fathername || student.fatherName || student.mothername || student.motherName || '—'}</td>
                    <td>{student.contactnumber || student.contactNumber}</td>
                    <td>{student.village}</td>
                    <td>
                      <span className={`badge badge-${(student.admissiontype || student.admissionType).toLowerCase()}`}>
                        {student.admissiontype || student.admissionType}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${(student.vanapplied || student.vanApplied).toLowerCase()}`}>
                        {student.vanapplied || student.vanApplied}
                      </span>
                    </td>
                    <td>
                      {hasSiblings ? (
                        <>
                          <span className="badge siblings-badge">
                            {siblings.length} sibling(s)
                          </span>
                          <br />
                          <small style={{ color: '#666' }}>
                            {siblings.map(s => s.fullname).join(', ')}
                          </small>
                        </>
                      ) : (
                        'None'
                      )}
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
  // Extract table rows from DOM and build data for Excel
  const tableRows = Array.from(document.querySelectorAll('.students-table tbody tr')).map((tr) => {
    const tds = tr.querySelectorAll('td')
    if (!tds || tds.length < 9) return null
    return {
      rollNumber: tds[0].innerText,
      fullName: tds[1].innerText,
      classDivision: tds[2].innerText,
      parentName: tds[3].innerText,
      contactNumber: tds[4].innerText,
      village: tds[5].innerText,
      admissionType: tds[6].innerText,
      vanApplied: tds[7].innerText,
      siblings: tds[8].innerText
    }
  }).filter(Boolean)

  exportToExcelWrapper(tableRows)
}
