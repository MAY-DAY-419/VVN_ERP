# VVN ERP - Complete Schema Documentation

## 1. EXPENSES TABLE

### Database Columns (Supabase):
```
id              BIGSERIAL PRIMARY KEY
expenseDate     DATE NOT NULL
expenseCategory TEXT NOT NULL
expenseDescription TEXT NOT NULL
amount          DECIMAL(12, 2) [NULLABLE - can be NULL]
paymentMode     TEXT NOT NULL (values: 'Cash', 'Online', 'Cheque', 'UPI')
paidTo          TEXT [NULLABLE]
remarks         TEXT [NULLABLE]
created_at      TIMESTAMP WITH TIME ZONE
updated_at      TIMESTAMP WITH TIME ZONE
```

### Component Fields (Expenses.jsx):
```javascript
{
  expenseDate: '',           // DATE
  expenseCategory: '',       // TEXT
  expenseDescription: '',    // TEXT
  amount: '',                // DECIMAL (converted to number before insert)
  paymentMode: '',           // TEXT
  paidTo: '',                // TEXT
  remarks: ''                // TEXT
}
```

### ✅ Alignment: CORRECT
- All fields match database columns
- billNumber has been removed from both DB and component
- Null handling: amount converts empty string to null before insert

---

## 2. STUDENTS TABLE

### Key Sections:

#### Form & Admission Information:
```
formNumber          TEXT UNIQUE NOT NULL
admissionNumber     TEXT UNIQUE (NOW NULLABLE for Tution)
admissionDate       DATE NOT NULL
academicYear        TEXT NOT NULL
admissionType       TEXT NOT NULL (values: 'Regular', 'Tution')
mediumOfStudy       TEXT NOT NULL (values: 'English', 'Hindi')
class               TEXT NOT NULL (values: 'Nursery' through '8th')
```

#### Fees Information (NEW):
```
feeDetailsProvided  TEXT (values: 'Yes', 'No')
classFees           DECIMAL(10, 2)
vanFare             DECIMAL(10, 2)
totalFees           DECIMAL(10, 2)
feeWaiver           TEXT (values: 'Yes', 'No')
feeWaiverAmount     DECIMAL(10, 2)
finalFees           DECIMAL(10, 2)
schoolVanApplied    TEXT (values: 'Yes', 'No')
```

#### Student Basic Info:
```
studentSamagraId            TEXT
studentAadhaar              TEXT
studentFullName             TEXT NOT NULL
gender                      TEXT NOT NULL (values: 'Boy', 'Girl')
dob                         DATE NOT NULL
dobInWords                  TEXT
bloodGroup                  TEXT
category                    TEXT NOT NULL (values: 'General', 'OBC', 'SC', 'ST')
religion                    TEXT NOT NULL (values: 'Hindu', 'Muslim', 'Jain', 'Sikh', 'Other')
```

#### Document Submission (18 fields):
```
photoSubmitted                      TEXT NOT NULL
tcSubmitted                         TEXT NOT NULL
marksheetSubmitted                  TEXT NOT NULL
aadhaarCardSubmitted                TEXT NOT NULL
birthCertificateSubmitted           TEXT NOT NULL
bankPassbookSubmitted               TEXT NOT NULL
samagraIdSubmitted                  TEXT NOT NULL
bloodGroupReportSubmitted           TEXT NOT NULL
casteCertificateSubmitted           TEXT NOT NULL
domicileCertificateSubmitted        TEXT NOT NULL
incomeCertificateSubmitted          TEXT NOT NULL
bplCardSubmitted                    TEXT NOT NULL
labourCardSubmitted                 TEXT NOT NULL
cwsnCertificateSubmitted            TEXT NOT NULL
apaarIdCardSubmitted                TEXT NOT NULL
motherAadhaarSubmitted              TEXT NOT NULL
fatherAadhaarSubmitted              TEXT NOT NULL
ladliLaxmiYojanaCardSubmitted       TEXT NOT NULL
```

### Component Field Mapping (AddStudent.jsx):
All field names in formData state match database column names exactly:
- Database uses camelCase (e.g., `studentFullName`)
- Component uses camelCase (e.g., `studentFullName`)
- Insert converts to lowercase for Postgres compatibility

### ✅ Alignment: CORRECT
- All 100+ fields present in database
- All fields correctly referenced in component
- Lowercase mapping in insert operation handles any casing mismatches

---

## 3. CRITICAL FIXES APPLIED

### Database Issues Fixed:
✅ expenses table: Created with correct columns (NO billNumber)
✅ students table: Added missing fee columns (classFees, vanFare, etc.)
✅ students table: Made admissionNumber nullable for Tution type
✅ students table: Updated admissionType CHECK to include 'Tution'

### Component Issues Fixed:
✅ Expenses.jsx: Removed billNumber from state, form, and table
✅ Expenses.jsx: Fixed amount handling (null for empty values)
✅ AddStudent.jsx: Lowercase key mapping in insert payload
✅ AddStudent.jsx: Lowercase select columns (formnumber, admissionnumber)
✅ AddStudent.jsx: Tution logic (no admission number for Tution)

---

## 4. HOW TO FIX SCHEMA MISMATCH

### Step 1: Run Migration SQL
Copy the content from `complete-schema-migration.sql` and run it in Supabase SQL Editor:
- This creates the correct expenses table structure
- This adds any missing fee columns to students table
- This updates constraints for Tution support

### Step 2: Verify Tables
In Supabase Table Editor, check:
1. **expenses** table has: expenseDate, expenseCategory, expenseDescription, amount, paymentMode, paidTo, remarks
2. **students** table has: all 100+ fields including fee columns

### Step 3: Test
1. Try adding an expense - should work without "column not found" errors
2. Try adding a student - should save all data correctly
3. Check Tution type - should not require admission number

---

## 5. KEY DIFFERENCES

| Aspect | AddStudent | Expenses |
|--------|-----------|----------|
| Column Naming | camelCase (database) → lowercase (insert) | camelCase (direct) |
| Empty Numbers | Empty strings → null conversion | Empty amount → null |
| Auto-increment | Form/Admission numbers | Not applicable |
| Validation | Extensive (100+ fields) | Minimal (7 fields) |
| RLS Policy | Allow all | Allow all |

---

## 6. NEXT STEPS IF ERRORS PERSIST

If you still see "column not found" errors:

1. **Verify table exists**: 
   - Go to Supabase → Table Editor
   - Check if `expenses` table is listed
   - Check if it has the correct columns

2. **Clear schema cache**:
   - Some Supabase clients cache schema
   - Try refreshing the Supabase client or restarting the dev server

3. **Check insert data**:
   - Open browser Console (F12)
   - Look at network tab when submitting
   - Check the exact payload being sent

4. **Run fresh migration**:
   - If tables don't exist, run `complete-schema-migration.sql` first
   - Then run `fresh-database-setup.sql` if needed for students table

---

Generated: 2025-12-29
