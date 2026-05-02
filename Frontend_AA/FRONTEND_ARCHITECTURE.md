# Frontend Architecture Document

**Project:** School ERP System (Frontend_AA)  
**Date:** May 2, 2026  
**Version:** 2.0

This document defines the React.js architecture, state management strategies, component hierarchy, and complete data flow mapping for the comprehensive School ERP system, serving as the source of truth for frontend developers.

---

## 1. React.js Structure

The frontend is built using **Vite + React.js** following a scalable, feature-based folder organization pattern with enterprise-grade state management.

### 1.1 Directory Layout

```text
src/
├── assets/              # Static images, global styles, SVGs, and branding assets
├── components/          # Reusable, presentational UI components
│   ├── Layout.jsx       # Main wrapper with navigation & auth checks
│   ├── ProtectedRoute.jsx # Role-based access control enforcement
│   ├── StatsCard.jsx    # Reusable dashboard metrics display
│   ├── ApplicationsTable.jsx # Paginated data table with filters
│   ├── CounselingModal.jsx # Counseling workspace task modals
│   ├── CommunicationModal.jsx # Email/SMS/WhatsApp compose UI
│   ├── ToastContext.jsx # Global notification system
│   └── [Component].jsx  # Others (HealthCheck, LogoutButton, CounselorSelect, etc.)
├── context/             # React Context providers for global state
│   └── AuthContext.jsx  # Authentication state, JWT token, user profile
├── hooks/               # Custom React hooks encapsulating business logic
│   ├── useApplication.js # Multi-step application lifecycle management
│   ├── useLeads.js      # Lead CRM operations and filtering
│   ├── useCounseling.js # Campus visits and task management
│   ├── useCommunication.js # Email, SMS, WhatsApp campaign orchestration
│   └── [Hook].js        # Others (useAuth, useDashboard, useAdmission, etc.)
├── pages/               # Route targets / View components (full-page layouts)
│   ├── Dashboard.jsx    # Main admission funnel analytics dashboard
│   ├── Leads.jsx        # Lead CRM management with filtering
│   ├── AddLead.jsx      # Single-step lead creation form
│   ├── Pipeline.jsx     # Sales funnel visualization (lead progression)
│   ├── Counseling.jsx   # Campus visits workspace & task management
│   ├── ScheduleVisit.jsx # Campus visit creation and scheduling
│   ├── Communication.jsx # Multi-channel messaging center (email, SMS, WhatsApp)
│   ├── Applications.jsx  # List all applications with status filtering
│   ├── CreateApplication.jsx # Select lead or create manual application
│   ├── MultiStepApplication.jsx # 6-step admission form workflow
│   ├── Screening.jsx    # Pre-admission candidate screening
│   ├── OffersSeats.jsx  # Offer generation and seat allocation
│   ├── FeesPayments.jsx # Fee structure and payment tracking
│   ├── Enrollment.jsx   # Final enrollment processing and student record creation
│   ├── Reports.jsx      # Custom reports and data exports
│   ├── AdminPortal.jsx  # User management, school settings, role administration
│   ├── Login.jsx        # Authentication entry point
│   └── [Page].jsx       # Others (Security, Settings)
├── services/            # Axios/Fetch API wrappers mapping to backend endpoints
│   ├── applicationService.js # Multi-step application endpoints
│   ├── leadService.js   # Lead CRUD and search
│   ├── CounselingService.js # Campus visits and counseling workspace
│   ├── communicationService.js # Email, SMS, WhatsApp, templates
│   ├── authService.js   # Login, signup, token validation
│   ├── dashboardService.js # Analytics and metrics
│   ├── emailService.js  # Email-specific operations
│   └── [Service].js     # Others (admission, school, parent, user management)
├── utils/               # Pure utility functions and helpers
│   ├── authToken.js     # JWT token management (get, set, clear from sessionStorage)
│   ├── validators.js    # Form validation rules
│   ├── formatters.js    # Date, phone, currency formatting
│   ├── errorHandler.js  # Centralized error message parsing
│   └── [Util].js        # Others (constants, API config, etc.)
├── App.jsx              # Root application component defining routing topology
├── main.jsx             # React application entry point with React DOM
└── style.css            # Global stylesheet (Tailwind or custom CSS)
```

---

## 2. Routing Topology & Pages

Routing is managed via `react-router-dom` with **protected routes** requiring JWT authentication. Routes are split into **Public** (login) and **Protected** (Dashboard, Leads, Applications, etc.) with role-based access control via `ProtectedRoute`.

### 2.1 Route Structure

```
/
├── /login                          # Public: User authentication
├── /admin-login                    # Public: Admin authentication
└── / [Protected Layout]
    ├── /dashboard                  # Analytics and metrics overview
    ├── /leads                       # Lead CRM management
    │   └── /leads/add              # Create new lead
    ├── /pipeline                   # Lead funnel visualization
    ├── /communication               # Email, SMS, WhatsApp, campaigns
    ├── /counseling                 # Campus visits and tasks workspace
    │   └── /counseling/schedule-visit # Schedule campus visit
    ├── /applications               # All applications listing
    │   ├── /applications/create    # Select lead or walk-in
    │   ├── /applications/form/:id  # Multi-step form for :id
    │   ├── /applications/new       # Direct new application (no lead)
    │   └── /application/:id        # Alternative path for form/:id
    ├── /screening                  # Pre-admission screening candidates
    ├── /offers-seats               # Offer generation and seat allocation
    ├── /fees-payments              # Fee structure and payment tracking
    ├── /enrollment                 # Final enrollment processing
    ├── /reports                    # Custom analytics reports
    ├── /security                   # Security and password management
    ├── /settings                   # User and school settings
    ├── /admin [role='admin']       # Admin portal (user and role management)
    │   ├── /admin/users            # User CRUD operations
    │   └── /admin/management       # School and system administration
    └── /* [catch-all]              # Redirect to /dashboard
```

---

## 3. State Management Strategy

The application uses a **hybrid state management** approach optimized for performance and developer experience:

### 3.1 Global/Session State (React Context)

```javascript
// AuthContext stores authentication state and persists across refreshes
- JWT token (sessionStorage)
- User profile (id, email, school_id, role)
- Active session metadata
```

**Persistence:** `sessionStorage` ensures user remains logged in during page refreshes within their session but clears when the browser tab closes (security best practice).

### 3.2 Server State (Custom Hooks + React Query Pattern)

Custom hooks encapsulate API interactions and data fetching:

```javascript
useApplication(); // Manages application data, progress tracking, step auto-save
useLeads(); // Lead filtering, search, assignment tracking
useCounseling(); // Campus visits, task management, assignment
useCommunication(); // Email/SMS/WhatsApp logs, template management, campaign tracking
useDashboard(); // Real-time metrics, funnel analytics
```

**Pattern:** Each hook returns `{ data, loading, error, refetch }` to decouple data fetching from UI components. Hooks internally manage caching and prevent duplicate API calls.

### 3.3 Local Component State (React Hooks)

- `useState` for localized UI interactions (modals, tabs, form inputs, sorting)
- `useReducer` for complex multi-field form state in `MultiStepApplication` and `CounselingWorkspace`
- `useCallback` and `useMemo` to prevent unnecessary re-renders in tables and lists

### 3.4 Inter-Route Data Passing (React Router State)

Router's `location.state` is used to pass transient data between routes:

```javascript
// When navigating from /leads to /applications/form/:id
navigate(`/applications/form/${leadId}`, {
  state: { lead: selectedLead, source: "leads" },
});

// In MultiStepApplication.jsx, the lead object auto-fills Step 1
const { lead } = location.state || {};
```

---

## 4. Multi-Step Application Form (6-Step Admission Workflow)

### 4.1 Component: MultiStepApplication.jsx

Implements a robust, stateful 6-step admission form with auto-save functionality. Managed by the `useApplication` custom hook.

**Step Breakdown:**

1. **Student Information** - Name, DOB, gender, blood group, Aadhar number
2. **Parent/Guardian Information** - Primary contact, secondary contact, occupation, income
3. **Academic Information** - Current class, academic history, special achievements
4. **Photos Upload** - Student photograph (multipart/form-data)
5. **Documents Upload** - Birth certificate, Aadhar, marksheets, transfer certificate
6. **Review & Submit** - Verify all data, digital signature consent, final submission

**Key Features:**

- **Auto-Save:** Each step triggers independent `POST /api/applications/:id/{step}-info`
- **Progress Tracking:** `GET /api/applications/:id/progress` fetches `overall_completion` and `currentStep`
- **Validation:** Client-side validation before each step submission
- **Error Recovery:** Incomplete applications resume at last completed step
- **Multipart Handling:** Photos and documents use `FormData` API

### 4.2 Auto-Fill Logic (Leads → Application Data Mapping)

**Critical Context:** Backend does **NOT** auto-populate application fields. Auto-fill is strictly a **frontend responsibility**.

**Execution:**
When a user creates an application from an existing Lead, the Lead object is passed via `location.state` to `MultiStepApplication.jsx`. Upon mounting Step 1, if Lead data exists and form is empty, the following field mapping occurs:

```javascript
// Auto-fill mapping (implemented in MultiStepApplication.jsx)
useEffect(() => {
  if (locationState?.lead && currentStep === 1 && !formData.first_name) {
    setFormData((prev) => ({
      ...prev,
      first_name: locationState.lead.first_name || "",
      last_name: locationState.lead.last_name || "",
      email: locationState.lead.email || "",
      phone: locationState.lead.phone || "",
      desired_class: locationState.lead.desired_class || "",
    }));
  }
}, [locationState?.lead, currentStep]);
```

**Field Mapping Reference:**
| Lead Field | Application Field | Notes |
|---|---|---|
| `first_name` | `student.first_name` | Auto-filled on Step 1 mount |
| `last_name` | `student.last_name` | Auto-filled on Step 1 mount |
| `email` | `student.email` | Auto-filled on Step 1 mount |
| `phone` | `student.phone` | Auto-filled on Step 1 mount |
| `desired_class` | `student.current_class` | Auto-filled on Step 1 mount |
| ✗ | `student.date_of_birth` | NOT mapped (manual entry in Step 1) |
| ✗ | `student.gender` | NOT mapped (manual entry in Step 1) |
| ✗ | `student.blood_group` | NOT mapped (manual entry in Step 1) |
| ✗ | `student.aadhar_number` | NOT mapped (manual entry in Step 1) |
| ✗ | `parent_detail.*` | NOT mapped (entirely manual in Step 2) |
| ✗ | `academic_details.*` | NOT mapped (entirely manual in Step 3) |

---

## 5. Counseling Workspace Module

### 5.1 Pages: Counseling.jsx & ScheduleVisit.jsx

**Counseling.jsx** is a real-time task management and campus visit coordination center. It displays:

- **Dashboard Stats:** Assigned leads count, upcoming visits, pending tasks
- **Future Visits:** Scheduled campus visits with visitor details, time, and actions (edit, mark complete)
- **Missed Visits:** Overdue visits requiring follow-up
- **Assigned Leads:** Leads assigned to the current counselor for follow-up

**ScheduleVisit.jsx** provides a form to schedule new campus visits with:

- Lead selection / visitor name entry
- Visit date and time selection
- Capacity tracking and section assignment
- Counselor assignment

**Data Fetching (CounselingService):**

```javascript
CounselingService.getDashboardStats(); // Fetch stats
CounselingService.fetchFutureVisits(); // Fetch upcoming visits
CounselingService.fetchMissedVisits(); // Fetch overdue visits
CounselingService.getAssignedLeads(); // Get leads assigned to counselor
CounselingService.createVisit(); // Schedule new visit
CounselingService.updateVisit(); // Update visit details
CounselingService.deleteVisit(); // Cancel visit
CounselingService.markVisitComplete(); // Mark visit as completed
```

---

## 6. Communication Module (Multi-Channel Messaging)

### 6.1 Pages: Communication.jsx

Centralized multi-channel communication center supporting Email, SMS, WhatsApp, and email Campaigns.

**Tabs:**

1. **Email Tab** - Compose emails, view logs, track open/click rates
2. **SMS Tab** - Send SMS messages, view delivery status
3. **WhatsApp Tab** - Send WhatsApp messages, view conversation history
4. **Campaigns Tab** - Create and manage email campaigns with templates

**Key Components:**

- **Compose Modal** - Multi-channel message composition with template selection
- **Recipient Selection** - Multi-select from leads, students, parents, or custom lists
- **Template Management** - Create, edit, delete reusable message templates
- **Scheduling** - Send immediately or schedule for future delivery
- **Analytics** - Email open rates, click rates, delivery status tracking

**Data Fetching (communicationService):**

```javascript
fetchEmailLogs(); // Email delivery history
fetchEmailStats(); // Open rates, click rates
fetchSmsLogs(); // SMS delivery history
fetchWhatsappLogs(); // WhatsApp message history
fetchCampaigns(); // Email campaign list
fetchAllCommunicationRecipients(); // Recipients for message composition
sendComposeEmail(); // Send email
// Similar methods for SMS and WhatsApp
```

---

## 7. Dashboard & Analytics

### 7.1 Dashboard.jsx

Real-time admission funnel metrics including:

- **Key Metrics:** Total leads, applications submitted, admission conversion rate
- **Funnel Chart:** Visual representation of lead → application → admission flow
- **Recent Activities:** Timeline of recent applications, admissions, communications
- **Lead Status Breakdown:** Count by follow-up status (pending, contacted, interested, converted, lost)

**Data Source:** `dashboardService.js` → Backend `/api/dashboard/*` endpoints

---

## 8. Application Flow Architecture

### 8.1 Lead Creation to Admission Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   USER WORKFLOW                              │
└─────────────────────────────────────────────────────────────┘

1. CREATE LEAD
   ├── /leads/add (AddLead.jsx)
   ├── Form: first_name, last_name, email, phone, desired_class, source, notes
   ├── API: POST /api/leads
   └── Result: Lead created in database (follow_up_status: 'pending')

2. MANAGE LEADS
   ├── /leads (Leads.jsx)
   ├── Display: Lead list with filters (status, class, assigned_to)
   ├── API: GET /api/leads?follow_up_status=...&desired_class=...
   └── Actions: View, Edit, Assign to counselor, Update status

3. SCHEDULE CAMPUS VISIT (Optional)
   ├── /counseling/schedule-visit (ScheduleVisit.jsx)
   ├── Link: Select from leads assigned to counselor
   ├── API: POST /api/counseling/visits
   └── Result: Visit scheduled, counselor notified

4. CREATE APPLICATION
   ├── /applications/create (CreateApplication.jsx)
   ├── Options:
   │   ├── From existing Lead (pre-fills Step 1)
   │   └── Walk-in application (manual entry)
   ├── API: POST /api/applications (creates admission draft)
   └── Result: Application ID generated, user redirected to form

5. FILL 6-STEP FORM
   ├── /applications/form/:id (MultiStepApplication.jsx)
   ├── Step 1: Student Information → POST /api/applications/:id/student-info
   ├── Step 2: Parent/Guardian → POST /api/applications/:id/parent-info
   ├── Step 3: Academic Info → POST /api/applications/:id/academic-details
   ├── Step 4: Photos → POST /api/applications/:id/photos (multipart)
   ├── Step 5: Documents → POST /api/applications/:id/documents (multipart)
   ├── Step 6: Review & Submit → POST /api/applications/:id/review
   └── Progress Tracking: GET /api/applications/:id/progress (auto-updates UI)

6. SUBMISSION & APPROVAL
   ├── Application marked as 'submitted'
   ├── Admin reviews in /screening (Screening.jsx)
   ├── API: GET /api/admissions/search?status=submitted
   └── Admin approves or requests modifications

7. GENERATE OFFER
   ├── /offers-seats (OffersSeats.jsx)
   ├── Admin generates admission offer with seat allocation
   ├── API: POST /api/admissions/create
   └── Result: Admission record created, student linked

8. ENROLLMENT
   ├── /enrollment (Enrollment.jsx)
   ├── Final enrollment processing
   ├── API: POST /api/students/enroll
   └── Result: Student profile created with admission details

┌─────────────────────────────────────────────────────────────┐
│              OPTIONAL: COMMUNICATION FLOWS                   │
└─────────────────────────────────────────────────────────────┘

SEND COMMUNICATION
├── /communication (Communication.jsx)
├── Compose: Email, SMS, WhatsApp, or Campaign
├── Recipients: Select from leads, students, parents
├── API: POST /api/communication/send-email (or sms/whatsapp)
└── Tracking: View delivery status and engagement metrics

CAMPUS VISIT
├── /counseling (Counseling.jsx)
├── View: Upcoming visits, missed visits, assigned leads
├── Actions: Edit visit, mark complete, add notes
├── API: GET /api/counseling/visits (future, missed)
└── Notes: Integrated with lead follow-up workflow
```

---

## 9. Error Handling & User Feedback

### 9.1 Error Boundaries

- Global error boundary in `App.jsx` catches unhandled exceptions
- Page-level error boundaries in critical pages (MultiStepApplication)

### 9.2 User Notifications

- **Toast Notifications:** Global notification system (ToastContext.jsx)
- **Inline Validation:** Real-time form field validation with error messages
- **API Error Messages:** Parsed from backend responses with user-friendly text

### 9.3 Loading States

- Skeleton loaders for data-heavy tables and dashboards
- Spinner overlays during form submissions
- Debounced search to prevent excessive API calls

---

## 10. Security Considerations

### 10.1 Authentication

- JWT tokens stored in `sessionStorage` (not localStorage for security)
- Automatic logout on token expiry
- `/auth/me` endpoint validates token on app init

### 10.2 Authorization

- Role-based route protection via `ProtectedRoute` component
- Admin routes restricted to `role='admin'` users
- API calls include `Authorization: Bearer <token>` header

### 10.3 Form Input Validation

- Client-side validation before submission
- CSRF protection via backend (if enabled)
- File upload validation (type, size)

---

## 11. Performance Optimizations

### 11.1 Code Splitting

- Route-based code splitting via `React.lazy()` for pages
- Dynamic imports for large modal components

### 11.2 Memoization

- `useMemo` for expensive computations (e.g., filtered lead lists)
- `useCallback` for event handlers to prevent child re-renders
- `React.memo` for static components (StatsCard, badges, etc.)

### 11.3 API Optimization

- Request debouncing for search/filter operations
- Parallel fetching where possible (Promise.all)
- Pagination for large data lists
- Conditional re-fetching (refetch only when needed)

---

## 12. Development Workflow

### 12.1 Running the Frontend

```bash
cd Frontend_AA
npm install
npm run dev              # Start Vite dev server (http://localhost:5173 or 3000)
```

### 12.2 Environment Variables

```env
VITE_API_BASE_URL=http://localhost:5001
VITE_APP_NAME=School ERP
```

### 12.3 Build & Deployment

```bash
npm run build            # Production build (dist/ folder)
npm run preview          # Preview production build locally
```

---

## 13. Design System & Styling

### 13.1 CSS Strategy

- **CSS Modules** or **Tailwind CSS** for component styling
- **Global styles** in `style.css` for common utilities
- **Responsive design** ensuring mobile, tablet, desktop support
- **Accessible colors** with WCAG compliance

### 13.2 Component Library

- **Icons:** Lucide React for consistent iconography
- **Forms:** Native HTML inputs with custom styling or React Hook Form
- **Tables:** Custom pagination and sorting logic
- **Modals:** Custom modal component with backdrop dismiss

---

## 14. API Integration Points Summary

| Page           | Service              | API Endpoints                                                |
| -------------- | -------------------- | ------------------------------------------------------------ |
| Dashboard      | dashboardService     | GET /api/dashboard/stats, /api/dashboard/funnel              |
| Leads          | leadService          | GET/POST /api/leads, PUT /api/leads/:id                      |
| Pipeline       | dashboardService     | GET /api/dashboard/funnel                                    |
| Communication  | communicationService | POST /api/communication/send-\*, GET /api/communication/logs |
| Counseling     | CounselingService    | GET /api/counseling/visits, POST /api/counseling/visits/\*   |
| Applications   | applicationService   | GET/POST /api/applications, POST /api/applications/:id/\*    |
| Screening      | admissionService     | GET /api/admissions?status=submitted                         |
| Offers & Seats | admissionService     | POST /api/admissions/create                                  |
| Enrollment     | studentService       | POST /api/students/enroll                                    |
| Reports        | dashboardService     | GET /api/reports/\*                                          |
| Admin          | userService          | GET/POST/PUT /api/users, GET/POST /api/schools/\*            |

---

## 15. Future Enhancements

- [ ] Offline-first capabilities with Service Workers
- [ ] Real-time notifications via WebSockets (Socket.io)
- [ ] Advanced data visualization (charts, reports)
- [ ] Bulk import/export functionality (CSV, Excel)
- [ ] Mobile app (React Native) sharing same backend
- [ ] AI-powered lead scoring and follow-up recommendations

---

**Last Updated:** May 2, 2026  
**Maintained By:** Technical Architecture Team

### 3.3 Draft Resumption & Final Submission

- If a user exits the workflow midway, the application safely remains in `draft` status.
- Upon resuming, `useApplication` fetches `/api/applications/:id/details` to rebuild `formData` and queries `/api/applications/:id/progress` to instantly navigate the user to their last incomplete step.
- Completing Step 6 triggers `/api/applications/:id/submit`, which transitions the entity status from `draft` to `submitted`, concluding the flow.
