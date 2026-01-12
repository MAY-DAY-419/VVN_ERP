-- ============================================================================
-- VVN ERP - CLEAR ALL DATA (START FRESH)
-- ============================================================================
-- This script will DELETE all data from all tables
-- Table structures will remain intact, only data will be removed
--
-- ⚠️ WARNING: This will PERMANENTLY DELETE all data!
-- ⚠️ Run this in your Supabase SQL Editor to start fresh
-- ============================================================================

-- Disable triggers temporarily (optional, for faster deletion)
SET session_replication_role = replica;

-- Clear all data from tables
TRUNCATE TABLE transactions CASCADE;
TRUNCATE TABLE expenses CASCADE;
TRUNCATE TABLE students CASCADE;

-- Reset auto-increment sequences to start from 1
ALTER SEQUENCE students_id_seq RESTART WITH 1;
ALTER SEQUENCE expenses_id_seq RESTART WITH 1;
ALTER SEQUENCE transactions_id_seq RESTART WITH 1;

-- Re-enable triggers
SET session_replication_role = DEFAULT;

-- Verify tables are empty
SELECT 'students' as table_name, COUNT(*) as row_count FROM students
UNION ALL
SELECT 'expenses', COUNT(*) FROM expenses
UNION ALL
SELECT 'transactions', COUNT(*) FROM transactions;

-- ============================================================================
-- SUCCESS! All data has been cleared. Tables are ready for fresh data.
-- ============================================================================
