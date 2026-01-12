-- ============================================================================
-- COMPLETE SCHEMA MIGRATION & VERIFICATION
-- ============================================================================
-- This script ensures ALL tables and columns exist with correct definitions
-- Run this in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- STEP 1: FIX EXPENSES TABLE
-- ============================================================================

-- Drop and recreate expenses table to ensure correct schema
DROP TABLE IF EXISTS expenses CASCADE;

CREATE TABLE expenses (
    id BIGSERIAL PRIMARY KEY,
    expenseDate DATE NOT NULL,
    expenseCategory TEXT NOT NULL,
    expenseDescription TEXT NOT NULL,
    amount DECIMAL(12, 2),
    paymentMode TEXT NOT NULL CHECK (paymentMode IN ('Cash', 'Online', 'Cheque', 'UPI')),
    paidTo TEXT,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for expenses
CREATE INDEX idx_expenses_date ON expenses(expenseDate);
CREATE INDEX idx_expenses_category ON expenses(expenseCategory);
CREATE INDEX idx_expenses_amount ON expenses(amount);

-- Enable RLS
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "Allow all operations on expenses table"
    ON expenses
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Trigger for updated_at
CREATE TRIGGER update_expenses_updated_at
    BEFORE UPDATE ON expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STEP 2: ENSURE STUDENTS TABLE HAS ALL FEE COLUMNS
-- ============================================================================

ALTER TABLE students ADD COLUMN IF NOT EXISTS classFees DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE students ADD COLUMN IF NOT EXISTS vanFare DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE students ADD COLUMN IF NOT EXISTS totalFees DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE students ADD COLUMN IF NOT EXISTS feesPaid DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE students ADD COLUMN IF NOT EXISTS feeWaiver TEXT DEFAULT 'No' CHECK (feeWaiver IN ('Yes', 'No'));
ALTER TABLE students ADD COLUMN IF NOT EXISTS feeWaiverAmount DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE students ADD COLUMN IF NOT EXISTS finalFees DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE students ADD COLUMN IF NOT EXISTS feeDetailsProvided TEXT DEFAULT 'Yes' CHECK (feeDetailsProvided IN ('Yes', 'No'));

-- STEP 4: CREATE TRANSACTIONS LEDGER TABLE (UNIFIED HISTORY)
CREATE TABLE IF NOT EXISTS transactions (
    id BIGSERIAL PRIMARY KEY,
    transactionDate DATE NOT NULL,
    transactionType TEXT NOT NULL CHECK (transactionType IN ('Fee', 'Expense', 'Salary', 'Other')),
    amount DECIMAL(12,2) NOT NULL,
    paymentMode TEXT CHECK (paymentMode IN ('Cash', 'Online', 'Cheque', 'UPI')),
    description TEXT,
    reference TEXT,
    studentId BIGINT,
    expenseId BIGINT,
    staffId BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transactionDate);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(transactionType);
CREATE INDEX IF NOT EXISTS idx_transactions_student ON transactions(studentId);
-- ============================================================================
-- STEP 3: FIX ADMISSION TYPE CHECK CONSTRAINT
-- ============================================================================

-- Drop old constraint if exists and add updated one
ALTER TABLE students DROP CONSTRAINT IF EXISTS students_admissiontype_check;
ALTER TABLE students ADD CONSTRAINT students_admissiontype_check 
    CHECK (admissionType IN ('Regular', 'Tution'));

-- Make admissionNumber nullable for Tution entries
ALTER TABLE students ALTER COLUMN admissionNumber DROP NOT NULL;

-- ============================================================================
-- STEP 4: VERIFY TABLE STRUCTURE
-- ============================================================================

-- Check students table columns (uncomment to run)
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'students'
-- ORDER BY ordinal_position;

-- Check expenses table columns (uncomment to run)
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'expenses'
-- ORDER BY ordinal_position;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
