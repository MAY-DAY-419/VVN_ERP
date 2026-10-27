# 🎓 VVN ERP - Student Management System

A complete student management system built with Supabase backend for educational institutions.

## ✨ Features

### 🔐 Admin Authentication
- Secure login configured via environment variables
- Set `VITE_ADMIN_ID` and `VITE_ADMIN_PASSWORD` in `.env` / `.env.local`

### 📝 Student Management
- Add new students with comprehensive details
- View all students in organized table
- Search and filter students
- Automatic sibling detection

### 👥 Student Information Tracked
- **Basic Details**: Name, Roll Number, DOB, Gender, Class/Division
- **Family Info**: Parent/Guardian name, Contact, Address
- **Village**: 14 predefined villages (dropdown selection)
- **Admission**: Type (Regular/Tuition), Date
- **Transport**: School van status

### 📊 Dashboard
- Total students count
- Number of families
- Van users statistics
- Admission type breakdown

### 🔍 Smart Features
- **Sibling Detection**: Automatically identifies siblings based on parent name and contact number
- **Real-time Search**: Filter students by name, roll number, or village
- **Validation**: All required fields validated before submission
- **Responsive Design**: Works on desktop, tablet, and mobile

## 🚀 Setup Instructions

### 1. Supabase Database Setup

1. Go to your Supabase dashboard: https://kkoaxijbtgzkpxrbfirr.supabase.co
2. Click on "SQL Editor" in the left sidebar
3. Open the `supabase-setup.sql` file
4. Copy and paste the SQL code into the Supabase SQL Editor
5. Click "Run" to create the database table and policies

### 2. Verify API Key

The application is already configured with your Supabase credentials:
- **URL**: `https://kkoaxijbtgzkpxrbfirr.supabase.co`
- **API Key**: Already embedded in the code

### 3. Run the Application

Simply open `index.html` in your web browser. That's it!

## 🎯 Usage Guide

### Login
1. Open the application (`/login`)
2. Enter your configured Admin ID and Password
3. Click "Login"

### Adding Students
1. Click "➕ Add Student" from the navigation
2. Fill in all required fields:
   - Basic Details (Name, Roll Number, DOB, Gender, Class, Division)
   - Family Information (Parent Name, Contact, Address)
   - Village (Select from dropdown)
   - Admission Information (Type, Date)
   - Transport (Van Yes/No)
3. Click "Add Student"
4. Success message will appear

### Viewing Students
1. Click "👥 View Students" from the navigation
2. Use the search bar to filter students
3. View sibling relationships automatically detected
4. See admission types and van status with color-coded badges

### Dashboard
1. Click "📊 Dashboard" to see statistics:
   - Total number of students
   - Number of families
   - Van users count
   - Regular admission count

## 🏘️ Supported Villages

The system supports 14 villages:
- Konhar
- Dhanoli
- Parrawan
- Madanpur
- Palia
- Kuthonda
- Ajnol
- Gata
- Gutore
- Taragarh
- Padkoli
- Devra
- Harisingh Pura
- Hirapura

## 🔒 Security Features

- **Password Hashing**: Admin password is hashed using SHA-256
- **Session Management**: Login state maintained securely
- **Input Validation**: All form fields validated before submission
- **Supabase RLS**: Row Level Security enabled on database

## 🎨 Design Features

- Modern gradient design
- Responsive layout for all devices
- Color-coded badges for quick identification
- Smooth animations and transitions
- User-friendly navigation

## 📱 Mobile Friendly

The application is fully responsive and works seamlessly on:
- Desktop computers
- Tablets
- Mobile phones

## 🛠️ Technical Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Client-side with SHA-256 hashing
- **Styling**: Custom CSS with modern design

## 📊 Database Schema

```sql
students
├── id (Primary Key)
├── fullName
├── rollNumber (Unique)
├── dob
├── gender
├── class
├── division
├── parentName
├── contactNumber
├── address
├── village
├── admissionType
├── admissionDate
├── vanApplied
├── created_at
└── updated_at
```

## 🎓 Sibling Detection Logic

The system automatically identifies siblings when:
- Parent/Guardian name is identical
- Contact number is identical

These students are marked as siblings and displayed together in the view.

## 💡 Tips

1. **Roll Numbers**: Make sure each roll number is unique
2. **Contact Numbers**: Enter 10-digit mobile numbers
3. **Search**: Use the search bar to quickly find students
4. **Siblings**: Add all family members to see sibling relationships
5. **Backup**: Regular backup of Supabase data is recommended

## 🚨 Troubleshooting

### Students not showing?
- Check if the table was created in Supabase (run SQL setup)
- Verify RLS policies are enabled
- Check browser console for errors

### Can't login?
- Verify credentials: `AdminVVN` / `VVN@2025#`
- Clear browser cache and try again

### Database errors?
- Ensure Supabase project is active
- Verify API key is correct
- Check Supabase project status

## 📞 Support

For issues or questions, check:
1. Supabase project logs
2. Browser developer console
3. Database table structure in Supabase

## 🔄 Future Enhancements

- Export student data to Excel/CSV
- Email notifications to parents
- Fee management module
- Attendance tracking
- Report card generation
- Multiple admin roles

---

**Developed for VVN Educational Institution**
*Version 1.0 - December 2025*