    -- VVN ERP - Supabase Database Setup
    -- Run this SQL in your Supabase SQL Editor

    -- Create students table
    CREATE TABLE IF NOT EXISTS students (
        id BIGSERIAL PRIMARY KEY,
        fullName TEXT NOT NULL,
        rollNumber TEXT NOT NULL UNIQUE,
        dob DATE NOT NULL,
        placeOfBirth TEXT NOT NULL,
        gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
        category TEXT NOT NULL CHECK (category IN ('GENERAL', 'OBC', 'SC', 'ST')),
        medium TEXT NOT NULL CHECK (medium IN ('English', 'Hindi')),
        class TEXT NOT NULL CHECK (class IN ('Nursery', 'LKG', 'UKG', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th')),
        division TEXT NOT NULL,
        fatherName TEXT NULL,
        motherName TEXT NULL,
        parentName TEXT NULL,
        contactNumber TEXT NOT NULL,
        emergencyContact TEXT NULL,
        address TEXT NOT NULL,
        village TEXT NOT NULL,
        state TEXT NOT NULL DEFAULT 'Madhya Pradesh',
        district TEXT NOT NULL DEFAULT 'Bhind',
        admissionType TEXT NOT NULL CHECK (admissionType IN ('Regular', 'Tuition')),
        admissionDate DATE NOT NULL,
        vanApplied TEXT NOT NULL CHECK (vanApplied IN ('Yes', 'No')),
        fees DECIMAL(10, 2) DEFAULT 0,
        vanCharges DECIMAL(10, 2) DEFAULT 0,
        totalFees DECIMAL(10, 2) DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Create index for faster searches
    CREATE INDEX IF NOT EXISTS idx_students_roll_number ON students(rollNumber);
    CREATE INDEX IF NOT EXISTS idx_students_parent_contact ON students(parentName, contactNumber);
    CREATE INDEX IF NOT EXISTS idx_students_village ON students(village);

    -- Create function to automatically update updated_at timestamp
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- Create trigger for updated_at
    CREATE TRIGGER update_students_updated_at
        BEFORE UPDATE ON students
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

    -- Enable Row Level Security (RLS)
    ALTER TABLE students ENABLE ROW LEVEL SECURITY;

    -- Create policy to allow all operations (you can make this more restrictive if needed)
    CREATE POLICY "Allow all operations on students table"
        ON students
        FOR ALL
        USING (true)
        WITH CHECK (true);

    -- Insert some sample data (optional - remove if not needed)
    -- INSERT INTO students (
    --     fullName, rollNumber, dob, gender, class, division,
    --     parentName, contactNumber, address, village,
    --     admissionType, admissionDate, vanApplied
    -- ) VALUES
    -- ('Rahul Kumar', '001', '2010-05-15', 'Male', '10th', 'A',
    --  'Suresh Kumar', '9876543210', 'House No 123, Main Road', 'Konhar',
    --  'Regular', '2023-04-01', 'Yes'),
    -- ('Priya Sharma', '002', '2010-08-20', 'Female', '10th', 'A',
    --  'Ramesh Sharma', '9876543211', 'House No 456, School Road', 'Dhanoli',
    --  'Regular', '2023-04-01', 'No');
