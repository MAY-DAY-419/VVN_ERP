-- ============================================================================
-- VVN ERP - FRESH DATABASE SETUP
-- ============================================================================
-- This script will DELETE your existing students table and create a new one
-- with the complete admission form structure (100+ fields)
--
-- ⚠️ WARNING: This will PERMANENTLY DELETE all existing student data!
-- ⚠️ Only run this if you want to start completely fresh!
--
-- Run this SQL in your Supabase SQL Editor
-- ============================================================================

-- Step 1: Drop existing table and related objects
DROP TABLE IF EXISTS students CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Step 2: Create the updated_at function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Create the new students table with complete structure
CREATE TABLE students (
    id BIGSERIAL PRIMARY KEY,
    
    -- ========================================================================
    -- FORM & ADMISSION INFORMATION (6 fields)
    -- ========================================================================
    formNumber TEXT UNIQUE NOT NULL,
    admissionNumber TEXT UNIQUE NOT NULL,
    admissionDate DATE NOT NULL,
    academicYear TEXT NOT NULL,
    admissionType TEXT NOT NULL CHECK (admissionType IN ('Regular', 'Private')),
    mediumOfStudy TEXT NOT NULL CHECK (mediumOfStudy IN ('English', 'Hindi')),
    
    -- ========================================================================
    -- STUDENT BASIC INFORMATION (9 fields)
    -- ========================================================================
    studentSamagraId TEXT,
    studentAadhaar TEXT,
    studentFullName TEXT NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('Boy', 'Girl')),
    dob DATE NOT NULL,
    dobInWords TEXT,
    bloodGroup TEXT,
    category TEXT NOT NULL CHECK (category IN ('General', 'OBC', 'SC', 'ST')),
    religion TEXT NOT NULL CHECK (religion IN ('Hindu', 'Muslim', 'Jain', 'Sikh', 'Other')),
    
    -- ========================================================================
    -- FATHER DETAILS (4 fields)
    -- ========================================================================
    fatherName TEXT NOT NULL,
    fatherEducation TEXT NOT NULL,
    fatherMobile TEXT NOT NULL,
    fatherAadhaar TEXT,
    
    -- ========================================================================
    -- MOTHER DETAILS (4 fields)
    -- ========================================================================
    motherName TEXT NOT NULL,
    motherEducation TEXT NOT NULL,
    motherMobile TEXT,
    motherAadhaar TEXT,
    
    -- ========================================================================
    -- DOMICILE & BPL INFORMATION (4 fields)
    -- ========================================================================
    domicileMP TEXT NOT NULL CHECK (domicileMP IN ('Yes', 'No')),
    residentType TEXT NOT NULL CHECK (residentType IN ('Rural', 'Urban')),
    bplCardHolder TEXT NOT NULL CHECK (bplCardHolder IN ('Yes', 'No')),
    bplCardNumber TEXT,
    
    -- ========================================================================
    -- DISABILITY INFORMATION (3 fields)
    -- ========================================================================
    studentDisability TEXT NOT NULL CHECK (studentDisability IN ('Yes', 'No')),
    disabilityType TEXT,
    disabilityPercentage DECIMAL(5, 2),
    
    -- ========================================================================
    -- PHYSICAL INFORMATION (2 fields)
    -- ========================================================================
    studentWeight DECIMAL(5, 2),
    studentHeight DECIMAL(5, 2),
    
    -- ========================================================================
    -- ADDRESS DETAILS (7 fields)
    -- ========================================================================
    address TEXT NOT NULL,
    village TEXT NOT NULL,
    district TEXT NOT NULL,
    division TEXT DEFAULT 'Chambal',
    state TEXT DEFAULT 'Madhya Pradesh',
    pinCode TEXT NOT NULL,
    emailAddress TEXT,
    
    -- ========================================================================
    -- FAMILY DETAILS (9 fields)
    -- ========================================================================
    familyId TEXT,
    numberOfSiblings INTEGER NOT NULL,
    onlyGirlChild TEXT NOT NULL CHECK (onlyGirlChild IN ('Yes', 'No')),
    isChildTwins TEXT NOT NULL CHECK (isChildTwins IN ('Yes', 'No')),
    isStudentOrphan TEXT NOT NULL CHECK (isStudentOrphan IN ('Yes', 'No')),
    isFatherDead TEXT NOT NULL CHECK (isFatherDead IN ('Yes', 'No')),
    isMotherDead TEXT NOT NULL CHECK (isMotherDead IN ('Yes', 'No')),
    fatherDisability TEXT NOT NULL CHECK (fatherDisability IN ('Yes', 'No')),
    motherDisability TEXT NOT NULL CHECK (motherDisability IN ('Yes', 'No')),
    
    -- ========================================================================
    -- OCCUPATION & INCOME DETAILS (8 fields)
    -- ========================================================================
    fatherOccupation TEXT NOT NULL,
    meansOfLivelihood TEXT NOT NULL CHECK (meansOfLivelihood IN ('Govt', 'Non-Govt')),
    isFatherRetired TEXT NOT NULL CHECK (isFatherRetired IN ('Yes', 'No')),
    departmentName TEXT,
    motherOccupation TEXT NOT NULL,
    familyIncome DECIMAL(12, 2) NOT NULL,
    isFatherTaxPayer TEXT NOT NULL CHECK (isFatherTaxPayer IN ('Yes', 'No')),
    landMoreThan10Acres TEXT NOT NULL CHECK (landMoreThan10Acres IN ('Yes', 'No')),
    
    -- ========================================================================
    -- ADDITIONAL INFORMATION (2 fields)
    -- ========================================================================
    distanceFromSchool DECIMAL(5, 2) NOT NULL,
    motherTongue TEXT NOT NULL,
    
    -- ========================================================================
    -- PREVIOUS SCHOOL DETAILS (8 fields - All Optional)
    -- ========================================================================
    previousSchoolUDISE TEXT,
    previousSchoolName TEXT,
    previousClass TEXT,
    previousEnrolmentNumber TEXT,
    previousAdmissionNumber TEXT,
    previousPercentage DECIMAL(5, 2),
    tcNumber TEXT,
    tcDate DATE,
    
    -- ========================================================================
    -- RESIDENCE INFORMATION (3 fields)
    -- ========================================================================
    residenceApplicable TEXT NOT NULL CHECK (residenceApplicable IN ('Yes', 'No')),
    residenceType TEXT,
    residenceSubType TEXT,
    
    -- ========================================================================
    -- STUDENT IDs (2 fields - Optional)
    -- ========================================================================
    udisePen TEXT,
    apaarId TEXT,
    
    -- ========================================================================
    -- BANK DETAILS (4 fields - All Optional)
    -- ========================================================================
    studentBankName TEXT,
    bankIFSC TEXT,
    bankAccountNumber TEXT,
    accountHolder TEXT CHECK (accountHolder IN ('Student', 'Parent', 'Guardian')),
    
    -- ========================================================================
    -- CLASS & TRANSPORT (2 fields)
    -- ========================================================================
    class TEXT NOT NULL CHECK (class IN ('Nursery', 'LKG', 'UKG', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th')),
    schoolVanApplied TEXT NOT NULL CHECK (schoolVanApplied IN ('Yes', 'No')),
    
    -- ========================================================================
    -- DECLARATION (1 field)
    -- ========================================================================
    declarationDate DATE,
    
    -- ========================================================================
    -- DOCUMENTS SUBMITTED (18 fields)
    -- ========================================================================
    photoSubmitted TEXT NOT NULL CHECK (photoSubmitted IN ('Yes', 'No')),
    tcSubmitted TEXT NOT NULL CHECK (tcSubmitted IN ('Yes', 'No')),
    marksheetSubmitted TEXT NOT NULL CHECK (marksheetSubmitted IN ('Yes', 'No')),
    aadhaarCardSubmitted TEXT NOT NULL CHECK (aadhaarCardSubmitted IN ('Yes', 'No')),
    birthCertificateSubmitted TEXT NOT NULL CHECK (birthCertificateSubmitted IN ('Yes', 'No')),
    bankPassbookSubmitted TEXT NOT NULL CHECK (bankPassbookSubmitted IN ('Yes', 'No')),
    samagraIdSubmitted TEXT NOT NULL CHECK (samagraIdSubmitted IN ('Yes', 'No')),
    bloodGroupReportSubmitted TEXT NOT NULL CHECK (bloodGroupReportSubmitted IN ('Yes', 'No')),
    casteCertificateSubmitted TEXT NOT NULL CHECK (casteCertificateSubmitted IN ('Yes', 'No')),
    domicileCertificateSubmitted TEXT NOT NULL CHECK (domicileCertificateSubmitted IN ('Yes', 'No')),
    incomeCertificateSubmitted TEXT NOT NULL CHECK (incomeCertificateSubmitted IN ('Yes', 'No')),
    bplCardSubmitted TEXT NOT NULL CHECK (bplCardSubmitted IN ('Yes', 'No')),
    labourCardSubmitted TEXT NOT NULL CHECK (labourCardSubmitted IN ('Yes', 'No')),
    cwsnCertificateSubmitted TEXT NOT NULL CHECK (cwsnCertificateSubmitted IN ('Yes', 'No')),
    apaarIdCardSubmitted TEXT NOT NULL CHECK (apaarIdCardSubmitted IN ('Yes', 'No')),
    motherAadhaarSubmitted TEXT NOT NULL CHECK (motherAadhaarSubmitted IN ('Yes', 'No')),
    fatherAadhaarSubmitted TEXT NOT NULL CHECK (fatherAadhaarSubmitted IN ('Yes', 'No')),
    ladliLaxmiYojanaCardSubmitted TEXT NOT NULL CHECK (ladliLaxmiYojanaCardSubmitted IN ('Yes', 'No')),
    
    -- ========================================================================
    -- SYSTEM TIMESTAMPS (2 fields)
    -- ========================================================================
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Step 4: Create indexes for fast searching and performance
CREATE INDEX idx_students_form_number ON students(formNumber);
CREATE INDEX idx_students_admission_number ON students(admissionNumber);
CREATE INDEX idx_students_student_name ON students(studentFullName);
CREATE INDEX idx_students_father_mobile ON students(fatherMobile);
CREATE INDEX idx_students_village ON students(village);
CREATE INDEX idx_students_class ON students(class);
CREATE INDEX idx_students_admission_date ON students(admissionDate);
CREATE INDEX idx_students_academic_year ON students(academicYear);
CREATE INDEX idx_students_category ON students(category);
CREATE INDEX idx_students_gender ON students(gender);

-- Step 5: Create trigger for automatic updated_at timestamp
CREATE TRIGGER update_students_updated_at
    BEFORE UPDATE ON students
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Step 6: Enable Row Level Security (RLS)
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Step 7: Create policy to allow all operations
-- Note: In production, you should make this more restrictive based on your needs
CREATE POLICY "Allow all operations on students table"
    ON students
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- EXPENSES TABLE
-- ============================================================================

-- Step 8: Create the expenses table
CREATE TABLE expenses (
    id BIGSERIAL PRIMARY KEY,
    expenseDate DATE NOT NULL,
    expenseCategory TEXT NOT NULL,
    expenseDescription TEXT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    paymentMode TEXT NOT NULL CHECK (paymentMode IN ('Cash', 'Online', 'Cheque', 'UPI')),
    paidTo TEXT,
    billNumber TEXT,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Step 9: Create indexes for expenses table
CREATE INDEX idx_expenses_date ON expenses(expenseDate);
CREATE INDEX idx_expenses_category ON expenses(expenseCategory);
CREATE INDEX idx_expenses_amount ON expenses(amount);

-- Step 10: Create trigger for automatic updated_at timestamp on expenses
CREATE TRIGGER update_expenses_updated_at
    BEFORE UPDATE ON expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Step 11: Enable Row Level Security for expenses
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Step 12: Create policy for expenses table
CREATE POLICY "Allow all operations on expenses table"
    ON expenses
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these queries after the setup to verify everything is working:

-- Check table structure
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'students'
-- ORDER BY ordinal_position;

-- Check indexes
-- SELECT indexname, indexdef
-- FROM pg_indexes
-- WHERE tablename = 'students';

-- Check constraints
-- SELECT constraint_name, constraint_type
-- FROM information_schema.table_constraints
-- WHERE table_name = 'students';

-- ============================================================================
-- SAMPLE DATA (Optional - Uncomment to insert test record)
-- ============================================================================
/*
INSERT INTO students (
    formNumber, admissionNumber, admissionDate, academicYear, admissionType, mediumOfStudy,
    studentSamagraId, studentFullName, gender, dob, dobInWords, bloodGroup, category, religion,
    fatherName, fatherEducation, fatherMobile, fatherAadhaar,
    motherName, motherEducation, motherMobile,
    domicileMP, residentType, bplCardHolder,
    studentDisability,
    address, village, district, pinCode,
    numberOfSiblings, onlyGirlChild, isChildTwins, isStudentOrphan, isFatherDead, isMotherDead,
    fatherDisability, motherDisability,
    fatherOccupation, meansOfLivelihood, isFatherRetired, motherOccupation, familyIncome,
    isFatherTaxPayer, landMoreThan10Acres, distanceFromSchool, motherTongue,
    residenceApplicable, class, schoolVanApplied, declarationDate,
    photoSubmitted, tcSubmitted, marksheetSubmitted, aadhaarCardSubmitted,
    birthCertificateSubmitted, bankPassbookSubmitted, samagraIdSubmitted,
    bloodGroupReportSubmitted, casteCertificateSubmitted, domicileCertificateSubmitted,
    incomeCertificateSubmitted, bplCardSubmitted, labourCardSubmitted,
    cwsnCertificateSubmitted, apaarIdCardSubmitted, motherAadhaarSubmitted,
    fatherAadhaarSubmitted, ladliLaxmiYojanaCardSubmitted
) VALUES (
    '00001', 'ADM00001', '2025-04-01', '2025-2026', 'Regular', 'English',
    '123456789', 'Rahul Kumar Singh', 'Boy', '2015-05-15', '15th May, 2015', 'A+', 'General', 'Hindu',
    'Rajesh Kumar Singh', 'Graduate', '9876543210', '123456789012',
    'Sunita Singh', '12th', '9876543211',
    'Yes', 'Rural', 'No',
    'No',
    'House No 123, Main Road, Near Temple', 'Konhar', 'Bhind', '477557',
    1, 'No', 'No', 'No', 'No', 'No',
    'No', 'No',
    'Farmer', 'Non-Govt', 'No', 'Homemaker', 250000.00,
    'No', 'No', 2.5, 'Hindi',
    'No', '1st', 'Yes', '2025-04-01',
    'Yes', 'No', 'Yes', 'Yes',
    'Yes', 'No', 'Yes',
    'No', 'Yes', 'Yes',
    'Yes', 'No', 'No',
    'No', 'No', 'Yes',
    'Yes', 'No'
);
*/

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================
-- Your fresh database is now ready to use!
-- 
-- Next steps:
-- 1. Verify the table was created: Check Table Editor in Supabase
-- 2. Test the application by adding a new student
-- 3. Make sure your environment variables are set:
--    - VITE_SUPABASE_URL
--    - VITE_SUPABASE_KEY (Anon/Public key)
-- 4. Deploy/restart your application if needed
-- ============================================================================
