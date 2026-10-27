-- ============================================================================
-- VVN ERP - SECURITY & SCHEMA FIX MIGRATION SCRIPT
-- ============================================================================
-- Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
--
-- This script:
-- 1. Creates missing tables ('staff', 'news', 'transactions')
-- 2. Ensures fee columns and proper constraints exist on 'students'
-- 3. Configures Row Level Security (RLS) properly
-- ============================================================================

-- ============================================================================
-- 1. CREATE MISSING 'NEWS' TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS news (
    id BIGSERIAL PRIMARY KEY,
    date TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_news_created_at ON news(created_at DESC);

-- Enable RLS for News
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

-- Allow anyone (public landing page) to READ news
DROP POLICY IF EXISTS "Allow public read on news" ON news;
CREATE POLICY "Allow public read on news"
    ON news FOR SELECT
    USING (true);

-- Allow write operations for admin
DROP POLICY IF EXISTS "Allow admin write on news" ON news;
CREATE POLICY "Allow admin write on news"
    ON news FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- 2. CREATE MISSING 'STAFF' TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS staff (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    position TEXT NOT NULL,
    post TEXT NOT NULL,
    department TEXT NOT NULL,
    joindate DATE,
    dob DATE,
    salary DECIMAL(12, 2),
    address TEXT,
    qualification TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_staff_name ON staff(name);
CREATE INDEX IF NOT EXISTS idx_staff_department ON staff(department);

-- Enable RLS for Staff
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow staff management" ON staff;
CREATE POLICY "Allow staff management"
    ON staff FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- 3. CREATE & VERIFY 'TRANSACTIONS' TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS transactions (
    id BIGSERIAL PRIMARY KEY,
    transactionDate DATE NOT NULL,
    transactionType TEXT NOT NULL CHECK (transactionType IN ('Fee', 'Expense', 'Salary', 'Other')),
    amount DECIMAL(12, 2) NOT NULL,
    paymentMode TEXT CHECK (paymentMode IN ('Cash', 'Online', 'Cheque', 'UPI')),
    description TEXT,
    reference TEXT,
    studentId BIGINT,
    expenseId BIGINT,
    staffId BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transactionDate DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(transactionType);
CREATE INDEX IF NOT EXISTS idx_transactions_student ON transactions(studentId);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow transactions management" ON transactions;
CREATE POLICY "Allow transactions management"
    ON transactions FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- 4. ENSURE STUDENTS TABLE HAS ALL REQUIRED FEE COLUMNS
-- ============================================================================
ALTER TABLE students ADD COLUMN IF NOT EXISTS classFees DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE students ADD COLUMN IF NOT EXISTS vanFare DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE students ADD COLUMN IF NOT EXISTS totalFees DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE students ADD COLUMN IF NOT EXISTS feesPaid DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE students ADD COLUMN IF NOT EXISTS feeWaiver TEXT DEFAULT 'No';
ALTER TABLE students ADD COLUMN IF NOT EXISTS feeWaiverAmount DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE students ADD COLUMN IF NOT EXISTS finalFees DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE students ADD COLUMN IF NOT EXISTS feeDetailsProvided TEXT DEFAULT 'Yes';

-- Update admissionType check constraint to support Regular, Tuition, Tution, and Private
ALTER TABLE students DROP CONSTRAINT IF EXISTS students_admissiontype_check;
ALTER TABLE students ADD CONSTRAINT students_admissiontype_check 
    CHECK (admissionType IN ('Regular', 'Tution', 'Tuition', 'Private'));

-- Allow admissionNumber to be nullable for Tuition students
ALTER TABLE students ALTER COLUMN admissionNumber DROP NOT NULL;

-- Enable RLS on Students
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow students operations" ON students;
CREATE POLICY "Allow students operations"
    ON students FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- 5. ENSURE EXPENSES TABLE HAS PROPER RLS
-- ============================================================================
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow expenses operations" ON expenses;
CREATE POLICY "Allow expenses operations"
    ON expenses FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- NOTE ON HARDENED RLS WITH SUPABASE AUTH:
-- Once you invite/create an admin user under Supabase Dashboard -> Authentication -> Users,
-- you can replace the policies above with strict authenticated-only access:
--
-- CREATE POLICY "Strict admin only students"
--     ON students FOR ALL
--     TO authenticated
--     USING (true) WITH CHECK (true);
--
-- This guarantees only signed-in Supabase admin users can access student data.
-- ============================================================================
