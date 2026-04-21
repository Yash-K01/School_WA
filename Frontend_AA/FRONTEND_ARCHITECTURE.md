# Frontend Architecture

Generated: 2026-04-12

This document describes the React frontend (Vite) in `Frontend_AA/` and is intended to onboard developers quickly: folder layout, module breakdown, component hierarchy, data flow, props, routing, API integration, state usage, and common issues.

---

**Table of contents**

- Section 1 — Project structure
- Section 2 — Routing
- Section 3 — Applications module breakdown
- Section 4 — Component hierarchy
- Section 5 — Data flow
- Section 6 — API integration
- Section 7 — State management
- Section 8 — Common issues & troubleshooting

---

## Section 1 — Project structure

Root (Frontend_AA)

```
Frontend_AA/
├── index.html
├── package.json
├── vite.config.js
├── eslint.config.js
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── style.css
│   ├── assets/
│   ├── components/
│   │   ├── ApplicationsTable.jsx    # Table component for applications list
│   │   ├── HealthCheck.jsx          # Health status component
│   │   ├── Layout.jsx               # App shell, header, sidebar, and <Outlet />
│   │   ├── StatsCard.jsx            # Reusable stats card component
│   │   └── UpcomingFollowups.jsx    # Upcoming follow-ups widget
│   ├── hooks/
│   │   ├── useAdmissions.js         # Custom hook for admissions data
│   │   ├── useApplication.js        # Custom hook for application management
│   │   ├── useLeads.js              # Custom hook for leads data
│   │   └── useUpcomingFollowups.js  # Custom hook for follow-ups
│   ├── pages/                       # page-level views (route targets)
│   │   ├── AddLead.jsx              # Add new lead form
│   │   ├── Applications.jsx         # Applications list and management
│   │   ├── Communication.jsx        # Communication tools
│   │   ├── Counseling.jsx           # Counseling dashboard
│   │   ├── CreateApplication.jsx    # Create application form
│   │   ├── Dashboard.jsx            # Main dashboard with stats and widgets
│   │   ├── Enrollment.jsx           # Enrollment management
│   │   ├── FeesPayments.jsx         # Fees and payments
│   │   ├── Leads.jsx                # Leads list and management
│   │   ├── Login.jsx                # Authentication page
│   │   ├── MultiStepApplication.jsx # Multi-step application form
│   │   ├── NewApplication.jsx       # New application page
│   │   ├── OffersSeats.jsx          # Offers and seats management
│   │   ├── ParentForm.jsx           # Parent information form
│   │   ├── Pipeline.jsx             # Sales pipeline view
│   │   ├── Reports.jsx              # Reports and analytics
│   │   ├── ScheduleVisit.jsx        # Schedule visit page
│   │   ├── Screening.jsx            # Application screening
│   │   ├── Security.jsx             # Security settings
│   │   └── Settings.jsx             # Application settings
│   ├── services/                    # API clients
│   │   ├── admissionService.js      # Admission-related API calls
│   │   ├── applicationService.js    # Application management API calls
│   │   ├── dashboardService.js      # Dashboard stats and data API calls
│   │   └── leadService.js           # Lead-related API calls
│   └── utils/
│       └── authToken.js             # Token helpers, isAuthenticated()
└── README.md
```

Folder purposes

- `src/pages/` - Route targets. Each file is a full page view. Keep page-specific logic here.
- `src/components/` - Shared, presentational components used across pages (Layout, HealthCheck, StatsCard, UpcomingFollowups, ApplicationsTable).
- `src/hooks/` - Custom React hooks for data fetching and state management (useAdmissions, useApplication, useLeads, useUpcomingFollowups).
- `src/services/` - API client functions that encapsulate fetch calls and request/response shape.
- `src/utils/` - Small helpers (auth token management, formatting, etc.).
- `src/assets/` - Images and static assets.
- `App.jsx` - Central router and protected-route wrapper.

Notes: The app uses feature-based organization with dedicated hooks and services for each domain (leads, applications, admissions, dashboard). Components are shared across pages, and custom hooks handle data fetching with error states and loading indicators.

---

## Section 2 — Routing structure

Routing is defined in `src/App.jsx` using `react-router-dom`.

Public route

- `/login` → `Login.jsx`

Protected shell (requires `isAuthenticated()`)

- `/` → `Dashboard.jsx` (index)
- `/leads` → `Leads.jsx`
- `/leads/add` → `AddLead.jsx`
- `/pipeline` → `Pipeline.jsx`
- `/communication` → `Communication.jsx`
- `/counseling` → `Counseling.jsx`
- `/counseling/schedule-visit` → `ScheduleVisit.jsx`
- `/applications` → `Applications.jsx`
- `/applications/create` → `CreateApplication.jsx`
- `/applications/form/:id` → `MultiStepApplication.jsx` (NEW - dynamic route for multi-step form)
- `/application/:id` → `MultiStepApplication.jsx` (alias endpoint)
- `/applications/new` → `NewApplication.jsx` (legacy)
- `/screening` → `Screening.jsx`
- `/offers-seats` → `OffersSeats.jsx`
- `/fees-payments` → `FeesPayments.jsx`
- `/enrollment` → `Enrollment.jsx`
- `/reports` → `Reports.jsx`
- `/security` → `Security.jsx`
- `/settings` → `Settings.jsx`

**NEW Application Workflow Routes:**

1. `/applications` - View all applications with stats and drafts
2. `/applications/create` - Create new application (select lead or create without lead)
3. `/applications/form/:id` - Multi-step application form (preferred route)
4. `/application/:id` - Alias for viewing/completing application

Behavior: Protected routes are nested under `Layout.jsx` which renders the shell and an `<Outlet />`. If `isAuthenticated()` returns false, the `ProtectedRoute` redirects to `/login`.

The application creation flow:

1. User navigates to `/applications`
2. Clicks "New Application"
3. Navigates to `/applications/create` to select a lead
4. System creates application and navigates to `/applications/form/:id` with the multi-step form
5. User completes all 6 steps and submits
6. Application returns to `/applications` after successful submission

---

## Section 3 — Applications module breakdown

The applications feature has been completely refactored with full API integration. Files of interest:

- `src/pages/Applications.jsx`
- `src/pages/CreateApplication.jsx`
- `src/pages/NewApplication.jsx`
- `src/pages/MultiStepApplication.jsx` (NEW - main multi-step form)
- `src/hooks/useApplication.js` (NEW - custom hook for application management)
- `src/services/applicationService.js` (UPDATED - comprehensive API integration)

### Applications.jsx

**Purpose:** List, filter, and manage admission applications with stats and draft tracking.

**Data Integration:** Real API calls to backend:

- `GET /api/applications/counts` → Application statistics by status
- `GET /api/applications/draft` → Draft applications
- `GET /api/applications?limit=100&offset=0` → All applications
- `GET /api/applications/search?query=<term>` → Search applications

**Displays:**

- Stats cards: Total, Submitted, Under Review, Approved, Waitlisted, Draft Applications
- Expandable Draft Applications section with resume functionality
- Filter controls: search input, status dropdown filter
- Applications table (Application ID, Student Name, Grade, Contact, Submitted Date, Status)
- Error handling and loading states

**Props:** None (page-level component)

**State:**

- `stats` - object with application counts by status
- `applications` - array of all applications
- `draftApplications` - array of draft applications
- `filteredApps` - filtered view of applications
- `search` - search query string
- `filter` - current status filter ("all", "submitted", "under_review", "approved", etc.)
- `showDrafts` - boolean to toggle draft applications visibility
- `loading` - loading state for API calls
- `error` / `searchError` - error messages

**Key Functions:**

- `loadData()` - Fetches stats, drafts, and all applications on mount
- `handleSearch(value)` - Real-time search with API integration
- `handleStatusFilter(status)` - Apply status filter
- `applyFilter(appList, statusFilter)` - Helper for both search and status filtering
- `handleViewApplication(appId)` - Navigate to application view
- `handleResumeDraft(appId)` - Resume draft application and navigate

**UX Flows:**

- Click "New Application" → navigate to `/applications/create`
- Click status stat card → filter applications by status
- Click "Draft Applications" stat card → toggle draft applications section
- Click "Resume" on draft application → navigate to `/applications/form/:id`
- Use search input → live search results with API integration

### CreateApplication.jsx

**Purpose:** Start a new application by selecting an eligible lead or creating without a lead.

**Data Integration:** Real API calls:

- `GET /api/leads` (via useLeads hook) → Fetch eligible leads, supports search
- `POST /api/applications` → Create application from lead
- `POST /api/applications/new` → Create application without lead

**Features:**

- Step 1: Lead selection with search
  - Search input to filter eligible leads
  - Lead list display with selection capability
  - Option to create application without lead (manual entry)
- Step 2: Confirmation and Application Creation
  - Select academic year from dropdown
  - Confirm selection before creation
  - Creates application record and navigates to multi-step form

**Expected Lead Object:**

```json
{
  "id": 1,
  "first_name": "Rohan",
  "last_name": "Sharma",
  "desired_class": "Grade 5",
  "email": "rohan@example.com",
  "phone": "+919999999999",
  "source": "Website"
}
```

**Props:** None (page-level)

**State:**

- `step` - "select" (choose lead) or "confirm" (create application)
- `search` - search query for leads
- `selected` - selected lead object or null
- `form` - object with `{ year, type }` for application configuration
- `creating` - loading state during application creation
- `createError` - error message if creation fails

**Key Functions:**

- `handleSelectLead(lead)` - Select a lead and advance to confirm step
- `handleCreateWithoutLead()` - Create application without lead
- `handleCreateApplication()` - Create the application via API and navigate

**API Integration:**

- Uses `useLeads` hook for lead fetching and searching
- Calls `createApplicationFromLead(leadId, academicYearId)` or `createApplicationWithoutLead(academicYearId)`
- Stores `activeAdmissionId` in sessionStorage for use in multi-step form
- Navigates to `/applications/form/:id` with state containing lead info and configuration

### MultiStepApplication.jsx (NEW - Main Application Form)

**Purpose:** Complete 6-step admission application form with auto-fill from lead data.

**Six Steps:**

1. **Student Information** - Name, DOB, gender, current school, class
2. **Parent/Guardian Information** - Father and mother details (name, phone, email, occupation)
3. **Academic Information** - Current class, board, GPA, subjects, previous school
4. **Photos** - Student photo, student Aadhar, parent photos and Aadhar cards
5. **Documents** - Birth certificate, transfer certificate, previous report cards, address proof, parent ID
6. **Review & Submit** - Review all information and submit application

**Data Integration:** Real API calls via `useApplication` hook:

- `GET /api/applications/:id/progress` → Current step and completion status
- `GET /api/applications/:id/details` → Application data for prefill
- `POST /api/applications/:id/student-info` → Save student info
- `POST /api/applications/:id/parent-info` → Save parent info
- `POST /api/applications/:id/academic-info` → Save academic info
- `POST /api/applications/:id/documents` → Upload documents and photos
- `POST /api/applications/:id/submit` → Submit final application

**Props:** None (page-level, gets ID from URL parameter and location state)

**Key Features:**

- Auto-fill student information from lead data if created from lead
- Multi-step navigation with back/next buttons
- Auto-save on each step
- Progress tracking showing completed steps
- File upload with preview for documents and photos
- Document type validation (birth_certificate, aadhaar_card, transfer_certificate, etc.)
- Photo capture and upload for student and parents
- Review step showing all entered information
- Error handling and loading states throughout
- Resume draft functionality - picks up from where user left off

**Key Functions:**

- `handleSaveStudentInfo(studentData)` - Save step 1
- `handleSaveParentInfo(parentData)` - Save step 2
- `handleSaveAcademicInfo(academicData)` - Save step 3
- `handleSaveDocuments(documentData)` - Save step 4-5
- `handleSubmitApplication()` - Final submission

**Expected Submission Shape:**

```json
{
  "lead_id": 1,
  "student_info": {
    "first_name": "Rohan",
    "last_name": "Sharma",
    "date_of_birth": "2015-08-20",
    "gender": "Male",
    "current_school": "ABC School",
    "current_class": "Grade 4"
  },
  "parent_info": {
    "father_name": "Rajesh Sharma",
    "father_phone": "9876543210",
    "father_email": "rajesh@example.com",
    "mother_name": "Priya Sharma",
    "mother_phone": "9876543211"
  },
  "academic_info": {
    "board": "ICSE",
    "previous_school": "ABC School",
    "last_gpa": "9.5",
    "subjects": ["Math", "Science", "English"]
  },
  "documents": [
    {
      "type": "birth_certificate",
      "file": "File object",
      "file_path": "/uploads/app001-birth-cert.pdf"
    }
  ],
  "academic_year_id": 2026
}
```

### NewApplication.jsx

**Purpose:** Legacy placeholder for new application (currently integrated into CreateApplication and MultiStepApplication flow).

**Current Status:** Maintained for backward compatibility. Main workflow now flows through CreateApplication → MultiStepApplication.

---

## Section 4 — Component hierarchy (high-level)

**Applications Feature Architecture:**

```
ApplicationsPage (route `/applications`)
├─ StatsCard (stat rendering - Total, Submitted, Under Review, etc.)
├─ SearchBar (search input)
├─ StatusFilter (dropdown filter)
├─ ApplicationsTable (table rows)
└─ DraftApplications (expandable section with draft apps)

CreateApplication (route `/applications/create`)
├─ LeadSearchBar (search with API)
├─ LeadList (table with eligible leads)
├─ LeadCard (selected lead display)
└─ ApplicationConfirmation (year selection and create button)

MultiStepApplication (route `/applications/form/:id`) - NEW
├─ StepIndicator (showing current step 1-6)
├─ StudentInfoStep
│  ├─ Name, DOB, Gender inputs
│  ├─ Current School input
│  ├─ Class dropdown with normalization
│  └─ Previous class auto-display
├─ ParentInfoStep (ParentForm component)
│  ├─ Father details section
│  ├─ Mother details section
│  └─ Address fields
├─ AcademicInfoStep
│  ├─ Current Class dropdown
│  ├─ Board selection
│  ├─ GPA input
│  └─ Subjects multi-select
├─ PhotoUploadStep
│  ├─ Student photo section
│  ├─ Student Aadhar upload
│  ├─ Father photo & Aadhar
│  ├─ Mother photo & Aadhar
│  └─ File previews
├─ DocumentUploadStep
│  ├─ Birth certificate upload
│  ├─ Transfer certificate upload
│  ├─ Previous report card upload
│  ├─ Address proof upload
│  └─ File previews with validation
├─ ReviewStep
│  ├─ Summary of all steps
│  ├─ Document list display
│  └─ Submit button
├─ Navigation (Back/Next buttons)
├─ ProgressTracker (shows completed steps)
└─ ErrorHandler (displays validation errors)

NewApplication (route `/applications/new`) - Legacy
└─ Multi-step form (minimal usage)
```

**Shared Components Used:**

- `Layout.jsx` — App shell (header, sidebar, main content outlet)
- `ParentForm.jsx` — Reusable parent information form component (used in MultiStepApplication Step 2)
- `HealthCheck.jsx` — Simple status widget

**Note:** Document upload uses file validation, type detection, and size limits (max 5MB). Photos require specific dimensions validation in production.

---

## Section 5 — Data flow

**Canonical flow for any page:**

1. UI component mounts
2. Component calls a `service` function in `src/services/` (e.g., `applicationService`) that wraps `fetch`
3. `service` sends request to backend API (`/api/*`), passing auth header from `src/utils/authToken.js`
4. Backend processes and responds with JSON
5. Service returns parsed JSON to component (or custom hook)
6. Component/hook updates state via `useState` and re-renders

**Application Creation Flow (NEW):**

1. User navigates to `/applications` → `Applications.jsx` mounts
2. `useEffect` calls `getApplicationCounts()`, `getDraftApplications()`, `getApplications()`
3. Services call backend endpoints, get data, populate stats cards and applications table
4. User clicks "New Application" → navigate to `/applications/create`
5. `CreateApplication.jsx` mounts → `useLeads` hook fetches eligible leads
6. User selects a lead or chooses manual entry
7. User confirms → calls `createApplicationFromLead()` or `createApplicationWithoutLead()` service
8. Service sends `POST /api/applications` or `POST /api/applications/new`
9. Backend creates application record, returns `{ id, current_step, status }`
10. Frontend stores `activeAdmissionId` in sessionStorage
11. Navigate to `/applications/form/:id` with location state containing lead data
12. `MultiStepApplication.jsx` mounts → `useApplication` hook loads application
13. Hook fetches progress and details via `getApplicationProgress()` and `getApplicationDetails()`
14. User fills each step:
    - Step 1 → calls `saveStudentInfo()` → `POST /api/applications/:id/student-info`
    - Step 2 → calls `saveParentInfo()` → `POST /api/applications/:id/parent-info`
    - Step 3 → calls `saveAcademicInfo()` → `POST /api/applications/:id/academic-info`
    - Steps 4-5 → calls `saveDocuments()` → `POST /api/applications/:id/documents` (multipart form data)
    - Step 6 → calls `submitApplication()` → `POST /api/applications/:id/submit`
15. After submission → redirect to `/applications` with success state

**Lead Creation Flow (existing):**

- `AddLead.jsx` collects form → calls `leadService.createLead(payload)`
- `leadService.createLead` builds headers via `getAuthHeader()` and posts to `/api/leads`
- Backend returns created lead → UI shows confirmation

**Auth header provider (in `src/utils/authToken.js`):**

- `getAuthHeader()` returns `{ 'Content-Type': 'application/json', 'Authorization': 'Bearer <token>' }` or `null`.
- `isAuthenticated()` uses `sessionStorage` presence to gate protected routes.

**Custom Hooks for API Integration:**

- `useApplication(applicationId)` - Manages multi-step application state, fetches progress and details, provides save handlers
- `useLeads(searchQuery, isEligibleOnly)` - Fetches leads with optional search and filtering
- `useAdmissions()` - Fetches admissions stats and list
- `useUpcomingFollowups()` - Fetches upcoming follow-ups for widgets

These hooks encapsulate `useEffect`, error handling, and loading states, making components cleaner.

---

## Section 6 — API integration

The frontend uses multiple service files for API integration, each handling a specific domain:

### `src/services/leadService.js` — Base URL `http://localhost:5001/api/leads`

Key endpoints:

- POST `/api/leads` - Create new lead
  - Request: JSON body with lead fields
  - Response: `{ success: true, data: lead, message }`

- GET `/api/leads` - Get all leads (with optional filters)
  - Query params: `follow_up_status`, `desired_class`, `assigned_to`
  - Response: `{ success: true, data: [leads] }`

- GET `/api/leads/:id` - Get lead by ID
  - Response: `{ success: true, data: lead }`

- PUT `/api/leads/:id` - Update lead
  - Request: Partial lead object
  - Response: `{ success: true, data: updatedLead }`

- DELETE `/api/leads/:id` - Delete lead
  - Response: `204` on success

- GET `/api/leads/followups/upcoming` - Get upcoming follow-ups
  - Query params: `interval` (days), `limit`
  - Response: `{ success: true, data: [followups], count }`

### `src/services/dashboardService.js` — Base URL `http://localhost:5001/api/dashboard`

Dashboard statistics and data:

- GET `/api/dashboard` - Get dashboard stats
  - Response: `{ success: true, data: { totalInquiries, conversionRate, activeLeads, ... } }`

- GET `/api/dashboard/funnel` - Get admission funnel data
  - Response: `{ success: true, data: { inquiry, contacted, interested, visit, applied, enrolled } }`

- GET `/api/dashboard/monthly-trend` - Get monthly trends
  - Response: `{ success: true, data: [{ month, inquiries, enrollments }] }`

- GET `/api/dashboard/grade-distribution` - Get grade distribution
  - Response: `{ success: true, data: [{ label, value }] }`

- GET `/api/dashboard/counselor-performance` - Get counselor performance
  - Response: `{ success: true, data: [{ name, leads, conversions, pct }] }`

- GET `/api/health` - Health check
  - Response: `{ success: true, message, timestamp, environment }`

### `src/services/applicationService.js` — Base URL `http://localhost:5001/api/applications`

**Application management (UPDATED with full API integration):**

**Creating Applications:**

- POST `/api/applications` - Create application from lead
  - Request: `{ lead_id, academic_year_id }`
  - Response: `{ success: true, data: { id, current_step, status } }`

- POST `/api/applications/new` - Create application without lead
  - Request: `{ academic_year_id }`
  - Response: `{ success: true, data: { id, current_step, status } }`

**Getting Applications:**

- GET `/api/applications/counts` - Get application counts by status (NEW)
  - Response: `{ success: true, data: { total, submitted, under_review, approved, rejected, waitlisted, draft } }`

- GET `/api/applications/draft` - Get draft applications (NEW)
  - Response: `{ success: true, data: [{ id, student_name, current_step, status }] }`

- GET `/api/applications?limit=100&offset=0` - Get all applications with pagination
  - Query: `limit` (default 100), `offset` (default 0)
  - Response: `{ success: true, data: [applications], pagination: {...} }`

- GET `/api/applications/search?query=<term>` - Search applications by student name or ID (NEW)
  - Query: `query` (required), `limit` (optional)
  - Response: `{ success: true, data: [matching applications] }`

- GET `/api/applications/eligible-leads?search=<term>&limit=10` - Get eligible leads for application (NEW)
  - Query: `search` (optional), `limit` (default 10)
  - Response: `{ success: true, data: [eligible leads] }`

- GET `/api/applications/:id/resume` - Resume draft application (NEW)
  - Response: `{ success: true, data: { id, status, current_step, student_info, parent_info, ... } }`

- GET `/api/applications/:id/progress` - Get application progress/step status (NEW)
  - Response: `{ success: true, data: { current_step, status, steps: {...} } }`

- GET `/api/applications/:id/details` - Get full application details for prefill (NEW)
  - Response: `{ success: true, data: { application, student_info, parent_info, academic_info, photos, documents } }`

**Saving Application Steps:**

- POST `/api/applications/:id/student-info` - Save student info (Step 1)
  - Request: `{ first_name, last_name, date_of_birth, gender, current_school, current_class }`
  - Response: `{ success: true, message: "..." }`

- POST `/api/applications/:id/parent-info` - Save parent info (Step 2)
  - Request: `{ father_name, father_phone, father_email, mother_name, mother_phone, mother_email, address }`
  - Response: `{ success: true, message: "..." }`

- POST `/api/applications/:id/academic-info` - Save academic info (Step 3)
  - Request: `{ board, previous_school, current_class, last_gpa, subjects }`
  - Response: `{ success: true, message: "..." }`

- POST `/api/applications/:id/documents` - Upload documents and photos (Steps 4-5) (multipart/form-data)
  - Request: FormData with file objects and document type metadata
  - Response: `{ success: true, data: { documents: [...], photos: [...] } }`

- POST `/api/applications/:id/submit` - Submit final application (Step 6)
  - Request: `{ confirmation: true }`
  - Response: `{ success: true, data: { application_id, status: 'SUBMITTED', submitted_date }, message: "..." }`

**Service Functions Exported:**

- `createApplicationFromLead(leadId, academicYearId)`
- `createApplicationWithoutLead(academicYearId)`
- `getEligibleLeads(searchQuery, limit)`
- `getApplicationCounts()`
- `getDraftApplications()`
- `getApplications({ limit, offset })`
- `searchApplications(queryText, limit)`
- `resumeDraftApplication(applicationId)`
- `getApplicationProgress(applicationId)`
- `getApplicationDetails(applicationId)`
- `saveStudentInfo(applicationId, studentData)`
- `saveParentInfo(applicationId, parentData)`
- `saveAcademicInfo(applicationId, academicData)`
- `saveDocuments(applicationId, documentData)` (multipart)
- `submitApplication(applicationId)`

### `src/services/admissionService.js` — Base URL `http://localhost:5001/api/admissions`

Admission processing:

- GET `/api/admissions/stats` - Get admission statistics
  - Response: `{ success: true, data: { total, submitted, under_review, approved, waitlisted } }`

- GET `/api/admissions/search` - Search admissions
  - Query: `query` (name or phone)
  - Response: `{ success: true, data: [admissions] }`

- GET `/api/admissions` - Get all admissions (paginated)
  - Query: `limit`, `offset`
  - Response: `{ success: true, data: [admissions], pagination }`

- GET `/api/admissions/:id` - Get admission details
  - Response: `{ success: true, data: admission }`

Notes: All services use JWT authentication via `Authorization: Bearer <token>` header and standardize responses to `{ success: boolean, data: any, message?: string }`.

---

## Section 7 — State management

**Current Approach:** Local component state using React hooks + custom hooks for API data fetching.

**Patterns used:**

- `useState` for local state (forms, filters, selected items)
- `useEffect` for API calls on component mount and when dependencies change
- Custom hooks (`useApplication`, `useLeads`, etc.) to encapsulate data fetching logic
- `sessionStorage` for auth tokens and application session IDs
- `location.state` to pass data between page routes (e.g., lead data when navigating from CreateApplication to MultiStepApplication)

**Where state lives:**

- **Page-level (Applications.jsx):**
  - `stats`, `applications`, `draftApplications`, `filteredApps` - from API
  - `search`, `filter`, `showDrafts` - UI state
  - `loading`, `error` - async state

- **Page-level (CreateApplication.jsx):**
  - `step`, `search`, `selected`, `form` - form state
  - `creating`, `createError` - async state
  - Lead data comes from `useLeads` hook

- **Page-level (MultiStepApplication.jsx):**
  - All application data and handlers come from `useApplication` hook
  - `formData` for current step input
  - `selectedFiles` for document/photo uploads

- **Hook-level (useApplication.js - NEW):**
  - `progress`, `details` - application data from API
  - `currentStep` - current step tracking
  - `loading`, `error` - async states
  - Save handlers for each step

- **Hook-level (useLeads.js):**
  - `leads` - list of leads
  - `loading`, `error` - async states
  - Auto-fetches when search query or isEligibleOnly changes

- **Global/Session:**
  - `sessionStorage.activeAdmissionId` - active application ID for multi-step form
  - `sessionStorage.authToken` - JWT token for API requests

**Recommendations:**

- For larger datasets or complex state interactions, consider React Context for auth + user info
- For server state management (caching, revalidation), consider React Query (TanStack Query)
- Keep service layer for API calls and hooks for UI-specific state encapsulation
- Use custom hooks to decouple data fetching from component rendering

---

## Section 8 — Props & expected data (summary)

Most current pages are self-contained and do not accept props. For future componentization, use these interfaces:

- `StatsCard` (stat label)
  - Props: `{ label: string, value: number, color?: string }`
- `ApplicationsTable` (list of applications)
  - Props: `{ items: Array<Application>, onView: (id) => void }`
  - `Application` shape: `{ id, name, grade, contact, submitted, status }`
- `LeadCard` / `LeadList`
  - Props: `{ lead: { id, name, grade, contact, email, score }, onSelect: (lead) => void }`
- `FullApplicationForm` (multi-step)
  - Props: `{ initialData?: ApplicationDraft, onSubmit: (payload) => Promise }`

---

## Section 9 — Component-level responsibilities & quick map

- **Layout.jsx** — Renders header, nav, sidebar; includes logout link; contains `<Outlet/>` for nested routes.
- **Login.jsx** — Login form; calls `POST /api/auth/login`; saves token to sessionStorage via `authToken.js`.
- **Leads.jsx** / **AddLead.jsx** — Leads listing and creation UI; call `leadService` with real API integration.
- **Applications.jsx** (UPDATED) — Stats and applications list with draft tracking; calls real API endpoints for counts, drafts, and applications list with search and filter.
- **CreateApplication.jsx** (UPDATED) — Lead selection and application creation; integrates `useLeads` hook and real API calls.
- **MultiStepApplication.jsx** (NEW) — Complete 6-step application form; uses `useApplication` hook to manage form state and API integration; handles file uploads.

### Custom Hooks Responsibilities

- **useApplication.js** (NEW) — Manages multi-step application lifecycle:
  - Fetches application progress and details on mount
  - Provides handlers for saving each step (`handleSaveStudentInfo`, `handleSaveParentInfo`, etc.)
  - Tracks current step and completed steps
  - Manages loading and error states

- **useLeads.js** — Manages lead data fetching:
  - Auto-fetches leads based on search query
  - Supports filtering for eligible leads only
  - Handles pagination
  - Manages loading and error states

- **useAdmissions.js** — Manages admissions data:
  - Fetches admissions list with pagination
  - Fetches admission statistics
  - Handles filtering and searching

### Service Layer Responsibilities

- **applicationService.js** (UPDATED) — All application-related API calls:
  - Application creation (from lead or manual)
  - Fetching application lists, stats, drafts
  - Searching and filtering applications
  - Step-by-step form saving
  - Final submission

- **leadService.js** — All lead-related API calls
- **admissionService.js** — All admission-related API calls
- **dashboardService.js** — Dashboard statistics and analytics

---

## Section 9.5 — Application Form Data Flow (Summary)

1. User creates application (CreateApplication.jsx)
2. API call → POST /api/applications
3. Redirect to MultiStepApplication with application ID
4. API call → GET /api/applications/:id/details
5. Lead data received (if created from lead)
6. useEffect maps lead → formData
7. Form auto-fills automatically for human review

---

---

## Section 9.6 — Component Responsibility Table

| Component | Responsibility | API Calls |
|----------|---------------|-----------|
| **CreateApplication.jsx** | Create new application (from lead or manual) | `POST /api/applications`, `GET /api/leads` |
| **MultiStepApplication.jsx** | Handle form workflow + auto-fill from lead | `GET /api/applications/:id/details` |
| **useApplication.js** | API communication & state management hook | `POST /api/applications/:id/[step]` |

---

**Key Insight:** `useApplication` hook is the brain of the multi-step form. It owns all API communication and state management for the application workflow.

---

## Section 9.7 — Auto-Fill Logic (Frontend)

**Explicit Behavior:**
- Auto-fill happens **ONLY** in the frontend.
- It is triggered when an application is created from a lead.
- Based on `lead_data` received from the API/context.
- Implemented using a `useEffect` hook in `MultiStepApplication.jsx`.

**Sample Mapping Code:**

```javascript
useEffect(() => {
  if (leadData && !formData.student_name) {
    setFormData(prev => ({
      ...prev,
      student_name: `${leadData.first_name} ${leadData.last_name}`,
      parent_name: leadData.parent_name || "",
      parent_phone: leadData.phone || ""
    }));
  }
}, [leadData]);
```

---

---

## Section 9.8 — State Structure Example

Below is the standard `formData` structure used within the multi-step form:

```javascript
formData = {
  student_name: "",
  parent_name: "",
  parent_phone: "",
  current_class: "",
  academic_year: ""
}
```

---
```

**How useApplication Hook Manages State:**

```javascript
const useApplication = (applicationId) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [completedSteps, setCompletedSteps] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch on mount
  useEffect(() => {
    const fetchApplicationData = async () => {
      try {
        setLoading(true);
        const progress = await getApplicationProgress(applicationId);
        const details = await getApplicationDetails(applicationId);

        setCurrentStep(progress.current_step);
        setCompletedSteps(progress.completedSteps);
        // Pre-populate formData based on current step
        setFormData(extractFormDataForStep(details, progress.current_step));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationData();
  }, [applicationId]);

  // Save handlers for each step
  const handleSaveStudentInfo = async (studentData) => {
    try {
      setLoading(true);
      await saveStudentInfo(applicationId, studentData);
      setCompletedSteps((prev) => ({ ...prev, 1: true }));
      setCurrentStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ... similar handlers for other steps ...

  return {
    currentStep,
    formData,
    setFormData,
    completedSteps,
    loading,
    error,
    handleSaveStudentInfo,
    handleSaveParentInfo,
    // ... other handlers ...
  };
};
```

---

## Section 10 — Common Issues & Solutions

- **Missing lead_id**: Ensure `lead_id` is passed correctly in `POST /api/applications`.
- **API response structure mismatch**: Verify that backend fields match the frontend `formData` keys.
- **Field name mismatch**: Check for camelCase vs snake_case inconsistencies.
- **Parent fields not mapped**: Ensure Step 2 logic handles parent detail extraction.
- **State not updating**: Confirm that `setFormData` is called within the correct `useEffect` dependency array.

---

---

## Section 11 — Application Architecture Specifics

### Multi-Step Form Design

The multi-step application form is built with the following architecture:

**Step Auto-Save:**

- Each step saves automatically when user clicks "Next"
- Validates before allowing progression
- Displays errors inline if validation fails
- Can resume from where user left off

**Document Upload Specifications:**

- Maximum file size: 5MB per file
- Allowed formats: PDF, JPG, PNG
- Document types: birth_certificate, aadhaar_card, transfer_certificate, previous_report_card, address_proof, parent_id_proof
- Photo types: student_photo, parent_photo
- All documents uploaded as multipart/form-data to `/api/applications/:id/documents`

**Class Normalization:**

- Accepts formats: "Nursery", "Jr KG", "Sr KG", "Class 1-12"
- Automatically calculates previous class for display
- Handles case-insensitive input

**Lead Data Integration:**

- When creating from lead, student name is auto-populated
- Lead contact info can be pre-filled for parent details
- Lead source tracked for analytics

### API Response Standardization

All application endpoints follow this response format:

```json
{
  "success": true,
  "data": {
    /* endpoint-specific data */
  },
  "message": "Human-readable message"
}
```

Errors:

```json
{
  "success": false,
  "message": "Error description",
  "error_code": "OPTIONAL_ERROR_CODE"
}
```

---

## Section 12 — Recommended improvements & next steps

**Completed in this update:**

- ✅ Full API integration for applications workflow
- ✅ Multi-step form with auto-save
- ✅ Draft application management
- ✅ Custom hooks for data fetching
- ✅ Document and photo upload
- ✅ Application progress tracking

**Recommended future improvements:**

1. **Form state persistence:**
   - Cache form data in localStorage for better UX
   - Auto-recover unsaved data on page reload

2. **Component extraction:**
   - Move form steps into separate components (`StudentForm`, `ParentForm`, `AcademicForm`)
   - Create reusable `DocumentUploadComponent`
   - Extract file preview component

3. **Validation enhancement:**
   - Add real-time field-level validation
   - Implement phone number formatting
   - Add date picker for date fields
   - Email validation for parent emails

4. **UI/UX improvements:**
   - Add progress bar showing completion percentage
   - Add "Save as Draft" button on each step
   - Add "Auto-save" indicator
   - Add file upload progress feedback

5. **Performance optimizations:**
   - Implement React Query for server state
   - Add pagination to applications list
   - Implement virtual scrolling for large lists
   - Add debouncing to search input

6. **Accessibility:**
   - Add ARIA labels to form fields
   - Improve keyboard navigation
   - Add form error announcements
   - Better color contrast for status badges

7. **Analytics:**
   - Track which steps users abandon
   - Log form submission success/failure
   - Track file upload performance

---

**Last Updated:** April 21, 2026  
**Documentation Version:** 2.0  
**Frontend Status:** Applications module complete with full API integration and multi-step form
