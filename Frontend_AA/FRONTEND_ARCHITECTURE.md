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
- `/applications/form/:id` → `MultiStepApplication.jsx` (dynamic route for multi-step form)
- `/applications/new` → `NewApplication.jsx`
- `/screening` → `Screening.jsx`
- `/offers-seats` → `OffersSeats.jsx`
- `/fees-payments` → `FeesPayments.jsx`
- `/enrollment` → `Enrollment.jsx`
- `/reports` → `Reports.jsx`
- `/security` → `Security.jsx`
- `/settings` → `Settings.jsx`
- `/fees-payments` → `FeesPayments.jsx`
- `/enrollment` → `Enrollment.jsx`
- `/reports` → `Reports.jsx`
- `/security` → `Security.jsx`
- `/settings` → `Settings.jsx`

Behavior: Protected routes are nested under `Layout.jsx` which renders the shell and an `<Outlet />`. If `isAuthenticated()` returns false, the `ProtectedRoute` redirects to `/login`.

---

## Section 3 — Applications module breakdown

This project models applications as a page-based feature. Files of interest:

- `src/pages/Applications.jsx`
- `src/pages/CreateApplication.jsx`
- `src/pages/NewApplication.jsx`

### Applications.jsx

- Purpose: List and overview of admission applications (cards + table + filters).
- Data source: currently local mock `appsData` in file; should call `GET /api/admissions/stats` and `GET /api/admissions` in production.
- Displays:
  - Stats cards: Total, Submitted, Under Review, Approved, Waitlisted
  - Filter controls: search, status filter, export
  - Applications table (id, student name, grade, contact, submitted date, status)
- Props: none (page-level)
- State:
  - `search` (string)
  - `filter` (string)
  - `showDrop` (boolean)
- UX flows:
  - Click "New Application" → navigate to `/applications/create`

### CreateApplication.jsx

- Purpose: Start a new application by selecting an existing lead or creating one without a lead.
- Data source: currently local `leads` mock; should call `GET /api/leads` or `GET /api/leads/search`.
- Features:
  - Search and select lead
  - Choose academic year and admission type
  - Continue to the full application form (navigates to `/applications/new`)
- Expected lead object when selecting:

```json
{
  "id": "1",
  "name": "Aarav Sharma",
  "grade": "Grade 5",
  "contact": "+91...",
  "email": "..."
}
```

- Props: none (page-level)
- State:
  - `step` ("select" | "create")
  - `search` (string)
  - `selected` (lead object|null)
  - `form` (object with academic year, type, prevSchool, reason)

### NewApplication.jsx (FullApplicationForm placeholder)

- Purpose: Full multi-step application form (in this codebase `NewApplication.jsx` is the page for continuing the application).
- Current status: file exists as a page; implement multi-step UI.
- Recommended steps (when implemented):
  1. Student Info → maps to `student` table
  2. Parent Info → maps to `parent` table
  3. Academic Details → maps to `academic_records` or `admission` table
  4. Photos & ID → file storage + `application_documents`
  5. Documents → `application_documents`
  6. Review & Submit → `POST /api/admissions`

- Expected final submission shape (example):

```json
{
  "lead_id": 1,
  "student": { "first_name": "", "last_name": "", "dob": "", ...},
  "parents": [ {"name":"","relation":"father","phone":""} ],
  "academic": {"previous_school":"","marks":[]},
  "documents": [{"type":"birth_certificate","url":"..."}],
  "academic_year_id": 1,
  "created_by": 2
}
```

---

## Section 4 — Component hierarchy (high-level)

ApplicationsPage (route `/applications`)
├─ StatsCard (inline stat rendering)
├─ SearchBar (inline input)
└─ ApplicationsTable (table rows)

CreateApplication (route `/applications/create`)
├─ LeadSearchBar
├─ LeadList (table)
└─ LeadCard (selected lead display)

NewApplication (route `/applications/new`)
├─ Stepper
├─ StudentForm
├─ ParentForm
├─ AcademicForm
└─ DocumentUpload

Shared components

- `Layout.jsx` — App shell (header, sidebar, main content outlet)
- `HealthCheck.jsx` — simple status widget

Note: Many UI pieces are implemented directly inside page files (tables, stat cards). As the app grows, split these into granular presentational components under `src/components/`.

---

## Section 5 — Data flow

Canonical flow for any page:

1. UI component mounts
2. Component calls a `service` function in `src/services/` (e.g., `leadService`) that wraps `fetch`
3. `service` sends request to backend API (`/api/*`), passing auth header from `src/utils/authToken.js`
4. Backend processes and responds with JSON
5. Service returns parsed JSON to component
6. Component updates state via `useState` and re-renders

Example: ApplicationsPage (expected real flow)

- Component calls `getAdmissionStats()` (service)
- Service: `fetch('/api/admissions/stats', { headers: authHeader })`
- Backend returns: `{ success: true, data: { total: 10, submitted: 4, ... } }`
- Component sets `stats` state → cards update

Lead create flow (existing code)

- `AddLead.jsx` collects form → calls `leadService.createLead(payload)`
- `leadService.createLead` builds headers via `getAuthHeader()` and posts to `http://localhost:5001/api/leads`
- Backend returns created lead → UI shows confirmation

Auth header provider (in `src/utils/authToken.js`)

- `getAuthHeader()` returns `{ 'Content-Type': 'application/json', 'Authorization': 'Bearer <token>' }` or `null`.
- `isAuthenticated()` uses `sessionStorage` presence to gate protected routes.

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

Application management:

- POST `/api/applications` - Create new application
  - Request: `{ lead_id, academic_year_id }`
  - Response: `{ success: true, data: application }`

- GET `/api/applications` - Get all applications
  - Response: `{ success: true, data: [applications] }`

- GET `/api/applications/:id` - Get application by ID
  - Response: `{ success: true, data: application }`

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

Current approach: local component state using React hooks.

Patterns used:

- `useState` for local state (forms, filters, selected items)
- `useEffect` not widely used in current pages (pages use local mock arrays). When calling real APIs, wrap calls in `useEffect` on mount.

Where state lives:

- Page-level: `Applications.jsx` holds `search`, `filter` and derived `stats` (mocked)
- Form-level: `CreateApplication.jsx` holds `step`, `selected`, `form` state
- Auth token: `sessionStorage` (via `utils/authToken.js`) — global-ish but persistence is sessionStorage only

Recommendations:

- Introduce a lightweight global store (React Context) for auth and user info (token, user id, school_id).
- For larger datasets (applications list, leads), consider using React Query (TanStack Query) to handle server state, caching, and background revalidation.
- Move API calls to dedicated `services/*Service.js` and keep hooks (e.g., `useLeads`, `useApplications`) to encapsulate data fetching and loading / error state.

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

- `Layout.jsx` — Renders header, nav, sidebar; includes logout link; contains `<Outlet/>` for nested routes.
- `Login.jsx` — Login form; calls `POST /api/auth/login`; saves token to sessionStorage via `authToken.js`.
- `Leads.jsx` / `AddLead.jsx` — Leads listing and creation UI; call `leadService` when wired to backend.
- `Applications.jsx` — Stats and applications list; ideally calls `GET /api/admissions/stats` and `GET /api/admissions`.
- `CreateApplication.jsx` — Lead selection and basic application metadata (navigates to `NewApplication`).

---

## Section 10 — Common issues & troubleshooting

- API unreachable / CORS
  - Symptoms: `Failed to fetch` in browser console. Check backend URL, server running, CORS middleware, and proxy config in `vite.config.js`.
- Authentication issues
  - Symptoms: Protected routes redirect to `/login`. Verify `sessionStorage` contains token and `isAuthenticated()` returns true.
- Missing fields / 400 errors from backend
  - E.g., `academic_year_id` is required by backend. Ensure CreateApplication or AddLead sets `academic_year_id` before creating a lead or application.
- State not updating after API call
  - Ensure services return the updated object and update local state or invalidate query caches.

---

## Appendix — Recommended short-term improvements

- Move mocks to `src/mocks/` and wire real API calls using `useEffect` + services.
- Add `src/modules/` structure per feature: each module contains `pages`, `components`, `services`, `hooks`, `styles`.
- Introduce `useAuth` context hook for centralized token handling and user metadata.
- Adopt React Query for server state and standardized async handling.
- Extract repeated UI (stat cards, table, filters) into reusable components.

---

If you want, I can now:

- Create `src/modules` scaffolding and move `Applications` into `src/modules/applications/`.
- Implement `useLeads` and `useApplications` hooks with `fetch` wrappers.

Tell me which next step you'd like me to take.
