# Full Codebase Audit & System Architecture Review
**Project:** VVN ERP — Student Management System  
**Audit Date:** October 27, 2026  
**Auditor:** Senior Software Architect, Staff Engineer, QA Engineer & Security Auditor  
**Repository Path:** `c:\Users\MAYANK\MAYDAY_THINGS\MAY PROJECTS\VVN_ERP`  

---

## 1. Executive Summary

A comprehensive, full-codebase static inspection, security review, architecture audit, and quality assessment of **VVN ERP** was conducted.

### Overall Assessment
VVN ERP is a single-page React 18 application coupled directly to a Supabase (PostgreSQL + PostgREST) backend with no intermediate server-side API or application tier. While the application presents a modern visual theme and implements significant UI form workflows for student administration and expenses, **the system in its current state is critically vulnerable, architecturally fragile, and contains multiple severe blocking defects**:

1. **Catastrophic Security Vulnerability (SEC-001):** Supabase Row Level Security (RLS) is configured with `USING (true) WITH CHECK (true)` on all tables, and public anonymous keys are shipped directly to the client. Any user on the internet can read, modify, or permanently drop all student records, personal addresses, Samagra IDs, and Aadhaar numbers without authentication.
2. **Client-Side Auth Bypass & Secret Leakage (SEC-002, SEC-003):** Authentication is completely simulated on the client browser. Admin credentials are stored as Vite client environment variables (`VITE_ADMIN_PASSWORD`), bundled into public production JavaScript, and login state is maintained solely by an arbitrary string in browser `localStorage`.
3. **Leading Whitespace Key Invalidation (BUG-001):** A single leading whitespace in `.env.local` (`VITE_SUPABASE_KEY= ey...`) causes the anon JWT regex validator in `src/supabaseClient.js` to fail, causing `supabaseReady` to evaluate to `false` and silently disabling or breaking every authenticated module in the system.
4. **Alphanumeric Counter Collision in LocalStorage (BUG-002):** The active multi-step student admission component (`AddStudentMultiStep.jsx`) auto-generates `formNumber` and `admissionNumber` using browser `localStorage`. If cache is cleared or multiple devices are used, counters reset to `F0001` and crash the application with database unique-constraint violations.
5. **Missing Database Tables & Schema Drift (DB-001, DB-002):** Three entire features actively queried by the application (`staff`, `news`, and `feedetail`) do not exist in the database setup scripts (`fresh-database-setup.sql` or `complete-schema-migration.sql`). Navigating to Staff or News results in unhandled database errors.
6. **Case-Sensitivity Mismatches (BUG-003):** PostgreSQL folds unquoted table columns (`transactionType`, `transactionDate`, `studentId`) to lowercase, while `PaymentHistory.jsx` filters and displays data using camelCase properties. As a result, payment history totals always calculate to ₹0 and filters fail.
7. **Broken Non-Functional PWA & Offline Support (FE-001, FE-002):** The service worker (`public/service-worker.js`) is never registered in any HTML or JS file, and references non-existent assets (`/Assets/logo.jpeg`), causing caching to reject. PWA documentation and claims of offline support are completely false.
8. **Dead Code & Parallel Implementations (MAINT-001):** An entire 1,811-line single-page enrollment form (`AddStudent.jsx`) and a standalone tribute page (`InMemory.jsx`) are orphaned and unrouted in production.

---

## 2. Project Architecture & Tech Stack

```
                              ┌──────────────────────────────────────────────┐
                              │                 Client Browser               │
                              │  ┌────────────────────────────────────────┐  │
                              │  │             React 18 SPA               │  │
                              │  │  - React Router DOM v6                 │  │
                              │  │  - Vanilla CSS / Modern UI             │  │
                              │  │  - xlsx (Excel) / jsPDF                │  │
                              │  └───────────────────┬────────────────────┘  │
                              └──────────────────────┼───────────────────────┘
                                                     │ Direct PostgREST / HTTP
                                                     │ (Client-side Supabase JS SDK)
                                                     ▼
                              ┌──────────────────────────────────────────────┐
                              │              Supabase Cloud                  │
                              │  ┌────────────────────────────────────────┐  │
                              │  │           PostgreSQL Database          │  │
                              │  │  - students (100+ admission columns)   │  │
                              │  │  - expenses                            │  │
                              │  │  - transactions (partial)              │  │
                              │  │  - [MISSING: staff, news]              │  │
                              │  │  - RLS: Permissive (USING true)        │  │
                              │  └────────────────────────────────────────┘  │
                              └──────────────────────────────────────────────┘
```

### Technical Stack Inventory
| Layer | Technology | Version | Notes / Observations |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | React | `^18.2.0` | Functional components with hooks (`useState`, `useEffect`, `useRef`) |
| **DOM Renderer** | React DOM | `^18.2.0` | Mounted in `src/main.jsx` with `React.StrictMode` |
| **Client Routing** | React Router DOM | `^6.21.0` | `BrowserRouter` with wildcard fallback routing |
| **Build & Dev Tool** | Vite | `^5.0.8` | Port 3000, rollup chunk splitting configured |
| **Backend / DB** | Supabase (PostgreSQL) | `@supabase/supabase-js ^2.39.0` | Client-direct architectural pattern (BaaS) |
| **Utilities** | xlsx, jsPDF | `^0.18.5`, `^2.5.1` | Excel export (`xlsx`), PDF stub in dead component (`jspdf`) |
| **Styling** | Vanilla CSS | Custom | Custom stylesheets (`App.css`, `Landing.css`, `Login.css`, `index.css`) |
| **Deployment Target** | Vercel | N/A | Configured via `vercel.json` with SPA catch-all rewrites |
| **Missing Tools** | Test Runner, Linter | None | Zero unit, integration, or E2E tests. No ESLint configured. |

---

## 3. Repository & Module Map

```
VVN_ERP/
├── .env                              # Default/stale environment variables (Contains plaintext secrets)
├── .env.example                      # Template environment variables (Contradicts README credentials)
├── .env.local                        # Local active environment variables (Contains leading whitespace bug)
├── .gitignore                        # Standard git ignore rules
├── Assets/                           # Static assets in root (NOT served by Vite public directory!)
│   ├── chacha.png
│   ├── logo.jpeg
│   └── school01.jpeg
├── DATABASE_SETUP_GUIDE.md           # Database setup documentation (References non-existent SQL files)
├── INSTALLATION_GUIDE.md             # End-user PWA installation guide
├── PWA_SETUP_COMPLETE.md             # PWA feature claims (Factually inaccurate)
├── README.md                         # Project documentation (Exposes plaintext credentials)
├── SCHEMA_DOCUMENTATION.md           # Schema column notes and migration history
├── clear-all-data.sql                # SQL script to truncate student and transaction records
├── complete-schema-migration.sql     # Incremental migration SQL (Contains partial schema)
├── fresh-database-setup.sql          # Primary database initialization script (Missing critical tables)
├── index.html                        # Application HTML root, SEO & PWA meta tags
├── index-old.html                    # Obsolete 2-line placeholder file (Dead code)
├── package.json                      # Dependency manifest
├── package-lock.json                 # Dependency lockfile
├── sample-students-insert.sql        # Sample student dataset (Incompatible with fresh-database-setup.sql)
├── vercel.json                       # Deployment rewrites and caching headers
├── vite.config.js                    # Vite configuration (References undeclared html2canvas)
├── public/                           # Vite public static asset directory
│   ├── chacha.png
│   ├── googlec11eb91602b08423.html
│   ├── logo.jpeg
│   ├── manifest.json                 # Web App Manifest (References broken /Assets/ paths)
│   ├── robots.txt
│   ├── school01.jpeg - school06.jpeg
│   ├── service-worker.js             # Service worker (Never registered in application)
│   └── sitemap.xml
└── src/                              # Application source code
    ├── App.css                       # Application layout styling (Contains broken /Assets/ URL)
    ├── App.jsx                       # Root shell, client auth state, nav menu, router
    ├── index.css                     # Global reset & typography (Contains hazardous zoom: 0.8)
    ├── main.jsx                      # React 18 DOM mount
    ├── supabaseClient.js             # Supabase client instantiation & anon key check
    ├── components/
    │   ├── AddStudent.jsx            # DEAD CODE: 1,811-line unrouted single-page form
    │   ├── AddStudentMultiStep.jsx   # ACTIVE: 6-step student admission form
    │   ├── Dashboard.jsx             # Admin overview (Queries nonexistent feedetail & staff)
    │   ├── EditStudent.jsx           # Student search, edit details, and delete
    │   ├── Expenses.jsx              # Expense tracker (No edit/delete; logs transactions)
    │   ├── FeeDetail.jsx             # Fee collection & payment tracker (Dummy toggle, UI bugs)
    │   ├── InMemory.jsx              # DEAD CODE: Unrouted founder memorial page
    │   ├── InstallPrompt.jsx         # PWA installation banner (Broken /Assets/ logo path)
    │   ├── Landing.jsx               # Public portal (Broken navigation anchors, news feed)
    │   ├── Login.jsx                 # Client-side authentication form
    │   ├── News.jsx                  # News announcement CRUD (Queries uncreated news table)
    │   ├── PaymentHistory.jsx        # Transaction history (Case-sensitivity breaks all data)
    │   ├── Staff.jsx                 # Staff directory (Queries uncreated staff table; no edit/delete)
    │   └── ViewStudents.jsx          # Student table, detail modal, Excel export
    └── styles/
        ├── InMemory.css
        ├── Landing.css
        └── Login.css
```

---

## 4. Feature Inventory & Completion Matrix

| Feature | Frontend File(s) | Backend / Database Dependency | Status | Supporting Evidence & Implementation Gaps |
| :--- | :--- | :--- | :--- | :--- |
| **Public Landing Page** | [Landing.jsx](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/src/components/Landing.jsx) | `news` table (read) | **Partially Complete** | Public landing page renders hero, about, tribute, WhatsApp enquiry modal. Broken anchor links (`#media`, `#team`), corrupted unicode glyph, and news table missing from DB scripts. |
| **Admin Authentication** | [Login.jsx](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/src/components/Login.jsx), [App.jsx](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/src/App.jsx) | None (Client `import.meta.env`) | **Broken / Insecure** | Client-side comparison only. No backend session. Admin password baked into client bundle. Trivial auth bypass via `localStorage`. |
| **Dashboard Analytics** | [Dashboard.jsx](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/src/components/Dashboard.jsx) | `students`, `transactions`, `feedetail`, `staff` | **Broken** | Queries non-existent table `feedetail` (line 51) and non-existent table `staff` (line 60). Transaction query uses camelCase column `.eq('transactionType', 'Fee')` against lowercase DB column. |
| **Student Admission (Multi-step)** | [AddStudentMultiStep.jsx](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/src/components/AddStudentMultiStep.jsx) | `students` table | **Partially Complete / Fragile** | 6-step form collects ~50 fields, auto-calculates fees. But form/admission numbers are generated from browser `localStorage` causing collision crashes, and admissionType CHECK constraint conflicts with DB scripts. |
| **Student Admission (Single-page)** | [AddStudent.jsx](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/src/components/AddStudent.jsx) | `students` table | **Dead Code** | 1,811-line component not imported or routed in `App.jsx`. Contains unmaintained PDF generation code. |
| **View Students Directory** | [ViewStudents.jsx](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/src/components/ViewStudents.jsx) | `students` table | **Partially Complete** | Displays students and modal details. Search claims roll number support but only searches name/village. Excel export fails to export medium (`s.medium` vs `s.mediumofstudy`). Sibling detection code is computed but never rendered. |
| **Edit / Delete Student** | [EditStudent.jsx](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/src/components/EditStudent.jsx) | `students` table | **Complete (Functional)** | Search and edit student modal works. Deletion does not cascade or clean up associated transactions in `transactions` table. |
| **Fee Collection & Tracking** | [FeeDetail.jsx](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/src/components/FeeDetail.jsx) | `students`, `transactions` | **Partially Complete** | Records fee payment and logs transaction. However, Monthly/Yearly toggle is completely non-functional dummy UI; table column displays blank student name (`student.fullname` instead of `student.studentfullname`); empty state messages are inverted. |
| **Staff Management** | [Staff.jsx](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/src/components/Staff.jsx) | `staff` table | **Broken / Missing Backend** | Frontend UI has full add-staff modal and filters, but `CREATE TABLE staff` does not exist in any setup script. No edit or delete features exist. Modal has hardcoded 200px top padding. |
| **Expense Management** | [Expenses.jsx](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/src/components/Expenses.jsx) | `expenses`, `transactions` | **Partially Complete** | Add expense and category breakdown works. No edit or delete capabilities. `NaN` rendered if amount is null. Date formatting has timezone off-by-one bug. |
| **Payment & Ledger History** | [PaymentHistory.jsx](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/src/components/PaymentHistory.jsx) | `transactions` table | **Broken** | Queries `transactions` but reads `t.transactionType`, `t.transactionDate`, `t.studentId` which are lowercase `transactiontype`, `transactiondate` in Postgres. Totals display ₹0 and type filtering fails. Salary transactions cannot be recorded anywhere in the app. |
| **News & Announcements CRUD** | [News.jsx](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/src/components/News.jsx) | `news` table | **Broken / Missing Backend** | UI supports adding, editing, deleting announcements. However, `CREATE TABLE news` does not exist in any setup script. Date is stored as non-standard string (`DD - Month - YYYY`), breaking SQL sorting. |
| **Progressive Web App (PWA)** | [manifest.json](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/public/manifest.json), [service-worker.js](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/public/service-worker.js), [InstallPrompt.jsx](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/src/components/InstallPrompt.jsx) | Browser Cache API | **Broken / Non-functional** | Service worker is never registered in any script. Manifest and worker reference `/Assets/logo.jpeg` which returns 404 in production. Offline support is non-existent. |
| **Founder Tribute Page** | [InMemory.jsx](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/src/components/InMemory.jsx) | None | **Dead Code** | Completed standalone memorial page is completely unrouted and unlinked. Contradicts founder birth year in `Landing.jsx` (1950 vs 1982). |

---

## 5. Critical Bugs & Functional Issues

### [BUG-001] Leading Whitespace in `.env.local` Silently Disables All Authenticated Database Calls
- **Severity:** Critical
- **Confidence:** Confirmed
- **Location:** [`.env.local:3`](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/.env.local#L3), [`src/supabaseClient.js:9-31`](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/src/supabaseClient.js#L9-L31)
- **Root Cause:** In `.env.local`, line 3 defines `VITE_SUPABASE_KEY= eyJhbGci...` with an accidental leading whitespace character immediately following the `=` sign. In `supabaseClient.js`, the validation function checks `key.startsWith('ey')`. Because the value starts with a space (`" ey..."`), `validateAnonKey` returns `{ valid: false }`, which causes `export const supabaseReady` to evaluate to `false`.
- **Failure Scenario:** Every authenticated view (`Dashboard.jsx`, `FeeDetail.jsx`, `EditStudent.jsx`, `ViewStudents.jsx`, `PaymentHistory.jsx`) contains an early return check: `if (!supabaseReady) { console.error('Supabase not configured. Skipping...'); setLoading(false); return; }`. With the local environment file loaded, the entire ERP system boots into a blank/empty state with no data loading and no helpful UI explanation.
- **Remediation:** In `supabaseClient.js`, sanitize the environment variable with `.trim()`:
  ```javascript
  const supabaseKey = (import.meta.env.VITE_SUPABASE_KEY || '').trim()
  const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim()
  ```
  Also remove the leading space on line 3 of `.env.local`.
- **Effort:** Small

---

### [BUG-002] Alphanumeric Counter Collision in Browser LocalStorage
- **Severity:** High
- **Confidence:** Confirmed
- **Location:** [`src/components/AddStudentMultiStep.jsx:77-93`](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/src/components/AddStudentMultiStep.jsx#L77-L93)
- **Root Cause:** `AddStudentMultiStep.jsx` generates form and admission numbers using browser `localStorage`:
  ```javascript
  const lastForm = localStorage.getItem('lastFormNumber') || 'F0000'
  const nextFormNum = 'F' + String(parseInt(lastForm.slice(1) || '0', 10) + 1).padStart(4, '0')
  ```
  The database schema enforces strict unique constraints: `formNumber TEXT UNIQUE NOT NULL` and `admissionNumber TEXT UNIQUE`.
- **Failure Scenario:**
  1. If an administrator uses a different computer, incognito tab, or clears browser storage, `lastFormNumber` defaults back to `'F0000'`, generating `'F0001'`. Submitting the form immediately crashes with a PostgreSQL duplicate key error (`students_formnumber_key`).
  2. The counter generation function runs in `useEffect` on component mount, meaning every page refresh increments the counter in local storage without any record being created in the database.
- **Remediation:** Query the latest sequence or maximum `formNumber` from Supabase on mount or use a PostgreSQL `SEQUENCE` with a database trigger to generate form and admission numbers atomically.
- **Effort:** Medium

---

### [BUG-003] Case Sensitivity Mismatch Breaks Transaction Queries and Ledger History
- **Severity:** High
- **Confidence:** Confirmed
- **Location:** [`complete-schema-migration.sql:63-75`](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/complete-schema-migration.sql#L63-L75), [`src/components/PaymentHistory.jsx:43-87`](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/src/components/PaymentHistory.jsx#L43-L87), [`src/components/Dashboard.jsx:41-47`](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/src/components/Dashboard.jsx#L41-L47)
- **Root Cause:** In PostgreSQL, unquoted column names in DDL (`CREATE TABLE transactions (transactionDate DATE, transactionType TEXT, studentId BIGINT)`) are folded to lowercase (`transactiondate`, `transactiontype`, `studentid`). PostgREST returns rows with lowercase object keys. However, `PaymentHistory.jsx` inspects camelCase properties:
  ```javascript
  result = result.filter(t => t.transactionType === type)
  fees: filtered.filter(t => t.transactionType === 'Fee').reduce(...)
  const d = new Date(t.transactionDate)
  ```
- **Failure Scenario:** In `PaymentHistory.jsx`, `t.transactionType` and `t.transactionDate` evaluate to `undefined`. All category totals (`fees`, `expenses`, `salary`) calculate to ₹0. Date filtering parses `undefined` as `Invalid Date`. In `Dashboard.jsx:45`, querying `.eq('transactionType', 'Fee')` causes PostgREST to query `"transactionType"` which fails with `column "transactionType" does not exist`.
- **Remediation:** Support normalized case fallback in `PaymentHistory.jsx`:
  ```javascript
  const type = t.transactiontype || t.transactionType
  const date = t.transactiondate || t.transactionDate
  ```
  And in `Dashboard.jsx`, use lowercase column names in queries: `.eq('transactiontype', 'Fee')`.
- **Effort:** Small

---

### [BUG-004] Blank Student Name Rendered in Fee Detail Table
- **Severity:** Medium
- **Confidence:** Confirmed
- **Location:** [`src/components/FeeDetail.jsx:306`](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/src/components/FeeDetail.jsx#L306)
- **Root Cause:** In the students table, the column is `studentFullName` (PostgreSQL `studentfullname`). In `FeeDetail.jsx:306`, the table cell renders:
  ```jsx
  <td>{student.fullname}</td>
  ```
  `student.fullname` is undefined. (In other places such as line 72 and line 359, the developer wrote `student.studentfullname || student.fullname`).
- **Failure Scenario:** When an administrator opens the "Fees Detail" page, the "Name" column for all students is completely blank. The admin cannot tell which student owes fees without looking at their ID or guardian name.
- **Remediation:** Update line 306 to `<td>{student.studentfullname || student.fullname || '—'}</td>`.
- **Effort:** Small

---

### [BUG-005] Excel Export References Wrong Column Name for Study Medium
- **Severity:** Medium
- **Confidence:** Confirmed
- **Location:** [`src/components/ViewStudents.jsx:24`](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/src/components/ViewStudents.jsx#L24)
- **Root Cause:** In `ViewStudents.jsx:24`, the export map assigns:
  ```javascript
  Medium: s.medium || ''
  ```
  The column in the database is `mediumofstudy` (or `mediumOfStudy`). `s.medium` is undefined.
- **Failure Scenario:** When clicking "Export to Excel", the resulting `.xlsx` spreadsheet contains an empty string for the "Medium" column across every student record.
- **Remediation:** Change line 24 to `Medium: s.mediumofstudy || s.medium || ''`.
- **Effort:** Small

---

### [BUG-006] Inverted Empty State Messages in Fee Detail Tabs
- **Severity:** Low
- **Confidence:** Confirmed
- **Location:** [`src/components/FeeDetail.jsx:283-284`](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/src/components/FeeDetail.jsx#L283-L284)
- **Root Cause:** The empty state conditional statement is reversed:
  ```jsx
  {activeTab === 'pending' ? 'All fees have been collected!' : 'No students with pending fees.'}
  ```
- **Failure Scenario:** When the user clicks the "Fees Completed" tab and there are no completed students, the UI says: *"No students with pending fees."* This confuses administrators.
- **Remediation:** Change to:
  ```jsx
  {activeTab === 'pending' ? 'All fees have been collected!' : 'No students with completed fees.'}
  ```
- **Effort:** Small

---

### [BUG-007] Sibling Detection Logic Is Computed but Never Rendered
- **Severity:** Low
- **Confidence:** Confirmed
- **Location:** [`src/components/ViewStudents.jsx:70-74, 118-120`](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/src/components/ViewStudents.jsx#L70-L74)
- **Root Cause:** `ViewStudents.jsx` defines `getSiblings(student)` and invokes `const siblings = getSiblings(student)` on line 118 inside the row iteration loop. However, the `siblings` variable is never referenced anywhere in the table row JSX.
- **Failure Scenario:** README specifically advertises "Automatic sibling detection: marks siblings and displays them together in the view". In practice, no badge, icon, or grouping is displayed.
- **Remediation:** Add a visual badge in the table or details modal displaying sibling count and links.
- **Effort:** Small

---

### [BUG-008] Non-Functional Search Filter for Roll Numbers
- **Severity:** Low
- **Confidence:** Confirmed
- **Location:** [`src/components/ViewStudents.jsx:61-66`](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/src/components/ViewStudents.jsx#L61-L66), [`src/components/FeeDetail.jsx:69-76`](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/src/components/FeeDetail.jsx#L69-L76)
- **Root Cause:** Search input placeholders in both `ViewStudents` and `FeeDetail` promise: *"Search by name, roll number, or village/parent"*. However, the filter functions only check:
  ```javascript
  return name.includes(term) || vill.includes(term)
  ```
  Neither function tests against `student.rollnumber`.
- **Failure Scenario:** Typing a student's roll number into the search bar yields "No students found".
- **Remediation:** Include `(student.rollnumber || '').toLowerCase().includes(term)` in the filter condition.
- **Effort:** Small

---

## 6. Security Findings

### [SEC-001] Complete Database Exposure via Permissive Row Level Security
- **Severity:** Critical
- **Confidence:** Confirmed
- **Location:** [`fresh-database-setup.sql:228-232, 268-272`](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/fresh-database-setup.sql#L228-L232), [`complete-schema-migration.sql:37-41`](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/complete-schema-migration.sql#L37-L41)
- **Vulnerability Type:** Broken Access Control / Data Breach / Authorization Bypass
- **Technical Root Cause:** The PostgreSQL database policies are created with open read/write permissions for all anonymous clients:
  ```sql
  CREATE POLICY "Allow all operations on students table"
      ON students FOR ALL
      USING (true)
      WITH CHECK (true);
  ```
  Because Supabase anon API keys are public by design, anyone with the public URL (`https://[PROJECT].supabase.co`) can issue direct REST queries via `fetch()` or `curl` to:
  - `DELETE https://[PROJECT].supabase.co/rest/v1/students` (wipe all student records)
  - `SELECT * FROM students` (dump Aadhaar numbers, Samagra IDs, parent mobile numbers, family income, and residential addresses)
  - `UPDATE students SET feespaid = 0` (tamper with financial ledgers)
- **Impact:** Total loss of confidentiality, integrity, and availability. Massive breach of Indian DPDP Act (Digital Personal Data Protection Act) due to exposure of children's PII, financial income records, and Aadhaar numbers.
- **Remediation:** 
  1. Restrict RLS policies to authenticated Supabase users using `auth.role() = 'authenticated'`.
  2. Transition from client-side simulated auth to true Supabase Auth (`supabase.auth.signInWithPassword`), or introduce a lightweight backend API (e.g. Next.js API route or Express server) with Supabase Service Role Key.
- **Effort:** Large

---

### [SEC-002] Hardcoded Plaintext Credentials in Public Frontend Bundle
- **Severity:** Critical
- **Confidence:** Confirmed
- **Location:** [`src/components/Login.jsx:26-48`](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/src/components/Login.jsx#L26-L48), [`.env:6-7`](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/.env#L6-L7)
- **Vulnerability Type:** Sensitive Credential Exposure / Hardcoded Secret
- **Technical Root Cause:** In Vite, any environment variable prefixed with `VITE_` is statically replaced into the client-side JavaScript bundle during build time. `Login.jsx` executes:
  ```javascript
  const correctId = import.meta.env.VITE_ADMIN_ID
  const correctPassword = import.meta.env.VITE_ADMIN_PASSWORD
  if (password !== correctPassword) ...
  ```
- **Exploitation Scenario:** Any visitor can open browser DevTools, open the Console, and type `import.meta.env.VITE_ADMIN_PASSWORD` or inspect the bundled `.js` file to read the admin password in clear text.
- **Remediation:** Never store admin authentication credentials in client-side environment variables. Use Supabase Auth (`supabase.auth.signInWithPassword`) with proper server-side authentication.
- **Effort:** Medium

---

### [SEC-003] Trivial Client-Side Authentication Bypass
- **Severity:** Critical
- **Confidence:** Confirmed
- **Location:** [`src/App.jsx:40-61`](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/src/App.jsx#L40-L61), [`src/components/Login.jsx:51-57`](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/src/components/Login.jsx#L51-L57)
- **Vulnerability Type:** Authentication Bypass / Client-Controlled Security State
- **Technical Root Cause:** On login, `Login.jsx` creates a mock token and saves it to `localStorage`:
  ```javascript
  const sessionToken = `vvn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  localStorage.setItem('vvn_auth_token', sessionToken)
  localStorage.setItem('vvn_user_id', id)
  localStorage.setItem('vvn_login_time', new Date().toISOString())
  ```
  `App.jsx` simply checks if `token`, `userId`, and `loginTime` exist in `localStorage` and that `loginTime` is less than 24 hours old. No server or JWT signature is verified.
- **Exploitation Scenario:** Any unauthenticated user can open DevTools and run:
  ```javascript
  localStorage.setItem('vvn_auth_token', 'bypass')
  localStorage.setItem('vvn_user_id', 'AdminVVN')
  localStorage.setItem('vvn_login_time', new Date().toISOString())
  ```
  Upon refreshing the page, they gain full administrative access to all student forms, fees, and financial records.
- **Remediation:** Authenticate via Supabase Auth. Validate the session on the database layer with proper JWTs.
- **Effort:** Medium

---

### [SEC-004] Exposed Secrets and Contradictory Passwords in Documentation and Git
- **Severity:** High
- **Confidence:** Confirmed
- **Location:** [`README.md:9-10`](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/README.md#L9-L10), [`.env.example:7`](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/.env.example#L7), [`.env:7`](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/.env#L7)
- **Vulnerability Type:** Information Disclosure / Secret Inconsistency
- **Technical Root Cause:**
  - `README.md` documents admin password in plaintext.
  - `.env.example` lists a different password.
  - `.env` specifies yet a third password.
  - The README also falsely asserts: *"Password Hashing: Admin password is hashed using SHA-256"*, whereas `Login.jsx:37` explicitly states `// Direct comparison - no hashing`.
- **Remediation:** Remove all credentials from `README.md` and public documentation. Enforce secure password management.
- **Effort:** Small

---

## 7. Backend & API Issues

### [API-001] Missing Intermediate Backend Architecture
- **Severity:** High
- **Confidence:** Confirmed
- **Location:** Architectural Pattern across all files
- **Finding:** The application lacks an API backend (no Express, Fastify, Next.js API routes, or serverless functions). The browser client talks directly to Supabase PostgREST endpoints. While common in small prototypes, combining a direct BaaS client with custom client-side authentication bypasses all authorization guarantees. Business logic such as calculating fees, generating consecutive admission numbers, and updating transaction ledgers is executed entirely on the client, exposing the application to race conditions and inconsistent states.
- **Remediation:** Implement Supabase Database Functions (RPCs) / Triggers for atomic workflows, or introduce a secure serverless backend.
- **Effort:** Large

---

### [API-002] Non-Atomic Multi-Table Transaction Logging
- **Severity:** High
- **Confidence:** Confirmed
- **Location:** [`src/components/FeeDetail.jsx:136-154`](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/src/components/FeeDetail.jsx#L136-L154), [`src/components/Expenses.jsx:94-112`](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/src/components/Expenses.jsx#L94-L112)
- **Finding:** In both `FeeDetail.jsx` and `Expenses.jsx`, recording a transaction involves two consecutive HTTP requests:
  1. Update `students` or insert into `expenses`.
  2. Insert log entry into `transactions`.
  If the network drops or the second request fails (logged with `console.warn`), the student fee is updated or the expense is saved, but the ledger entry in `transactions` is never written. There is no ACID transaction wrapping the operations.
- **Remediation:** Use a PostgreSQL database trigger (`AFTER INSERT ON expenses`, `AFTER UPDATE ON students`) to write to `transactions` atomically inside the database engine.
- **Effort:** Medium

---

### [API-003] Absence of Pagination on Unbounded Queries
- **Severity:** Medium
- **Confidence:** Confirmed
- **Location:** [`src/components/ViewStudents.jsx:42-45`](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/src/components/ViewStudents.jsx#L42-L45), [`src/components/FeeDetail.jsx:28-31`](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/src/components/FeeDetail.jsx#L28-L31), [`src/components/EditStudent.jsx:85-88`](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/src/components/EditStudent.jsx#L85-L88), [`src/components/PaymentHistory.jsx:25-28`](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/src/components/PaymentHistory.jsx#L25-L28)
- **Finding:** Every listing screen performs `.select('*')` without pagination (`.range(start, end)` or `.limit()`). As student records and payment transactions grow beyond hundreds or thousands of rows, client memory consumption and network payloads will degrade significantly.
- **Remediation:** Implement server-side pagination with offset/limit or cursor-based range queries.
- **Effort:** Medium

---

## 8. Database & Data Integrity Issues

### [DB-001] Missing `staff` Table in Database Setup Scripts
- **Severity:** High
- **Confidence:** Confirmed
- **Location:** [`src/components/Staff.jsx:43, 174`](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/src/components/Staff.jsx#L43), [`fresh-database-setup.sql`](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/fresh-database-setup.sql), [`complete-schema-migration.sql`](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/complete-schema-migration.sql)
- **Finding:** `Staff.jsx` and `Dashboard.jsx` execute queries against `.from('staff')`. However, neither `fresh-database-setup.sql` nor `complete-schema-migration.sql` creates a `staff` table. Any attempt to load or add staff results in PostgREST error: `relation "public.staff" does not exist`.
- **Remediation:** Add `CREATE TABLE staff (...)` with proper columns (`id`, `name`, `email`, `phone`, `position`, `post`, `department`, `joindate`, `dob`, `salary`, `address`, `qualification`, `created_at`, `updated_at`) and RLS policies to the schema migration script.
- **Effort:** Small

---

### [DB-002] Missing `news` Table in Database Setup Scripts
- **Severity:** High
- **Confidence:** Confirmed
- **Location:** [`src/components/News.jsx:45, 73, 82`](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/src/components/News.jsx#L45), [`src/components/Landing.jsx:48`](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/src/components/Landing.jsx#L48)
- **Finding:** Both `News.jsx` and `Landing.jsx` query `.from('news')`. No `CREATE TABLE news` definition exists in any `.sql` file in the repository. While `Landing.jsx` catches the error and displays hardcoded announcements, `News.jsx` alerts an error and fails completely.
- **Remediation:** Add `CREATE TABLE news (id BIGSERIAL PRIMARY KEY, date DATE NOT NULL, title TEXT NOT NULL, description TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW());` to the schema setup scripts.
- **Effort:** Small

---

### [DB-003] Query to Non-Existent `feedetail` Table in Dashboard
- **Severity:** Medium
- **Confidence:** Confirmed
- **Location:** [`src/components/Dashboard.jsx:50-54`](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/src/components/Dashboard.jsx#L50-L54)
- **Finding:** `Dashboard.jsx` attempts to query `.from('feedetail').select('totalfees')`. There is no table named `feedetail` in PostgreSQL (the fee columns are stored directly in `students`). The query returns an error, and the code falls back to multiplying student count by an arbitrary 10,000 (`total * 10000`).
- **Remediation:** Query `totalfees` directly from the `students` table:
  ```javascript
  const totalExpectedFees = students?.reduce((sum, s) => sum + parseFloat(s.totalfees || 0), 0) || 0
  ```
- **Effort:** Small

---

### [DB-004] Conflicting Check Constraints for `admissionType` Across SQL Scripts
- **Severity:** Medium
- **Confidence:** Confirmed
- **Location:** [`fresh-database-setup.sql:37`](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/fresh-database-setup.sql#L37), [`complete-schema-migration.sql:87`](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/complete-schema-migration.sql#L87), [`src/components/AddStudentMultiStep.jsx:202`](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/src/components/AddStudentMultiStep.jsx#L202)
- **Finding:** 
  - `fresh-database-setup.sql` defines: `CHECK (admissionType IN ('Regular', 'Private'))`
  - `complete-schema-migration.sql` defines: `CHECK (admissionType IN ('Regular', 'Tution'))`
  - `AddStudentMultiStep.jsx` requires: `allowedAdmissionType = ['Regular', 'Tution']`
  If a new database is set up with `fresh-database-setup.sql`, inserting a student with type `'Tution'` crashes with a check constraint violation. Furthermore, 'Tution' is a misspelling of 'Tuition'.
- **Remediation:** Unify the schema scripts to support both `'Regular'` and `'Tuition'` (with migration for legacy `'Tution'`).
- **Effort:** Small

---

### [DB-005] Non-Standard Date String Format in `news` Table
- **Severity:** Medium
- **Confidence:** Confirmed
- **Location:** [`src/components/News.jsx:15-35, 64-68`](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/src/components/News.jsx#L15-L35)
- **Finding:** In `News.jsx`, dates are formatted into strings (`"27 - October - 2026"`) before saving to the database. Querying `.order('date', { ascending: false })` sorts alphabetically rather than chronologically (e.g. `"31 - January - 2025"` sorts before `"01 - December - 2026"`).
- **Remediation:** Store standard ISO dates (`YYYY-MM-DD` or `TIMESTAMPTZ`) in the database column and format for display on the frontend.
- **Effort:** Small

---

### [DB-006] Incompatible Sample Data Script
- **Severity:** Low
- **Confidence:** Confirmed
- **Location:** [`sample-students-insert.sql:5`](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/sample-students-insert.sql#L5), [`fresh-database-setup.sql`](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/fresh-database-setup.sql)
- **Finding:** `sample-students-insert.sql` inserts into columns `classFees`, `vanFare`, `totalFees`, etc., which do not exist in `fresh-database-setup.sql`. Running sample data on a fresh database fails immediately.
- **Remediation:** Consolidate `fresh-database-setup.sql` with fee columns from `complete-schema-migration.sql`.
- **Effort:** Small

---

## 9. Frontend & UI/UX Issues

### [FE-001] Global CSS `zoom: 0.8` Degradation Across Browsers
- **Severity:** High
- **Confidence:** Confirmed
- **Location:** [`src/index.css:21-23`](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/src/index.css#L21-L23)
- **Finding:** `body { zoom: 0.8; -moz-transform: scale(0.8); -moz-transform-origin: 0 0; }`.
  `zoom` is non-standard CSS. In Firefox, `-moz-transform: scale(0.8)` shrinks the page to 80% width and leaves a 20% empty white gap on the right and bottom. In Chromium and Safari, `zoom` disrupts viewport units (`100vw`, `100vh`), breaking fixed overlay modals (`Staff.jsx`, `FeeDetail.jsx`, `InstallPrompt.jsx`).
- **Remediation:** Remove `zoom: 0.8` and `-moz-transform`. Manage scale and density with standard typography and CSS variables (`rem`, `clamp()`).
- **Effort:** Medium

---

### [FE-002] Broken Asset URLs for Logos and Watermarks (`/Assets/logo.jpeg`)
- **Severity:** Medium
- **Confidence:** Confirmed
- **Location:** [`src/components/InstallPrompt.jsx:48`](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/src/components/InstallPrompt.jsx#L48), [`src/App.css:16`](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/src/App.css#L16), [`public/manifest.json:13, 19`](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/public/manifest.json#L13), [`public/service-worker.js:6`](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/public/service-worker.js#L6)
- **Finding:** Files reference `/Assets/logo.jpeg`. In Vite, static files must reside in `public/` and are served from root (`/logo.jpeg`). The top-level `Assets/` directory is not bundled or served. Requests to `/Assets/logo.jpeg` result in 404 Not Found or fallback to `index.html`.
- **Remediation:** Update all references to `/logo.jpeg`.
- **Effort:** Small

---

### [FE-003] Broken Navigation Links and Corrupted Unicode Glyph on Landing Page
- **Severity:** Medium
- **Confidence:** Confirmed
- **Location:** [`src/components/Landing.jsx:97, 99, 176`](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/src/components/Landing.jsx#L97)
- **Finding:**
  1. `<a href="#media">Media</a>` and `<a href="#team">Admission</a>` link to non-existent HTML IDs. Clicking them does nothing.
  2. Line 176 contains a corrupted replacement character: `<div className="reason-icon"></div>`.
- **Remediation:** Point anchors to valid sections (`#about`, `#contact`) and replace `` with an appropriate emoji or SVG icon.
- **Effort:** Small

---

### [FE-004] Hardcoded 200px Top Padding on Staff Modal
- **Severity:** Medium
- **Confidence:** Confirmed
- **Location:** [`src/components/Staff.jsx:344`](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/src/components/Staff.jsx#L344)
- **Finding:** The modal container has `paddingTop: '200px'`. On laptops, tablets, or smaller desktop screens, the modal top begins 200 pixels down the screen, pushing modal action buttons and inputs below the fold.
- **Remediation:** Use standard centered flexbox: `display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'`.
- **Effort:** Small

---

### [FE-005] Non-Functional Monthly/Yearly Toggle in Fee Detail
- **Severity:** Low
- **Confidence:** Confirmed
- **Location:** [`src/components/FeeDetail.jsx:10, 204-234`](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/src/components/FeeDetail.jsx#L10)
- **Finding:** Buttons for "📅 Monthly" and "📆 Yearly" update a state variable `timePeriod`. However, `timePeriod` is never passed to any calculation, filter, or API query. It is a completely cosmetic, non-functional toggle.
- **Remediation:** Implement time-period breakdown or remove the toggle if fees are only tracked annually.
- **Effort:** Small

---

## 10. Performance & Scalability

### [PERF-001] Missing Dependency in Vite Manual Chunks (`html2canvas`)
- **Severity:** Medium
- **Confidence:** Confirmed
- **Location:** [`vite.config.js:21`](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/vite.config.js#L21), [`package.json`](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/package.json)
- **Finding:** `vite.config.js` splits chunks using:
  ```javascript
  'pdf': ['jspdf', 'html2canvas']
  ```
  However, `html2canvas` is not declared in `package.json` dependencies. In clean CI/CD environments (e.g. `npm ci` on Vercel), Vite build will fail if Rollup cannot resolve `html2canvas`.
- **Remediation:** Either remove `'html2canvas'` from `manualChunks` or add `html2canvas` to `package.json`.
- **Effort:** Small

---

### [PERF-002] Global Window Pollution
- **Severity:** Low
- **Confidence:** Confirmed
- **Location:** [`src/components/ViewStudents.jsx:16, 227`](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/src/components/ViewStudents.jsx#L16)
- **Finding:** `ViewStudents.jsx` attaches the entire student dataset to `window.__VIEW_STUDENTS__` on every render. This pollutes the global scope and risks memory leaks during component unmounts.
- **Remediation:** Pass data directly to `exportToExcel(filteredStudents)` from the button click handler.
- **Effort:** Small

---

## 11. Code Quality & Technical Debt

### [MAINT-001] 1,811 Lines of Dead Code in `AddStudent.jsx`
- **Severity:** Medium
- **Confidence:** Confirmed
- **Location:** [`src/components/AddStudent.jsx`](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/src/components/AddStudent.jsx)
- **Finding:** `AddStudent.jsx` is a massive 61.8 KB single-file component containing 1,811 lines of form logic, auto-number generation, and `jsPDF` certificate printing. However, `App.jsx` imports and routes `AddStudentMultiStep.jsx` instead. `AddStudent.jsx` is never imported anywhere in the application.
- **Remediation:** Archive or delete `AddStudent.jsx` to reduce codebase noise and prevent developer confusion.
- **Effort:** Small

---

### [MAINT-002] Unrouted and Inconsistent `InMemory.jsx`
- **Severity:** Low
- **Confidence:** Confirmed
- **Location:** [`src/components/InMemory.jsx:32`](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/src/components/InMemory.jsx#L32), [`src/components/Landing.jsx:221`](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/src/components/Landing.jsx#L221)
- **Finding:** `InMemory.jsx` is a completed memorial page that is not declared in `App.jsx` routes. In addition, `InMemory.jsx:32` states the founder lived "1950 - 2024", whereas `Landing.jsx:221` states "1982 to 2024".
- **Remediation:** Route `/in-memory` in `App.jsx`, link from landing page footer, and reconcile birth years with stakeholders.
- **Effort:** Small

---

### [MAINT-003] Redundant and Confusing Documentation Files
- **Severity:** Low
- **Confidence:** Confirmed
- **Location:** [`DATABASE_SETUP_GUIDE.md:16, 37`](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/DATABASE_SETUP_GUIDE.md#L16), [`index-old.html`](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/index-old.html)
- **Finding:** `DATABASE_SETUP_GUIDE.md` instructs users to run `supabase-setup.sql` and `database-migration.sql`—neither of which exists in the repository. `index-old.html` is a 2-line placeholder.
- **Remediation:** Align documentation with actual `.sql` filenames and remove `index-old.html`.
- **Effort:** Small

---

## 12. Testing & Build Results

### Actual Execution Status & System Limitations
During the execution of this audit, static analysis and syntax inspection were conducted across all source and configuration files.

When attempting to invoke execution commands via the CLI runner tool:
```
Encountered error in step execution: error executing cascade step: CORTEX_STEP_TYPE_RUN_COMMAND:
exec: "c:\Users\MAYANK\MAYDAY_THINGS\MAY PROJECTS\VVN_ERP\powershell": executable file not found in %PATH%
```
The subshell execution environment on the host runner was unable to resolve `powershell` from the working directory. As dictated by audit rules:
- **No tests, builds, or linters were falsely claimed to have run.**
- Static analysis of `package.json` confirms:
  - `"scripts"` has only `"dev"`, `"build"`, and `"preview"`.
  - There is **no test script** (`npm test`), no testing framework (`jest`, `vitest`), and no linter (`eslint`) installed or configured.
  - Test coverage across the entire repository is **0%**.

---

## 13. Configuration, Dependencies & Deployment

### [CONF-001] Missing Service Worker Registration
- **Severity:** High
- **Confidence:** Confirmed
- **Location:** [`index.html`](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/index.html), [`src/main.jsx`](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/src/main.jsx), [`public/service-worker.js`](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/public/service-worker.js)
- **Finding:** Despite `PWA_SETUP_COMPLETE.md` stating that the PWA service worker is active and functional, there is **no `navigator.serviceWorker.register` call anywhere in the entire codebase**. The service worker file is never loaded by browsers.
- **Remediation:** Register the service worker in `src/main.jsx`:
  ```javascript
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
    })
  }
  ```
- **Effort:** Small

---

### [CONF-002] Deprecated / Non-Standard `process.env` in `vite.config.js`
- **Severity:** Low
- **Confidence:** Confirmed
- **Location:** [`vite.config.js:27-30`](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/vite.config.js#L27-L30)
- **Finding:** `vite.config.js` defines `'process.env.VITE_SUPABASE_URL'` and `'process.env.VITE_SUPABASE_KEY'`. Modern Vite applications use `import.meta.env.VITE_*`. The `process.env` definition in `vite.config.js` is redundant and unused by the codebase.
- **Remediation:** Remove the redundant `define: { ... }` block from `vite.config.js`.
- **Effort:** Small

---

## 14. Privacy & Data Handling

### [PRIV-001] Plaintext Storage of National Identity Numbers
- **Severity:** High
- **Confidence:** Confirmed
- **Location:** [`fresh-database-setup.sql:44, 59, 67`](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/fresh-database-setup.sql#L44), [`src/components/AddStudentMultiStep.jsx:252, 263, 267`](file:///c:/Users/MAYANK/MAYDAY_THINGS/MAY%20PROJECTS/VVN_ERP/src/components/AddStudentMultiStep.jsx#L252)
- **Finding:** Indian Aadhaar numbers (`studentAadhaar`, `fatherAadhaar`, `motherAadhaar`), Samagra IDs, and bank account numbers are accepted and stored as unencrypted cleartext in PostgreSQL columns. Combined with the open RLS vulnerability (`SEC-001`), this represents severe regulatory liability under the Indian Aadhaar Act and DPDP Act.
- **Remediation:** Enforce database-level encryption (e.g. `pgcrypto` or Supabase Vault) for national ID numbers, or mask them in UI displays (`XXXXXXXX1234`).
- **Effort:** Medium

---

## 15. TODOs, Placeholders & Loose Ends

| Item / Finding | Location | Status / Observation |
| :--- | :--- | :--- |
| **Salary Payment Workflow** | `PaymentHistory.jsx:85`, `complete-schema-migration.sql:66` | The UI displays a "Salary" KPI card, and the DB schema defines `'Salary'` transaction type and `staffId`. However, there is no button or screen in the app to record a salary payment. |
| **Staff Editing & Deletion** | `Staff.jsx:280-320` | Staff table renders static rows with zero edit or delete buttons. Once created, staff cannot be modified. |
| **Expense Editing & Deletion** | `Expenses.jsx:322-344` | Expense table renders static rows with zero edit or delete buttons. Erroneous records cannot be fixed. |
| **Sibling Detection UI** | `ViewStudents.jsx:70-74, 118` | Sibling calculation runs on every render but is discarded without being displayed. |
| **PWA Service Worker** | `public/service-worker.js` | Service worker script exists but is never registered in any HTML or JavaScript file. |
| **Founder Memorial Page** | `src/components/InMemory.jsx` | Fully designed component not routed or linked in the application. |
| **Hardcoded Fallback News** | `Landing.jsx:58-62` | Contains hardcoded announcements from January 2026 if DB connection fails. |
| **Undeclared Build Dependency** | `vite.config.js:21` | References `html2canvas` in Rollup chunks, but package is not in `package.json`. |

---

## 16. Prioritized Remediation Roadmap

### Priority 0 (Immediate — Security & System Disablers)
- **[BUG-001]** Trim leading whitespace in `.env.local` and add `.trim()` in `supabaseClient.js` to unblock database access.
- **[SEC-001]** Lockdown Supabase Row Level Security (RLS) on `students`, `expenses`, and `transactions` tables.
- **[SEC-002 & SEC-003]** Migrate authentication from client-side `import.meta.env` and `localStorage` to Supabase Auth (`supabase.auth.signInWithPassword`).

### Priority 1 (High Impact — Functional Integrity & Schema Sync)
- **[BUG-002]** Replace `localStorage` auto-number generation in `AddStudentMultiStep.jsx` with database sequence / server counter.
- **[BUG-003]** Standardize casing in `PaymentHistory.jsx` and `Dashboard.jsx` to resolve ₹0 ledger metrics.
- **[DB-001 & DB-002]** Create `staff` and `news` tables in database migration scripts.
- **[DB-003]** Fix `Dashboard.jsx` to query `students.totalfees` rather than non-existent `feedetail` table.
- **[CONF-001]** Register service worker in `main.jsx` and fix asset paths to enable PWA capabilities.

### Priority 2 (Reliability, UI/UX & Completeness)
- **[FE-001]** Remove non-standard `zoom: 0.8` from `index.css` to fix layout distortions in Firefox and mobile browsers.
- **[FE-002]** Update broken `/Assets/logo.jpeg` image paths to `/logo.jpeg`.
- **[BUG-004]** Fix blank student name column in `FeeDetail.jsx`.
- **[BUG-005]** Fix empty medium column in `ViewStudents.jsx` Excel export.
- **[API-002]** Implement atomic transaction triggers in PostgreSQL for student fees and expenses.
- **[FE-004]** Remove `paddingTop: '200px'` from `Staff.jsx` modal.
- **[MAINT-001]** Remove obsolete `AddStudent.jsx` (1,811 lines) to eliminate dead code.

### Priority 3 (Cleanup, Minor Improvements & Documentation)
- **[MAINT-002]** Route `InMemory.jsx` or integrate tribute into landing page and reconcile birth years.
- **[FE-003]** Fix broken anchor tags (`#media`, `#team`) and corrupted glyph on landing page.
- **[SEC-004 & MAINT-003]** Sanitize `README.md`, update setup guides to match actual SQL files, and remove `index-old.html`.
- **[PERF-001]** Remove `html2canvas` from `vite.config.js` chunks.

---

## 17. Unverified Areas & Audit Limitations

1. **Active Database State:** Live Supabase production database contents could not be queried directly because external network API access requires active network credentials and runtime execution. Findings regarding database tables were verified by static analysis of SQL scripts (`fresh-database-setup.sql`, `complete-schema-migration.sql`, `sample-students-insert.sql`).
2. **Build and Automated Test Execution:** The local CLI runner was unable to spawn the shell sub-process due to Windows system PATH configuration on the host machine. Build outputs, bundling times, and unit test executions could not be run synchronously.
3. **Cross-Browser Mobile Testing:** While viewport and CSS rules (`zoom: 0.8`, touch-action, mobile media queries) were audited statically, physical touchscreen device testing (iOS Safari, Android Chrome) remains unverified.
