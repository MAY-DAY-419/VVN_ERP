# VVN ERP - Database Setup Guide

## 📋 Overview
The VVN ERP system now includes a comprehensive admission form with **100+ fields** covering all aspects of student enrollment. The database has been completely restructured to support all these fields.

## 🔄 Two Setup Options

### Option 1: Fresh Installation (Recommended for New Projects)
If you're setting up a **new database** or want to **start fresh**:

1. **Go to Supabase Dashboard**
   - Navigate to your project at [https://supabase.com](https://supabase.com)
   - Go to SQL Editor

2. **Run the Setup Script**
   - Open `supabase-setup.sql`
   - Copy the entire content
   - Paste into Supabase SQL Editor
   - Click "Run"

3. **Verify**
   - Go to Table Editor
   - Check that the `students` table has all the new columns
   - Verify indexes are created

### Option 2: Migration (For Existing Databases)
If you have an **existing database** with student data:

⚠️ **WARNING: Backup your database first!**

1. **Backup Your Data**
   - Go to Supabase Dashboard → Database → Backups
   - Create a manual backup
   - Or export your students table as CSV

2. **Run the Migration Script**
   - Open `database-migration.sql`
   - Copy the entire content
   - Paste into Supabase SQL Editor
   - Click "Run"

3. **Verify Migration**
   - Check that all new columns were added
   - Verify existing data is intact
   - Test a few student records

4. **Optional: Clean Up Old Columns**
   - Review the commented-out DROP statements at the end of migration script
   - Uncomment if you want to remove old columns
   - Only do this after verifying everything works!

## 🗃️ Database Schema Structure

### Main Sections (100+ Fields)

1. **Form & Admission Information** (6 fields)
   - Form Number (auto-generated)
   - Admission Number (auto-generated)
   - Admission Date
   - Academic Year
   - Admission Type (Regular/Private)
   - Medium of Study (English/Hindi)

2. **Student Basic Information** (9 fields)
   - Student Samagra ID, Aadhaar
   - Full Name, Gender, DOB
   - Blood Group, Category, Religion

3. **Parent Details** (8 fields)
   - Father: Name, Education, Mobile, Aadhaar
   - Mother: Name, Education, Mobile, Aadhaar

4. **Domicile & BPL** (4 fields)
   - Domicile, Resident Type
   - BPL Card Holder, BPL Card Number

5. **Disability Information** (3 fields)
   - Student Disability, Type, Percentage

6. **Physical Information** (2 fields)
   - Weight, Height

7. **Address Details** (7 fields)
   - Address, Village, District, Division, State, PIN, Email

8. **Family Details** (9 fields)
   - Family ID, Siblings count
   - Various family status fields

9. **Occupation & Income** (8 fields)
   - Father/Mother occupation
   - Income, Tax payer status, Land ownership

10. **Additional Information** (2 fields)
    - Distance from school, Mother tongue

11. **Previous School Details** (8 fields)
    - UDISE, School name, Class, Enrolment number, etc.

12. **Residence Information** (3 fields)
    - Applicable, Type, Sub-Type

13. **Student IDs** (2 fields)
    - UDISE PEN, APAAR ID

14. **Bank Details** (4 fields)
    - Bank name, IFSC, Account number, Holder

15. **Class & Transport** (2 fields)
    - Class, School Van Applied

16. **Declaration** (1 field)
    - Declaration Date

17. **Documents Submitted** (18 fields)
    - Photo, TC, Marksheet, Aadhaar Card, etc.

## 🔐 Security Settings

The database includes:
- **Row Level Security (RLS)** enabled
- Default policy allowing all operations (modify for production)
- Automatic timestamps (created_at, updated_at)
- Unique constraints on form and admission numbers
- Check constraints for all dropdown fields

## 📊 Indexes for Performance

Indexes created on:
- formNumber
- admissionNumber
- studentFullName
- fatherMobile
- village
- class
- admissionDate
- academicYear

These ensure fast searching and filtering of student records.

## ✅ Post-Setup Checklist

- [ ] Database setup/migration completed successfully
- [ ] All tables and columns visible in Supabase Table Editor
- [ ] Indexes created (check Database → Indexes)
- [ ] RLS policies enabled (check Authentication → Policies)
- [ ] Environment variables set in Vercel:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_KEY` (use Anon/Public key)
- [ ] Test adding a student through the form
- [ ] Verify data is saving correctly
- [ ] Check all fields are being captured

## 🔧 Troubleshooting

### Error: "relation students does not exist"
- You haven't run the setup script yet
- Run `supabase-setup.sql` in SQL Editor

### Error: "column X does not exist"
- If migrating: Run `database-migration.sql`
- If fresh install: Re-run `supabase-setup.sql`

### Error: "permission denied"
- Check RLS policies are configured
- Verify your Anon Key is correct
- Check Supabase project settings

### Data not saving
- Check browser console for errors
- Verify Supabase credentials in environment variables
- Check network tab for API errors
- Ensure all required fields are filled

## 📝 Field Naming Convention

All field names use camelCase:
- `studentFullName` (not student_full_name)
- `fatherMobile` (not father_mobile)
- `admissionDate` (not admission_date)

This matches the JavaScript/React naming convention used in the application.

## 🔄 Future Updates

To add new fields:
1. Add column in Supabase SQL Editor
2. Update `AddStudent.jsx` form
3. Update `ViewStudents.jsx` if needed
4. Test thoroughly

## 📞 Support

If you encounter issues:
1. Check Supabase logs in Dashboard → Logs
2. Check browser console for errors
3. Verify all SQL scripts ran without errors
4. Review the error message details

---

**Last Updated**: December 2025
**Schema Version**: 2.0 (Complete Admission Form)
