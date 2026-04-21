# School ERP - Master API Documentation

**Version:** 2.0  
**Date:** April 21, 2026  
**Base URL:** `http://localhost:5001/api`  
**Status:** Production Ready

---

## Overview

This is the complete, authoritative API documentation for the School ERP system. Contains 30+ endpoints, clear Purpose/Does/Does NOT sections, complete request/response examples, flow diagrams, data mapping, auto-fill implementation guide, and common issues with debugging tips.

### Key Design Principles

1. **Multi-Tenancy:** All endpoints enforce `school_id` from JWT token
2. **Auto-Fill NOT Automatic:** Frontend implements separate logic to combine lead + application
3. **Immutable Fields:** `school_id`, `created_by` cannot be changed after creation
4. **Partial Updates:** POST/PUT endpoints accept partial data
5. **No Duplication:** Each endpoint has specific responsibility

### Critical Clarifications

- ⚠️ **Auto-fill is frontend responsibility, not automatic from backend**
- ⚠️ **Max 1 submitted application per lead** (multiple drafts allowed)
- ⚠️ **Lead data NOT auto-populated** - developer must implement
- ⚠️ **School_id from JWT token** - never send in request body

---

## Table of Contents

1. [Authentication](#authentication)
2. [Leads API](#leads-api)
3. [Applications API](#applications-api)
4. [Schools API](#schools-api)
5. [Flow Diagrams](#application-flow-diagrams)
6. [Data Mapping](#data-mapping-lead--application)
7. [Auto-Fill Implementation](#frontend-auto-fill-implementation)
8. [Common Issues](#common-issues--debugging)
9. [Error Handling](#error-handling)
10. [Quick Reference](#quick-reference)

---

## Authentication

### POST /api/auth/login

**Purpose:** Authenticate user and receive JWT token

**Does:**
- Validates email/password
- Returns JWT token with `school_id` and `user_id`
- Returns user metadata

**Does NOT:**
- Create accounts (use `/auth/signup`)
- Send verification codes
- Implement OAuth
- Return full profile data

**Request:**
```json
{ "email": "admin@school.com", "password": "pass123" }
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { "id": 123, "email": "admin@school.com", "school_id": 1, "role": "admin" }
  },
  "message": "Login successful"
}
```

---

### POST /api/auth/signup

**Purpose:** Create new user account

**Does:**
- Creates user with hashed password
- Returns JWT token immediately
- Assigns to school

**Does NOT:**
- Send verification email
- Require email verification
- Allow duplicate emails
- Auto-assign admin privileges

**Request:**
```json
{ "email": "staff@school.com", "password": "pass123", "name": "John Doe", "school_id": 1 }
```

**Response (201):**
```json
{
  "success": true,
  "data": { "token": "...", "user": { "id": 124, "email": "staff@school.com", "school_id": 1 } },
  "message": "Account created successfully"
}
```

---

### GET /api/auth/me

**Purpose:** Verify token and get current user

**Does:**
- Returns authenticated user data
- Verifies token validity
- Shows school affiliation

**Does NOT:**
- Refresh expired tokens
- Return other users' data
- Update profile
- Work without JWT token

**Request:**
```
GET /api/auth/me
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": { "id": 123, "email": "admin@school.com", "school_id": 1 }
}
```

---

## Leads API

### POST /api/leads

**Purpose:** Create new lead (prospective student)

**Does:**
- Creates lead with contact info
- Associates with authenticated school
- Sets `follow_up_status` to "pending"
- Records `created_by` from JWT token

**Does NOT:**
- Create application automatically
- Send emails/SMS
- Validate phone format
- Prevent duplicates
- Auto-assign follow-up teams

**Request:**
```json
{
  "first_name": "Rajesh",
  "last_name": "Kumar",
  "email": "rajesh@example.com",
  "phone": "9876543210",
  "desired_class": "Grade 5",
  "source": "Website",
  "academic_year_id": 2026,
  "notes": "Interested in STEM"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": { "id": 456, "first_name": "Rajesh", "follow_up_status": "pending" },
  "message": "Lead created successfully"
}
```

---

### GET /api/leads

**Purpose:** Retrieve all leads with optional filtering

**Does:**
- Returns paginated leads for authenticated school
- Filters by `follow_up_status`, `desired_class`, `assigned_to`
- Returns contact info and metadata

**Does NOT:**
- Return leads from other schools
- Include application data
- Send notifications
- Modify status

**Request:**
```
GET /api/leads?follow_up_status=pending&desired_class=Grade%205
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    { "id": 456, "first_name": "Rajesh", "email": "rajesh@example.com", "follow_up_status": "pending" }
  ]
}
```

---

### GET /api/leads/:id

**Purpose:** Get specific lead details

**Does:**
- Returns complete lead record
- Verifies lead belongs to authenticated school
- Includes all fields and timestamps

**Does NOT:**
- Return associated applications
- Show communication history
- Modify data
- Work for other schools' leads

**Request:**
```
GET /api/leads/456
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": { "id": 456, "first_name": "Rajesh", "email": "rajesh@example.com", "phone": "9876543210", "desired_class": "Grade 5" }
}
```

---

### PUT /api/leads/:id

**Purpose:** Update lead when status changes

**Does:**
- Updates specified fields
- Records timestamp
- Validates school ownership
- Allows any field except `school_id`, `created_by`

**Does NOT:**
- Create lead
- Delete lead
- Override immutable fields
- Send notifications

**Request:**
```json
{ "follow_up_status": "interested", "assigned_to": 124, "notes": "Parent confirmed interest" }
```

**Response (200):**
```json
{ "success": true, "data": { "id": 456, "follow_up_status": "interested" }, "message": "Lead updated successfully" }
```

---

### DELETE /api/leads/:id

**Purpose:** Permanently remove lead record

**Does:**
- Deletes lead completely
- Validates school ownership
- Returns 204 No Content

**Does NOT:**
- Delete applications
- Send notifications
- Archive (permanent delete)
- Support recovery

**Request:**
```
DELETE /api/leads/456
Authorization: Bearer <token>
```

**Response (204):**
```
(No content)
```

---

### GET /api/leads/followups/upcoming

**Purpose:** Get leads with upcoming follow-ups for dashboard

**Does:**
- Returns leads where `next_follow_up_date <= NOW() + interval`
- Orders by priority (overdue→red, today→orange, upcoming→green)
- Limits to specified count
- Filters by active status

**Does NOT:**
- Include "converted"/"closed" leads
- Modify dates
- Send reminders
- Return full details

**Request:**
```
GET /api/leads/followups/upcoming?interval=2&limit=10
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "count": 3,
  "data": [
    { "id": 456, "first_name": "Rajesh", "phone": "9876543210", "priority": "overdue" },
    { "id": 457, "first_name": "Priya", "phone": "9876543211", "priority": "today" }
  ]
}
```

---

## Applications API

### POST /api/applications

**Purpose:** Create formal application from lead

**Does:**
- Creates application linked to lead
- Sets status to "draft"
- Stores academic year
- Returns application ID

**Does NOT:**
- Auto-fill student/parent data
- Create without lead
- Submit automatically
- Validate eligibility
- Create student records

**Key Context:**
- **Max 1 submitted application per lead**
- Multiple drafts allowed
- **Auto-fill NOT automatic** - see data mapping section

**Request:**
```json
{ "lead_id": 456, "academic_year_id": 2026 }
```

**Response (201):**
```json
{
  "success": true,
  "data": { "id": 789, "lead_id": 456, "status": "draft" },
  "message": "Application created successfully"
}
```

**Response (409):**
```json
{ "success": false, "message": "Lead already has a submitted application for this year" }
```

---

### POST /api/applications/new

**Purpose:** Create application for manual entry (walk-in)

**Does:**
- Creates application with `lead_id = NULL`
- Sets status to "draft"
- Requires only `academic_year_id`
- Allows manual field entry

**Does NOT:**
- Link to lead
- Require eligibility checks
- Auto-populate fields
- Send emails
- Validate parent info upfront

**Request:**
```json
{ "academic_year_id": 2026 }
```

**Response (201):**
```json
{
  "success": true,
  "data": { "id": 790, "lead_id": null, "status": "draft" },
  "message": "Application created in manual entry mode"
}
```

---

### GET /api/applications/eligible-leads

**Purpose:** Get leads available for application creation

**Does:**
- Returns leads without submitted applications
- Filters by search term (name, email, phone)
- Returns limited set based on `limit`
- Ordered for UI selection

**Does NOT:**
- Auto-create applications
- Filter by class/status
- Return full details
- Include leads with apps

**Request:**
```
GET /api/applications/eligible-leads?search=raj&limit=20
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    { "id": 456, "first_name": "Rajesh", "email": "rajesh@example.com", "phone": "9876543210" }
  ]
}
```

---

### GET /api/applications

**Purpose:** Retrieve all applications with filtering

**Does:**
- Returns paginated applications for school
- Filters by status, academic year
- Includes metadata (dates, names, status)

**Does NOT:**
- Return drafts only (use `/draft`)
- Include full details
- Show history
- Modify status

**Request:**
```
GET /api/applications?status=submitted&academic_year=2026&limit=50
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    { "id": 789, "student_name": "Rajesh Kumar", "status": "submitted", "created_at": "2026-04-21T10:30:00Z" }
  ]
}
```

---

### GET /api/applications/draft

**Purpose:** Get all incomplete draft applications

**Does:**
- Returns draft status applications
- Includes name, dates, status
- Scoped to authenticated school

**Does NOT:**
- Include submitted applications
- Show rejected/admitted
- Include full data
- Modify status

**Request:**
```
GET /api/applications/draft
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    { "id": 789, "student_name": "Rajesh Kumar", "started_at": "2026-04-21T10:30:00Z", "status": "draft" }
  ]
}
```

---

### GET /api/applications/counts

**Purpose:** Get summary statistics for dashboard

**Does:**
- Returns count by status (draft, submitted, admitted, rejected)
- Filtered by academic year if specified
- Useful for dashboard widgets

**Does NOT:**
- Return detailed data
- Filter by officer/criteria
- Modify data

**Request:**
```
GET /api/applications/counts?academic_year=2026
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": { "draft": 5, "submitted": 15, "admitted": 2, "rejected": 1 }
}
```

---

### GET /api/applications/search

**Purpose:** Search applications by name, email, phone, ID

**Does:**
- Returns applications matching search
- Searches name, email, phone
- Returns basic info
- Useful for admissions team

**Does NOT:**
- Full-text search
- Fuzzy matching
- Separate submitted/draft
- Modify results

**Request:**
```
GET /api/applications/search?q=rajesh
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    { "id": 789, "student_name": "Rajesh Kumar", "email": "rajesh@example.com", "status": "submitted" }
  ]
}
```

---

### GET /api/applications/:id/progress

**Purpose:** Get form completion status for progress bar

**Does:**
- Returns each step as completed/incomplete
- Shows missing required information
- Calculates completion percentage
- Helps frontend display progress UI

**Does NOT:**
- Allow editing
- Validate completeness
- Submit application
- Create steps

**Request:**
```
GET /api/applications/789/progress
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "application_id": 789,
    "steps": {
      "student_info": { "completed": true },
      "parent_info": { "completed": false },
      "academic_info": { "completed": false },
      "documents": { "completed": false }
    },
    "overall_completion": 25
  }
}
```

---

### GET /api/applications/:id/details

**Purpose:** Retrieve all stored application data (for form prefilling)

**Does:**
- Returns complete application data
- Includes student, parent, academic, documents
- Fetches saved data
- Used for prefilling form

**Does NOT:**
- Modify data
- Auto-fill from lead (only returns saved app data)
- Return lead details
- Validate completeness

**⚠️ KEY CLARIFICATION:**
Returns ONLY what's saved in application database. Does NOT auto-populate from lead. To prefill form, implement frontend logic to fetch lead + application separately, then merge in UI. See **Frontend Auto-Fill Implementation** section.

**Request:**
```
GET /api/applications/789/details
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "application_id": 789,
    "status": "draft",
    "student_info": { "first_name": "Rajesh", "last_name": "Kumar", "date_of_birth": "2016-03-15" },
    "parent_info": { "father_name": "Vikram Singh", "father_phone": "9876543200" },
    "academic_info": { "current_school": "ABC School", "percentage": 85 },
    "documents": [
      { "document_type": "birth_certificate", "file_url": "/uploads/789/birth_certificate.pdf" }
    ]
  }
}
```

---

### POST /api/applications/:id/student-info

**Purpose:** Save Step 1: Student personal information

**Does:**
- Saves biographical info
- Accepts flexible naming (camelCase/snake_case)
- Maps frontend names to database
- Overwrites if re-saved
- Accepts partial updates

**Does NOT:**
- Validate age/eligibility
- Create student records
- Send emails
- Require all fields
- Validate format

**Request:**
```json
{
  "first_name": "Rajesh",
  "last_name": "Kumar",
  "date_of_birth": "2016-03-15",
  "gender": "Male",
  "phone": "9876543210",
  "email": "rajesh@example.com"
}
```

**Response (200):**
```json
{ "success": true, "message": "Student information saved successfully" }
```

---

### POST /api/applications/:id/parent-info

**Purpose:** Save Step 2: Parent/guardian information

**Does:**
- Saves parent details
- Allows flexible naming
- Maps fields to database
- Overwrites if re-saved
- Stores per-application

**Does NOT:**
- Create parent accounts
- Send invitations
- Validate format
- Enforce unique info
- Link to parent records

**Request:**
```json
{
  "father_name": "Vikram Singh",
  "father_phone": "9876543200",
  "father_email": "vikram@example.com",
  "mother_name": "Anjali Singh",
  "mother_phone": "9876543201",
  "mother_email": "anjali@example.com"
}
```

**Response (200):**
```json
{ "success": true, "message": "Parent information saved successfully" }
```

---

### POST /api/applications/:id/academic-info

**Purpose:** Save Step 3: Academic performance info

**Does:**
- Saves school, class, marks, subjects
- Overwrites if re-saved
- Accepts flexible naming

**Does NOT:**
- Validate grades/percentages
- Verify school details
- Calculate placement
- Create records
- Upload transcripts

**Request:**
```json
{
  "current_school": "ABC School",
  "current_class": "Grade 4",
  "percentage": 85,
  "subjects": ["English", "Math", "Science"]
}
```

**Response (200):**
```json
{ "success": true, "message": "Academic information saved successfully" }
```

---

### POST /api/applications/:id/documents

**Purpose:** Save Steps 4-5: Upload documents/photos

**Does:**
- Accepts multipart/form-data uploads
- Associates with document type
- Stores in `/backend/uploads`
- Allows multiple files per type
- Records timestamp

**Does NOT:**
- Validate file content
- Scan for viruses
- Compress files
- Guarantee permanent storage
- Limit uploads

**Request:**
```
POST /api/applications/789/documents
Content-Type: multipart/form-data
Authorization: Bearer <token>

Form Data:
- document_type: "birth_certificate"
- files: [file1.pdf]
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    { "document_type": "birth_certificate", "file_url": "/uploads/789/birth_certificate.pdf", "uploaded_at": "2026-04-21T11:30:00Z" }
  ]
}
```

---

### POST /api/applications/:id/submit

**Purpose:** Finalize and submit application (Step 6)

**Does:**
- Changes status to "submitted"
- Records timestamp
- Locks for editing
- Confirms required info present
- Creates admissions record

**Does NOT:**
- Validate all data
- Send emails/SMS
- Assign officer
- Make decision
- Allow resubmission

**Request:**
```json
{}
```

**Response (200):**
```json
{
  "success": true,
  "data": { "application_id": 789, "status": "submitted", "submitted_at": "2026-04-21T11:45:00Z" },
  "message": "Application submitted successfully"
}
```

---

### GET /api/applications/:id/resume

**Purpose:** Resume draft application

**Does:**
- Returns draft if exists and belongs to school
- Loads saved data
- Used by applicants to continue

**Does NOT:**
- Reopen submitted apps
- Auto-advance
- Clear data
- Create new app

**Request:**
```
GET /api/applications/789/resume
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 789,
    "status": "draft",
    "student_info": {...},
    "parent_info": {...},
    "academic_info": {...},
    "documents": [...]
  }
}
```

---

## Schools API

### GET /api/schools

**Purpose:** Retrieve all schools (admin view)

**Does:**
- Returns all registered schools
- Includes basic info (name, city, principal, email)

**Does NOT:**
- Filter by user's school
- Include configuration
- Modify data

**Request:**
```
GET /api/schools
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Green Valley School", "email": "info@greenvalley.edu", "city": "Delhi", "principal_name": "Dr. Rajesh Kumar" }
  ]
}
```

---

### GET /api/schools/:id

**Purpose:** Get specific school details

**Does:**
- Returns complete school profile
- Includes address, year, principal, contact

**Does NOT:**
- Include student counts
- Modify data
- Return settings

**Request:**
```
GET /api/schools/1
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Green Valley School",
    "email": "info@greenvalley.edu",
    "address": "123, School Road",
    "city": "Delhi",
    "state": "Delhi",
    "postal_code": "110001",
    "established_year": 2010,
    "principal_name": "Dr. Rajesh Kumar"
  }
}
```

---

### POST /api/schools

**Purpose:** Create new school entry

**Does:**
- Creates school record
- Returns newly created school

**Does NOT:**
- Create user accounts
- Set up database
- Validate license
- Send emails

**Request:**
```json
{
  "name": "Sunshine Academy",
  "email": "info@sunshine.edu",
  "phone": "+91-9876543211",
  "address": "456, Education Lane",
  "city": "Mumbai",
  "state": "Maharashtra",
  "principal_name": "Ms. Anjali Sharma"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": { "id": 2, "name": "Sunshine Academy", "email": "info@sunshine.edu", "status": "active" },
  "message": "School created successfully"
}
```

---

## Application Flow Diagrams

### Lead to Application Flow

```
1. Create Lead (POST /api/leads)
   └─ Prospect enters system

2. Get Upcoming Follow-ups (GET /api/leads/followups/upcoming)
   └─ Staff prioritizes leads

3. Get Eligible Leads (GET /api/applications/eligible-leads)
   └─ Search for lead ready for app

4. Create Application (POST /api/applications)
   └─ Link app to lead

5. Save Steps
   ├─ POST /api/applications/:id/student-info (Step 1)
   ├─ POST /api/applications/:id/parent-info (Step 2)
   ├─ POST /api/applications/:id/academic-info (Step 3)
   └─ POST /api/applications/:id/documents (Steps 4-5)

6. Submit (POST /api/applications/:id/submit)
   └─ Lock form

7. Review (GET /api/applications/:id/details)
   └─ Admissions team reviews
```

### Manual Entry Flow

```
1. Create App Without Lead (POST /api/applications/new)
   └─ Walk-in applicant

2-6. Same as above
```

### Resume Draft Flow

```
1. Get Drafts (GET /api/applications/draft)
   └─ Show incomplete forms

2. Resume (GET /api/applications/:id/resume)
   └─ Load saved data

3. Edit (POST to save endpoints)
   └─ Update steps

4. Check Progress (GET /api/applications/:id/progress)
   └─ Show status

5. Submit (POST /api/applications/:id/submit)
```

---

## Data Mapping: Lead → Application

### Lead Object Structure

```json
{
  "id": 456,
  "first_name": "Rajesh",
  "last_name": "Kumar",
  "email": "rajesh@example.com",
  "phone": "9876543210",
  "desired_class": "Grade 5",
  "source": "Website",
  "academic_year_id": 2026
}
```

### What Maps to Application Step 1

```json
{
  "first_name": "Rajesh",              // ← from lead
  "last_name": "Kumar",                // ← from lead
  "email": "rajesh@example.com",       // ← from lead
  "phone": "9876543210",               // ← from lead
  
  "date_of_birth": "",                 // ← user must enter
  "gender": "",                        // ← user must enter
  "blood_group": "",                   // ← user must enter
  "aadhar_number": ""                  // ← user must enter
}
```

### What Maps to Step 2 (Parent Info)

```json
{
  // Lead does NOT have parent information
  "father_name": "",                   // ← user must enter
  "father_phone": "",                  // ← user must enter
  "mother_name": "",                   // ← user must enter
  "mother_phone": ""                   // ← user must enter
}
```

### What Maps to Step 3 (Academic Info)

```json
{
  "current_class": "Grade 5",          // ← from lead.desired_class
  "current_school": "",                // ← user must enter
  "percentage": ""                     // ← user must enter
}
```

### Key Mapping Table

| Lead Field | Maps To | Notes |
|-----------|---------|-------|
| first_name | student_info.first_name | ✅ Can be pre-filled |
| last_name | student_info.last_name | ✅ Can be pre-filled |
| email | student_info.email | ✅ Can be pre-filled |
| phone | student_info.phone | ✅ Can be pre-filled |
| desired_class | academic_info.current_class | ✅ Can be pre-filled |
| (parent info) | parent_info.* | ❌ Not in lead - user enters |
| (date of birth) | student_info.date_of_birth | ❌ Not in lead - user enters |

---

## Frontend Auto-Fill Implementation

⚠️ **CRITICAL:** Auto-fill happens ONLY in frontend. Backend does NOT auto-populate.

### How Auto-Fill Works

```
1. User creates application from lead
   └─ Lead object passed via location.state

2. MultiStepApplication component mounts
   └─ Fetches GET /api/applications/:id/progress
   └─ Fetches GET /api/applications/:id/details (empty on first visit)

3. Frontend mapping logic runs
   └─ Maps lead.first_name → formData.first_name
   └─ Maps lead.email → formData.email
   └─ etc.

4. Form renders with pre-filled fields
   └─ User sees name, email, phone filled
   └─ User adds missing fields (DOB, gender, etc.)

5. User submits form
   └─ All steps saved
```

### Example React Implementation

```javascript
useEffect(() => {
  if (locationState?.lead && currentStep === 1) {
    const autoFillData = {
      first_name: locationState.lead.first_name || '',
      last_name: locationState.lead.last_name || '',
      email: locationState.lead.email || '',
      phone: locationState.lead.phone || '',
      current_class: locationState.lead.desired_class || ''
    };
    
    setFormData(prevData => ({
      ...prevData,
      ...autoFillData
    }));
  }
}, [locationState?.lead, currentStep]);
```

### Common Auto-Fill Mistakes

❌ **WRONG:** Expecting backend auto-populate
```javascript
GET /api/applications/789/details
// Returns: { student_info: { first_name: "" } }  // Empty!
```

✅ **RIGHT:** Combine lead + application in frontend
```javascript
const lead = locationState?.lead;
const appDetails = await getApplicationDetails(appId);

const formData = {
  first_name: lead?.first_name || appDetails?.student_info?.first_name || '',
  // ... merge logic
};
```

---

## Common Issues & Debugging

### Issue 1: Missing lead_id on Creation

**Symptom:** `POST /api/applications` returns 400

**Causes:** 
- Manual entry chosen but `lead_id` not set to `null`
- Frontend sends `undefined` instead of `null`

**Solution:**
```javascript
// WRONG:
POST /api/applications { academic_year_id: 2026 }  // ❌

// RIGHT - use manual entry:
POST /api/applications/new { academic_year_id: 2026 }  // ✅

// OR - explicitly null:
POST /api/applications { lead_id: null, academic_year_id: 2026 }  // ✅
```

---

### Issue 2: Auto-Fill Not Working

**Symptom:** Form fields stay empty

**Causes:**
- Lead not passed in `location.state`
- useEffect not detecting lead
- Wrong variable check
- Lead shape different

**Solution:**
```javascript
// Ensure lead passed from CreateApplication:
navigate(`/applications/form/${app.id}`, { 
  state: { lead: selectedLead }  // ✅ Pass here
});

// In MultiStepApplication - verify useEffect:
const { state } = useLocation();
console.log('Lead:', state?.lead);  // Debug

useEffect(() => {
  if (state?.lead && currentStep === 1) {
    // Auto-fill
  }
}, [state?.lead, currentStep]);  // Include both
```

---

### Issue 3: Form State Lost on Navigation

**Symptom:** Data from previous steps disappears

**Causes:**
- `activeAdmissionId` not in sessionStorage
- useEffect not fetching properly
- Component unmounts

**Solution:**
```javascript
// Save app ID:
sessionStorage.setItem('activeAdmissionId', applicationId);

// In useEffect:
const appId = sessionStorage.getItem('activeAdmissionId');
if (!appId) {
  console.error('App ID not found!');
  return;
}
```

---

### Issue 4: Lead Not in Eligible List

**Symptom:** Lead doesn't appear in dropdown

**Causes:**
- Lead already has submitted application
- Search term doesn't match
- Lead from different school

**Solution:**
```javascript
// Check: Does lead have submitted app?
GET /api/applications?lead_id=456&status=submitted

// If found, lead not eligible
// Try creating app anyway:
POST /api/applications { lead_id: 456, academic_year_id: 2026 }
// Returns 409 Conflict if already has app
```

---

### Issue 5: File Upload Fails

**Symptom:** Document upload returns error

**Causes:**
- File exceeds 5MB
- Invalid format
- FormData incorrect

**Solution:**
```javascript
const MAX_FILE_SIZE = 5 * 1024 * 1024;
if (file.size > MAX_FILE_SIZE) {
  setError('File exceeds 5MB');
  return;
}

const ALLOWED = ['application/pdf', 'image/jpeg', 'image/png'];
if (!ALLOWED.includes(file.type)) {
  setError('Invalid format');
  return;
}

const formData = new FormData();
formData.append('document_type', 'birth_certificate');
formData.append('files', file);
```

---

## Error Handling

### Standard Response Format

**Success:**
```json
{
  "success": true,
  "data": {...},
  "message": "Description"
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description"
}
```

### HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | GET request returned data |
| 201 | Created | POST created successfully |
| 204 | Deleted | DELETE removed successfully |
| 400 | Bad Request | Missing/invalid fields |
| 401 | Unauthorized | Token invalid/expired |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Lead has app, duplicate, etc. |
| 500 | Server Error | Database/unexpected error |

---

## Quick Reference

### Common cURL Commands

```bash
# Login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@school.com","password":"pass"}'

# Get all leads (with token)
TOKEN="your_token_here"
curl -X GET http://localhost:5001/api/leads \
  -H "Authorization: Bearer $TOKEN"

# Create lead
curl -X POST http://localhost:5001/api/leads \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name":"John",
    "last_name":"Doe",
    "phone":"9876543210",
    "email":"john@example.com",
    "desired_class":"Grade 5",
    "source":"Website",
    "academic_year_id":2026
  }'

# Create application
curl -X POST http://localhost:5001/api/applications \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"lead_id":456,"academic_year_id":2026}'

# Save student info
curl -X POST http://localhost:5001/api/applications/789/student-info \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name":"Rajesh",
    "date_of_birth":"2016-03-15",
    "gender":"Male"
  }'

# Upload document
curl -X POST http://localhost:5001/api/applications/789/documents \
  -H "Authorization: Bearer $TOKEN" \
  -F "document_type=birth_certificate" \
  -F "files=@birth_cert.pdf"

# Submit application
curl -X POST http://localhost:5001/api/applications/789/submit \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Endpoints by Task

| Task | Endpoint | Method |
|------|----------|--------|
| Login | /auth/login | POST |
| Get current user | /auth/me | GET |
| Create lead | /leads | POST |
| List leads | /leads | GET |
| Get lead | /leads/:id | GET |
| Update lead | /leads/:id | PUT |
| Delete lead | /leads/:id | DELETE |
| Get upcoming follow-ups | /leads/followups/upcoming | GET |
| Create application | /applications | POST |
| Create manual app | /applications/new | POST |
| Get eligible leads | /applications/eligible-leads | GET |
| List applications | /applications | GET |
| Get draft apps | /applications/draft | GET |
| Search applications | /applications/search | GET |
| Get app counts | /applications/counts | GET |
| Get app progress | /applications/:id/progress | GET |
| Get app details | /applications/:id/details | GET |
| Save student info | /applications/:id/student-info | POST |
| Save parent info | /applications/:id/parent-info | POST |
| Save academic info | /applications/:id/academic-info | POST |
| Upload documents | /applications/:id/documents | POST |
| Submit application | /applications/:id/submit | POST |
| Resume draft | /applications/:id/resume | GET |
| Get schools | /schools | GET |
| Get school | /schools/:id | GET |
| Create school | /schools | POST |

---

**Master API Documentation - Consolidated and Complete**  
**Version:** 2.0  
**Last Updated:** April 21, 2026  
**Status:** Production Ready  
**Base URL:** http://localhost:5001/api# School ERP - Master API Documentation

**Version:** 2.0  
**Date:** April 21, 2026  
**Base URL:** `http://localhost:5001/api`  
**Status:** Production Ready

---

## Overview

This is the complete, authoritative API documentation for the School ERP system. It contains:

- **30+ endpoints** covering Authentication, Leads, Applications, and Schools
- **Clear Purpose/Does/Does NOT sections** for every endpoint to eliminate ambiguity
- **Complete request/response examples** with real field names and data types
- **Flow-level diagrams** showing how endpoints interact
- **Data mapping examples** explaining lead → application flows
- **Auto-fill logic** clearly explained (frontend implementation only)
- **Common issues** and solutions with code examples
- **Quick reference tables** for rapid lookup

### Key Design Principles

1. **Multi-Tenancy:** All endpoints enforce `school_id` from JWT token - no cross-school data leakage
2. **Auto-Fill NOT Automatic:** Frontend must implement separate logic to combine lead + application data
3. **Immutable Fields:** `school_id`, `created_by` cannot be changed after creation
4. **Partial Updates:** POST/PUT endpoints accept partial data; only specified fields updated
5. **No Duplication:** Each endpoint handles a specific responsibility, no overlap

### Critical Clarifications

- ⚠️ **Auto-fill is frontend responsibility, not automatic from backend**
- ⚠️ **Max 1 submitted application per lead** (multiple drafts allowed)
- ⚠️ **Lead data NOT auto-populated in applications** - developer must implement this
- ⚠️ **School_id from JWT token** - never send in request body

---

## Table of Contents

1. [Authentication](#authentication)
2. [Leads API](#leads-api)
3. [Applications API](#applications-api)
4. [Schools API](#schools-api)
5. [Application Flow Diagrams](#application-flow-diagrams)
6. [Data Mapping: Lead → Application](#data-mapping-lead--application)
7. [Frontend Auto-Fill Implementation](#frontend-auto-fill-implementation)
8. [Common Issues & Debugging](#common-issues--debugging)
9. [Error Handling](#error-handling)
10. [Quick Reference](#quick-reference)

---

## Health Check

### GET /api/health

**Returns:** Server health status

```bash
curl http://localhost:5000/api/health
```

**Response:**

```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2026-04-21T10:30:00.000Z",
  "environment": "development"
}
```

---

## Authentication

Base URL: `http://localhost:5000/api/auth`

| Method | Endpoint  | Purpose                | Protected |
| ------ | --------- | ---------------------- | --------- |
| POST   | `/login`  | Login with credentials | No        |
| POST   | `/signup` | Create new account     | No        |
| GET    | `/me`     | Get current user       | Yes       |

### POST /api/auth/login

**Description:** Login user with email and password

**Request:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "school_id": 1
    }
  },
  "message": "Login successful"
}
```

### POST /api/auth/signup

**Description:** Create new user account

**Request:**

```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "John Doe",
  "school_id": 1
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 2,
      "email": "newuser@example.com",
      "school_id": 1
    }
  },
  "message": "Account created successfully"
}
```

### GET /api/auth/me

**Description:** Get current authenticated user details

**Headers:** `Authorization: Bearer <TOKEN>`

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "school_id": 1
  }
}
```

---

## Schools

Base URL: `http://localhost:5000/api/schools`

| Method | Endpoint | Purpose           | Protected |
| ------ | -------- | ----------------- | --------- |
| GET    | `/`      | Get all schools   | No        |
| GET    | `/:id`   | Get school by ID  | No        |
| POST   | `/`      | Create new school | No        |

### GET /api/schools

**Returns:** List of all schools

```bash
curl http://localhost:5000/api/schools
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Green Valley School",
      "address": "123 Main St",
      "city": "Pune",
      "state": "Maharashtra",
      "phone": "9999999999",
      "email": "contact@greenvalley.edu"
    }
  ]
}
```

### GET /api/schools/:id

**Returns:** School details by ID

```bash
curl http://localhost:5000/api/schools/1
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Green Valley School",
    "address": "123 Main St",
    "city": "Pune",
    "state": "Maharashtra",
    "phone": "9999999999",
    "email": "contact@greenvalley.edu"
  }
}
```

### POST /api/schools

**Creates:** New school

**Request:**

```json
{
  "name": "New School",
  "address": "456 Oak St",
  "city": "Mumbai",
  "state": "Maharashtra",
  "phone": "8888888888",
  "email": "newschool@edu.com"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "New School",
    "address": "456 Oak St",
    "city": "Mumbai",
    "state": "Maharashtra"
  },
  "message": "School created successfully"
}
```

---

## Students

Base URL: `http://localhost:5000/api/students`

| Method | Endpoint | Purpose              | Protected |
| ------ | -------- | -------------------- | --------- |
| GET    | `/`      | Get all students     | No        |
| GET    | `/:id`   | Get student by ID    | No        |
| POST   | `/`      | Create new student   | No        |
| POST   | `/save`  | Save student details | No        |

### GET /api/students

**Returns:** List of all students with pagination

**Query Parameters:**

- `limit` - Records per page (default: 10)
- `offset` - Records to skip (default: 0)

```bash
curl "http://localhost:5000/api/students?limit=20&offset=0"
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "first_name": "Aarav",
      "last_name": "Sharma",
      "date_of_birth": "2016-05-15",
      "gender": "Male",
      "class": "Grade 5",
      "section": "A"
    }
  ],
  "pagination": {
    "total": 50,
    "limit": 20,
    "offset": 0
  }
}
```

### GET /api/students/:id

**Returns:** Detailed student information

```bash
curl http://localhost:5000/api/students/1
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "first_name": "Aarav",
    "last_name": "Sharma",
    "date_of_birth": "2016-05-15",
    "gender": "Male",
    "class": "Grade 5",
    "section": "A",
    "parents": [
      {
        "id": 1,
        "relationship": "Father",
        "name": "Rajesh Sharma",
        "phone": "9876543210"
      }
    ]
  }
}
```

### POST /api/students

**Creates:** New student

**Request:**

```json
{
  "first_name": "Rohan",
  "last_name": "Patel",
  "date_of_birth": "2015-08-20",
  "gender": "Male",
  "class": "Grade 6",
  "section": "B",
  "school_id": 1
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 2,
    "first_name": "Rohan",
    "last_name": "Patel"
  },
  "message": "Student created successfully"
}
```

### POST /api/students/save

**Saves:** Student details

**Request:**

```json
{
  "id": 1,
  "first_name": "Aarav",
  "last_name": "Sharma",
  "class": "Grade 6"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Student details saved successfully"
}
```

---

## Leads

Base URL: `http://localhost:5000/api/leads`

All lead routes are **protected** by JWT authentication

| Method | Endpoint              | Purpose                 |
| ------ | --------------------- | ----------------------- |
| POST   | `/`                   | Create new lead         |
| GET    | `/`                   | Get all leads           |
| GET    | `/followups/upcoming` | Get upcoming follow-ups |
| GET    | `/:id`                | Get lead by ID          |
| PUT    | `/:id`                | Update lead             |
| DELETE | `/:id`                | Delete lead             |

### POST /api/leads

**Creates:** New lead

**Request:**

```json
{
  "first_name": "Rohan",
  "last_name": "Sharma",
  "email": "rohan@example.com",
  "phone": "9999999999",
  "desired_class": "Grade 5",
  "source": "Website",
  "school_id": 1,
  "academic_year_id": 2026,
  "follow_up_date": "2026-04-25",
  "notes": "Very interested in sports quota"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "first_name": "Rohan",
    "last_name": "Sharma",
    "email": "rohan@example.com"
  },
  "message": "Lead created successfully"
}
```

### GET /api/leads

**Returns:** All leads for authenticated school

**Query Parameters:**

- `follow_up_status` - Filter by status (pending, completed, etc.)
- `desired_class` - Filter by class
- `assigned_to` - Filter by assigned counselor ID

```bash
curl "http://localhost:5000/api/leads?follow_up_status=pending&desired_class=Grade5" \
  -H "Authorization: Bearer <TOKEN>"
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "first_name": "Rohan",
      "last_name": "Sharma",
      "email": "rohan@example.com",
      "phone": "9999999999",
      "desired_class": "Grade 5",
      "source": "Website",
      "follow_up_status": "pending",
      "follow_up_date": "2026-04-25"
    }
  ]
}
```

### GET /api/leads/followups/upcoming

**Returns:** Upcoming follow-ups (ordered by priority)

**Query Parameters:**

- `interval` - Days interval for upcoming follow-ups (default: 7)
- `limit` - Max results (default: 10)

```bash
curl "http://localhost:5000/api/leads/followups/upcoming?interval=7&limit=10" \
  -H "Authorization: Bearer <TOKEN>"
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "first_name": "Rohan",
      "follow_up_date": "2026-04-21",
      "status": "overdue",
      "priority": "high"
    }
  ],
  "count": 5
}
```

### GET /api/leads/:id

**Returns:** Lead details by ID

```bash
curl http://localhost:5000/api/leads/1 \
  -H "Authorization: Bearer <TOKEN>"
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "first_name": "Rohan",
    "last_name": "Sharma",
    "email": "rohan@example.com",
    "phone": "9999999999",
    "desired_class": "Grade 5",
    "source": "Website",
    "follow_up_status": "pending",
    "notes": "Very interested in sports quota"
  }
}
```

### PUT /api/leads/:id

**Updates:** Lead details

**Request:**

```json
{
  "phone": "9888888888",
  "follow_up_status": "completed",
  "notes": "Interested, following up next week"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "first_name": "Rohan",
    "phone": "9888888888",
    "follow_up_status": "completed"
  },
  "message": "Lead updated successfully"
}
```

### DELETE /api/leads/:id

**Deletes:** Lead by ID

```bash
curl -X DELETE http://localhost:5000/api/leads/1 \
  -H "Authorization: Bearer <TOKEN>"
```

**Response:**

```json
{
  "success": true,
  "message": "Lead deleted successfully"
}
```

---

## Admissions

Base URL: `http://localhost:5000/api/admissions`

All admission routes are **protected** by JWT authentication

| Method | Endpoint                   | Purpose                     |
| ------ | -------------------------- | --------------------------- |
| GET    | `/stats`                   | Get admission statistics    |
| GET    | `/search`                  | Search admissions           |
| GET    | `/`                        | Get all admissions          |
| GET    | `/:applicationId`          | Get admission by ID         |
| POST   | `/create`                  | Create new admission        |
| POST   | `/create-from-lead`        | Create admission from lead  |
| POST   | `/submit`                  | Submit admission form       |
| POST   | `/documents/upload`        | Upload admission document   |
| GET    | `/:applicationId/progress` | Get application progress    |
| PUT    | `/:applicationId/progress` | Update application progress |
| POST   | `/save-academic`           | Save academic details       |

### GET /api/admissions/stats

**Returns:** Admission statistics

```bash
curl http://localhost:5000/api/admissions/stats \
  -H "Authorization: Bearer <TOKEN>"
```

**Response:**

```json
{
  "success": true,
  "data": {
    "total": 10,
    "submitted": 5,
    "under_review": 3,
    "approved": 2,
    "waitlisted": 0,
    "rejected": 0
  },
  "message": "Admission statistics fetched successfully"
}
```

### GET /api/admissions/search

### GET /api/admissions/search

**Returns:** Admissions matching search query

**Query Parameters:**

- `query` - Search by student name or parent phone (required)

```bash
curl "http://localhost:5000/api/admissions/search?query=aarav" \
  -H "Authorization: Bearer <TOKEN>"
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "application_id": "APP001",
      "student_name": "Aarav Sharma",
      "grade": "Grade 5",
      "parent_contact": "+91 9876543210",
      "submitted_date": "2026-02-28",
      "status": "UNDER_REVIEW"
    }
  ],
  "message": "Found 1 admission(s) matching your search"
}
```

### GET /api/admissions

**Returns:** Paginated list of all admissions

**Query Parameters:**

- `limit` - Records per page (default: 10, max: 100)
- `offset` - Records to skip (default: 0)

```bash
curl "http://localhost:5000/api/admissions?limit=20&offset=0" \
  -H "Authorization: Bearer <TOKEN>"
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "application_id": "APP001",
      "student_name": "Aarav Sharma",
      "grade": "Grade 5",
      "parent_contact": "+91 9876543210",
      "submitted_date": "2026-02-28",
      "status": "UNDER_REVIEW"
    }
  ],
  "pagination": {
    "total": 50,
    "limit": 20,
    "offset": 0,
    "pages": 3
  }
}
```

### GET /api/admissions/:applicationId

**Returns:** Detailed admission information

```bash
curl http://localhost:5000/api/admissions/APP001 \
  -H "Authorization: Bearer <TOKEN>"
```

**Response:**

```json
{
  "success": true,
  "data": {
    "application_id": "APP001",
    "student_id": 1,
    "student_name": "Aarav Sharma",
    "date_of_birth": "2016-05-15",
    "gender": "Male",
    "grade": "Grade 5",
    "section": "A",
    "status": "UNDER_REVIEW",
    "submitted_date": "2026-02-28",
    "father_name": "Rajesh Sharma",
    "father_mobile": "9876543210",
    "mother_name": "Priya Sharma",
    "mother_mobile": "9876543211"
  }
}
```

### POST /api/admissions/create

**Creates:** New admission with file uploads

**Request:** (multipart/form-data)

- `student_name` - Student name
- `date_of_birth` - DOB (YYYY-MM-DD)
- `class_id` - Class ID
- `documents` - Files to upload

```bash
curl -X POST http://localhost:5000/api/admissions/create \
  -H "Authorization: Bearer <TOKEN>" \
  -F "student_name=Rohan" \
  -F "date_of_birth=2016-05-15" \
  -F "class_id=1" \
  -F "documents=@transcript.pdf"
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 2,
    "application_id": "APP002",
    "student_name": "Rohan"
  },
  "message": "Admission created successfully"
}
```

### POST /api/admissions/create-from-lead

**Creates:** Admission from existing lead

**Request:**

```json
{
  "lead_id": 1,
  "class_id": 5,
  "section_id": 1
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "application_id": "APP003",
    "lead_id": 1
  },
  "message": "Application created from lead successfully"
}
```

### POST /api/admissions/submit

**Submits:** Complete admission form

**Request:**

```json
{
  "application_id": "APP001",
  "status": "SUBMITTED"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Admission submitted successfully"
}
```

### POST /api/admissions/documents/upload

**Uploads:** Document for admission

**Request:** (multipart/form-data)

- `application_id` - Application ID
- `document_type` - Type of document
- `file` - Document file

```bash
curl -X POST http://localhost:5000/api/admissions/documents/upload \
  -H "Authorization: Bearer <TOKEN>" \
  -F "application_id=APP001" \
  -F "document_type=transcript" \
  -F "file=@document.pdf"
```

**Response:**

```json
{
  "success": true,
  "data": {
    "document_id": 5,
    "file_path": "/uploads/APP001-transcript.pdf"
  },
  "message": "Document uploaded successfully"
}
```

### GET /api/admissions/:applicationId/progress

**Returns:** Application progress status

```bash
curl http://localhost:5000/api/admissions/APP001/progress \
  -H "Authorization: Bearer <TOKEN>"
```

**Response:**

```json
{
  "success": true,
  "data": {
    "application_id": "APP001",
    "current_step": 4,
    "total_steps": 6,
    "completed_steps": [1, 2, 3, 4],
    "steps": [
      { "step": 1, "name": "Student Info", "completed": true },
      { "step": 2, "name": "Parent Info", "completed": true },
      { "step": 3, "name": "Academic Info", "completed": true },
      { "step": 4, "name": "Documents", "completed": false }
    ]
  }
}
```

### PUT /api/admissions/:applicationId/progress

**Updates:** Application progress step

**Request:**

```json
{
  "current_step": 4,
  "step_data": { "completed": true }
}
```

**Response:**

```json
{
  "success": true,
  "message": "Progress updated successfully"
}
```

### POST /api/admissions/save-academic

**Saves:** Academic details for admission

**Request:**

```json
{
  "application_id": "APP001",
  "current_school": "ABC School",
  "current_class": "Grade 4",
  "gpa": "9.5",
  "subjects": ["Math", "Science", "English"]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Academic details saved successfully"
}
```

---

## Applications

Base URL: `http://localhost:5000/api/applications` or `/api/admission`

All application routes are **protected** by JWT authentication

| Method | Endpoint             | Purpose                            |
| ------ | -------------------- | ---------------------------------- |
| POST   | `/start`             | Start new admission application    |
| POST   | `/save-step`         | Save application step              |
| GET    | `/resume/:id`        | Resume draft application           |
| POST   | `/complete`          | Complete application               |
| GET    | `/eligible-leads`    | Get eligible leads for application |
| GET    | `/counts`            | Get application counts             |
| GET    | `/search`            | Search applications                |
| GET    | `/`                  | Get all applications               |
| GET    | `/draft`             | Get draft applications             |
| GET    | `/:id/resume`        | Resume application by ID           |
| POST   | `/new`               | Create without lead                |
| POST   | `/`                  | Create from lead                   |
| GET    | `/:id/progress`      | Get application progress           |
| GET    | `/:id/details`       | Get full application details       |
| POST   | `/:id/student-info`  | Save student info (Step 1)         |
| POST   | `/:id/parent-info`   | Save parent info (Step 2)          |
| POST   | `/:id/academic-info` | Save academic info (Step 3)        |
| POST   | `/:id/documents`     | Upload documents (Step 5)          |
| POST   | `/:id/submit`        | Submit final application (Step 6)  |
| GET    | `/:id`               | Get application details            |

### POST /api/applications/start

**Starts:** New admission application

**Request:**

```json
{
  "lead_id": 1,
  "school_id": 1,
  "academic_year": 2026
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "application_id": "APP001",
    "status": "DRAFT",
    "current_step": 1
  },
  "message": "Application started successfully"
}
```

### POST /api/applications/save-step

**Saves:** Application step data

**Request:**

```json
{
  "application_id": "APP001",
  "step": 2,
  "data": {
    "first_name": "Rohan",
    "last_name": "Sharma"
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "Step saved successfully"
}
```

### GET /api/applications/resume/:id

**Returns:** Draft application for resumption

```bash
curl http://localhost:5000/api/applications/resume/APP001 \
  -H "Authorization: Bearer <TOKEN>"
```

**Response:**

```json
{
  "success": true,
  "data": {
    "application_id": "APP001",
    "status": "DRAFT",
    "current_step": 2,
    "student_info": { "first_name": "Rohan" },
    "parent_info": {}
  }
}
```

### POST /api/applications/complete

**Completes:** Application submission

**Request:**

```json
{
  "application_id": "APP001"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Application completed successfully"
}
```

### GET /api/applications/eligible-leads

**Returns:** Leads eligible for new applications

```bash
curl http://localhost:5000/api/applications/eligible-leads \
  -H "Authorization: Bearer <TOKEN>"
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "lead_id": 1,
      "first_name": "Rohan",
      "last_name": "Sharma",
      "desired_class": "Grade 5"
    }
  ],
  "count": 15
}
```

### GET /api/applications/counts

**Returns:** Application counts by status

```bash
curl http://localhost:5000/api/applications/counts \
  -H "Authorization: Bearer <TOKEN>"
```

**Response:**

```json
{
  "success": true,
  "data": {
    "total": 50,
    "draft": 10,
    "submitted": 30,
    "approved": 8,
    "rejected": 2
  }
}
```

### GET /api/applications/search

**Returns:** Applications matching criteria

**Query Parameters:**

- `query` - Search term
- `status` - Filter by status
- `class` - Filter by class

```bash
curl "http://localhost:5000/api/applications/search?query=rohan&status=submitted" \
  -H "Authorization: Bearer <TOKEN>"
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "application_id": "APP001",
      "student_name": "Rohan Sharma",
      "status": "SUBMITTED",
      "created_date": "2026-04-20"
    }
  ]
}
```

### GET /api/applications

**Returns:** All applications with pagination

**Query Parameters:**

- `limit` - Records per page (default: 10)
- `offset` - Records to skip (default: 0)

```bash
curl "http://localhost:5000/api/applications?limit=20" \
  -H "Authorization: Bearer <TOKEN>"
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "application_id": "APP001",
      "student_name": "Rohan",
      "status": "SUBMITTED"
    }
  ],
  "pagination": {
    "total": 50,
    "limit": 20,
    "offset": 0
  }
}
```

### GET /api/applications/draft

**Returns:** Draft applications

```bash
curl http://localhost:5000/api/applications/draft \
  -H "Authorization: Bearer <TOKEN>"
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "application_id": "APP002",
      "student_name": "Raj",
      "status": "DRAFT",
      "current_step": 2
    }
  ]
}
```

### GET /api/applications/:id/resume

**Returns:** Application data for resumption

```bash
curl http://localhost:5000/api/applications/APP001/resume \
  -H "Authorization: Bearer <TOKEN>"
```

**Response:**

```json
{
  "success": true,
  "data": {
    "application_id": "APP001",
    "status": "DRAFT",
    "current_step": 2,
    "completed_steps": [1],
    "student_info": {},
    "parent_info": {}
  }
}
```

### POST /api/applications/new

**Creates:** Application without lead

**Request:**

```json
{
  "school_id": 1,
  "academic_year": 2026,
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "application_id": "APP003"
  },
  "message": "Application created successfully"
}
```

### POST /api/applications

**Creates:** Application from lead

**Request:**

```json
{
  "lead_id": 1,
  "academic_year_id": 2026
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "application_id": "APP004"
  },
  "message": "Application created from lead successfully"
}
```

### GET /api/applications/:id/progress

**Returns:** Application progress

```bash
curl http://localhost:5000/api/applications/APP001/progress \
  -H "Authorization: Bearer <TOKEN>"
```

**Response:**

```json
{
  "success": true,
  "data": {
    "application_id": "APP001",
    "current_step": 3,
    "completed_steps": [1, 2]
  }
}
```

### GET /api/applications/:id/details

**Returns:** Full application details

```bash
curl http://localhost:5000/api/applications/APP001/details \
  -H "Authorization: Bearer <TOKEN>"
```

**Response:**

```json
{
  "success": true,
  "data": {
    "application_id": "APP001",
    "status": "DRAFT",
    "student_info": {
      "first_name": "Rohan",
      "last_name": "Sharma",
      "date_of_birth": "2015-08-20"
    },
    "parent_info": {},
    "academic_info": {}
  }
}
```

### POST /api/applications/:id/student-info

**Saves:** Student information (Step 1)

**Request:**

```json
{
  "first_name": "Rohan",
  "last_name": "Sharma",
  "date_of_birth": "2015-08-20",
  "gender": "Male",
  "current_school": "ABC School"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Student information saved successfully"
}
```

### POST /api/applications/:id/parent-info

**Saves:** Parent information (Step 2)

**Request:**

```json
{
  "father_name": "Rajesh Sharma",
  "father_phone": "9876543210",
  "mother_name": "Priya Sharma",
  "mother_phone": "9876543211",
  "address": "123 Main St"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Parent information saved successfully"
}
```

### POST /api/applications/:id/academic-info

**Saves:** Academic information (Step 3)

**Request:**

```json
{
  "current_class": "Grade 4",
  "board": "ICSE",
  "last_gpa": "9.5",
  "subjects": ["Math", "Science", "English"]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Academic information saved successfully"
}
```

### POST /api/applications/:id/documents

**Uploads:** Application documents (Step 5)

**Request:** (multipart/form-data)

- `documents` - Document files
- `document_types` - Type of each document

```bash
curl -X POST http://localhost:5000/api/applications/APP001/documents \
  -H "Authorization: Bearer <TOKEN>" \
  -F "documents=@transcript.pdf" \
  -F "documents=@birth_cert.pdf" \
  -F "document_types=transcript" \
  -F "document_types=birth_certificate"
```

**Response:**

```json
{
  "success": true,
  "data": {
    "document_count": 2,
    "documents": [
      {
        "id": 1,
        "type": "transcript",
        "file_path": "/uploads/app001-transcript.pdf"
      }
    ]
  },
  "message": "Documents uploaded successfully"
}
```

### POST /api/applications/:id/submit

**Submits:** Final application (Step 6)

**Request:**

```json
{
  "confirmation": true
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "application_id": "APP001",
    "status": "SUBMITTED",
    "submitted_date": "2026-04-21T10:30:00Z"
  },
  "message": "Application submitted successfully"
}
```

### GET /api/applications/:id

**Returns:** Application details (alias endpoint)

```bash
curl http://localhost:5000/api/applications/APP001 \
  -H "Authorization: Bearer <TOKEN>"
```

**Response:**

```json
{
  "success": true,
  "data": {
    "application_id": "APP001",
    "status": "SUBMITTED"
  }
}
```

---

## Parents

Base URL: `http://localhost:5000/api/parents`

| Method | Endpoint | Purpose             |
| ------ | -------- | ------------------- |
| GET    | `/:id`   | Get parent by ID    |
| POST   | `/save`  | Save parent details |

### GET /api/parents/:id

**Returns:** Parent details

```bash
curl http://localhost:5000/api/parents/1
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "relationship": "Father",
    "first_name": "Rajesh",
    "last_name": "Sharma",
    "email": "rajesh@example.com",
    "phone": "9876543210",
    "occupation": "Business"
  }
}
```

### POST /api/parents/save

**Saves:** Parent details

**Request:**

```json
{
  "id": 1,
  "phone": "9888888888",
  "occupation": "Engineer"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Parent details saved successfully"
}
```

---

## Communication

Base URL: `http://localhost:5000/api/communication`

All communication routes are **protected** by JWT authentication

| Method | Endpoint      | Purpose                      |
| ------ | ------------- | ---------------------------- |
| GET    | `/recipients` | Get communication recipients |
| POST   | `/send`       | Send communication           |
| GET    | `/logs`       | Get communication logs       |
| PUT    | `/:id/status` | Update communication status  |

### GET /api/communication/recipients

**Returns:** Available recipients for communication

```bash
curl http://localhost:5000/api/communication/recipients \
  -H "Authorization: Bearer <TOKEN>"
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Rohan Sharma",
      "email": "rohan@example.com",
      "phone": "9999999999"
    }
  ]
}
```

### POST /api/communication/send

**Sends:** Communication to recipients

**Request:**

```json
{
  "recipients": [1, 2, 3],
  "type": "email",
  "subject": "Application Status",
  "message": "Your application is under review",
  "template_id": 5
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "communication_id": 10,
    "recipients_count": 3,
    "sent_at": "2026-04-21T10:30:00Z"
  },
  "message": "Communication sent successfully"
}
```

### GET /api/communication/logs

**Returns:** Communication logs

**Query Parameters:**

- `limit` - Records per page
- `offset` - Records to skip
- `type` - Filter by type (email, sms, whatsapp)

```bash
curl "http://localhost:5000/api/communication/logs?type=email&limit=20" \
  -H "Authorization: Bearer <TOKEN>"
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "recipient": "rohan@example.com",
      "type": "email",
      "subject": "Application Status",
      "status": "SENT",
      "sent_date": "2026-04-21T10:30:00Z"
    }
  ]
}
```

### PUT /api/communication/:id/status

**Updates:** Communication status

**Request:**

```json
{
  "status": "READ"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Communication status updated successfully"
}
```

---

## Email

Base URL: `http://localhost:5000/api/email`

All email routes are **protected** by JWT authentication

| Method | Endpoint         | Purpose               |
| ------ | ---------------- | --------------------- |
| POST   | `/send`          | Send email            |
| GET    | `/logs`          | Get email logs        |
| GET    | `/stats`         | Get email statistics  |
| PUT    | `/:id/status`    | Update email status   |
| POST   | `/templates`     | Create email template |
| GET    | `/templates`     | Get email templates   |
| PUT    | `/templates/:id` | Update email template |
| DELETE | `/templates/:id` | Delete email template |
| GET    | `/recipients`    | Get email recipients  |

### POST /api/email/send

**Sends:** Email to recipients

**Request:**

```json
{
  "to": ["rohan@example.com", "priya@example.com"],
  "subject": "Application Update",
  "body": "Your application status has been updated",
  "template_id": 1,
  "template_variables": {
    "name": "Rohan",
    "status": "Under Review"
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "email_id": 5,
    "recipients": 2,
    "sent_at": "2026-04-21T10:30:00Z"
  },
  "message": "Email sent successfully"
}
```

### GET /api/email/logs

**Returns:** Email logs

**Query Parameters:**

- `limit` - Records per page
- `offset` - Records to skip
- `status` - Filter by status (sent, failed, bounced)

```bash
curl "http://localhost:5000/api/email/logs?limit=20&status=sent" \
  -H "Authorization: Bearer <TOKEN>"
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "to": "rohan@example.com",
      "subject": "Application Update",
      "status": "SENT",
      "sent_at": "2026-04-21T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 100,
    "limit": 20,
    "offset": 0
  }
}
```

### GET /api/email/stats

**Returns:** Email statistics

```bash
curl http://localhost:5000/api/email/stats \
  -H "Authorization: Bearer <TOKEN>"
```

**Response:**

```json
{
  "success": true,
  "data": {
    "total_sent": 500,
    "total_failed": 5,
    "total_bounced": 2,
    "delivery_rate": "99.4%"
  }
}
```

### PUT /api/email/:id/status

**Updates:** Email status

**Request:**

```json
{
  "status": "READ"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Email status updated successfully"
}
```

### POST /api/email/templates

**Creates:** Email template

**Request:**

```json
{
  "name": "Application Status",
  "subject": "Your Application Status",
  "body": "Dear {{name}}, your application is {{status}}",
  "variables": ["name", "status"]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Application Status"
  },
  "message": "Template created successfully"
}
```

### GET /api/email/templates

**Returns:** All email templates

```bash
curl http://localhost:5000/api/email/templates \
  -H "Authorization: Bearer <TOKEN>"
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Application Status",
      "subject": "Your Application Status",
      "created_date": "2026-04-20"
    }
  ]
}
```

### PUT /api/email/templates/:id

**Updates:** Email template

**Request:**

```json
{
  "subject": "Updated Subject",
  "body": "Updated template body"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Template updated successfully"
}
```

### DELETE /api/email/templates/:id

**Deletes:** Email template

```bash
curl -X DELETE http://localhost:5000/api/email/templates/1 \
  -H "Authorization: Bearer <TOKEN>"
```

**Response:**

```json
{
  "success": true,
  "message": "Template deleted successfully"
}
```

### GET /api/email/recipients

**Returns:** Email recipients

```bash
curl http://localhost:5000/api/email/recipients \
  -H "Authorization: Bearer <TOKEN>"
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Rohan",
      "email": "rohan@example.com"
    }
  ]
}
```

---

## SMS

Base URL: `http://localhost:5000/api/sms`

All SMS routes are **protected** by JWT authentication

| Method | Endpoint | Purpose      |
| ------ | -------- | ------------ |
| POST   | `/send`  | Send SMS     |
| GET    | `/logs`  | Get SMS logs |

### POST /api/sms/send

**Sends:** SMS to recipients

**Request:**

```json
{
  "to": ["+919999999999", "+918888888888"],
  "message": "Your application has been received",
  "template_id": 2
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "sms_id": 3,
    "recipients": 2,
    "sent_at": "2026-04-21T10:30:00Z"
  },
  "message": "SMS sent successfully"
}
```

### GET /api/sms/logs

**Returns:** SMS logs

**Query Parameters:**

- `limit` - Records per page
- `offset` - Records to skip
- `status` - Filter by status

```bash
curl "http://localhost:5000/api/sms/logs?limit=20" \
  -H "Authorization: Bearer <TOKEN>"
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "to": "+919999999999",
      "message": "Your application received",
      "status": "SENT",
      "sent_at": "2026-04-21T10:30:00Z"
    }
  ]
}
```

---

## WhatsApp

Base URL: `http://localhost:5000/api/whatsapp`

All WhatsApp routes are **protected** by JWT authentication

| Method | Endpoint | Purpose               |
| ------ | -------- | --------------------- |
| POST   | `/send`  | Send WhatsApp message |
| GET    | `/logs`  | Get WhatsApp logs     |

### POST /api/whatsapp/send

**Sends:** WhatsApp message

**Request:**

```json
{
  "to": ["+919999999999"],
  "message": "Your application is under review",
  "media_url": "https://example.com/image.jpg"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "message_id": 2,
    "recipients": 1,
    "sent_at": "2026-04-21T10:30:00Z"
  },
  "message": "WhatsApp message sent successfully"
}
```

### GET /api/whatsapp/logs

**Returns:** WhatsApp logs

```bash
curl http://localhost:5000/api/whatsapp/logs \
  -H "Authorization: Bearer <TOKEN>"
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "to": "+919999999999",
      "message": "Your application is under review",
      "status": "SENT",
      "sent_at": "2026-04-21T10:30:00Z"
    }
  ]
}
```

---

## Templates

Base URL: `http://localhost:5000/api/templates`

All template routes are **protected** by JWT authentication

| Method | Endpoint | Purpose           |
| ------ | -------- | ----------------- |
| POST   | `/`      | Create template   |
| GET    | `/`      | Get all templates |
| PUT    | `/:id`   | Update template   |
| DELETE | `/:id`   | Delete template   |

### POST /api/templates

**Creates:** Communication template

**Request:**

```json
{
  "name": "Acceptance Letter",
  "type": "email",
  "subject": "Congratulations!",
  "content": "Dear {{student_name}}, you have been accepted to {{school_name}}",
  "variables": ["student_name", "school_name"]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Acceptance Letter"
  },
  "message": "Template created successfully"
}
```

### GET /api/templates

**Returns:** All templates

```bash
curl http://localhost:5000/api/templates \
  -H "Authorization: Bearer <TOKEN>"
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Acceptance Letter",
      "type": "email",
      "created_date": "2026-04-20"
    }
  ]
}
```

### PUT /api/templates/:id

**Updates:** Template

**Request:**

```json
{
  "subject": "Welcome to {{school_name}}",
  "content": "Updated content"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Template updated successfully"
}
```

### DELETE /api/templates/:id

**Deletes:** Template

```bash
curl -X DELETE http://localhost:5000/api/templates/1 \
  -H "Authorization: Bearer <TOKEN>"
```

**Response:**

```json
{
  "success": true,
  "message": "Template deleted successfully"
}
```

---

## Campaigns

Base URL: `http://localhost:5000/api/campaigns`

All campaign routes are **protected** by JWT authentication

| Method | Endpoint    | Purpose           |
| ------ | ----------- | ----------------- |
| POST   | `/`         | Create campaign   |
| GET    | `/`         | Get all campaigns |
| POST   | `/:id/send` | Send campaign     |

### POST /api/campaigns

**Creates:** Campaign

**Request:**

```json
{
  "name": "April Admission Drive",
  "description": "Campaign for April admission",
  "type": "email",
  "template_id": 1,
  "recipients": {
    "filter_type": "status",
    "filter_value": "lead"
  },
  "scheduled_for": "2026-04-25T10:00:00Z"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "April Admission Drive",
    "status": "DRAFT"
  },
  "message": "Campaign created successfully"
}
```

### GET /api/campaigns

**Returns:** All campaigns

```bash
curl http://localhost:5000/api/campaigns \
  -H "Authorization: Bearer <TOKEN>"
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "April Admission Drive",
      "type": "email",
      "status": "DRAFT",
      "created_date": "2026-04-20"
    }
  ]
}
```

### POST /api/campaigns/:id/send

**Sends:** Campaign

**Request:**

```json
{
  "send_now": true
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "campaign_id": 1,
    "recipients_count": 50,
    "sent_at": "2026-04-21T10:30:00Z"
  },
  "message": "Campaign sent successfully"
}
```

---

## Dashboard

Base URL: `http://localhost:5000/api`

All dashboard routes are **protected** by JWT authentication

| Method | Endpoint                           | Purpose                   |
| ------ | ---------------------------------- | ------------------------- |
| GET    | `/dashboard`                       | Get dashboard statistics  |
| GET    | `/dashboard/monthly-trend`         | Get monthly trend data    |
| GET    | `/dashboard/grade-distribution`    | Get grade distribution    |
| GET    | `/dashboard/counselor-performance` | Get counselor performance |
| GET    | `/dashboard/funnel`                | Get admission funnel data |

### GET /api/dashboard

**Returns:** Dashboard statistics

```bash
curl http://localhost:5000/api/dashboard \
  -H "Authorization: Bearer <TOKEN>"
```

**Response:**

```json
{
  "success": true,
  "data": {
    "total_leads": 150,
    "total_applications": 120,
    "total_admissions": 50,
    "pending_followups": 25,
    "conversion_rate": "33.3%"
  }
}
```

### GET /api/dashboard/monthly-trend

**Returns:** Monthly trend data

```bash
curl http://localhost:5000/api/dashboard/monthly-trend \
  -H "Authorization: Bearer <TOKEN>"
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "month": "January",
      "leads": 50,
      "applications": 40,
      "admissions": 15
    },
    {
      "month": "February",
      "leads": 60,
      "applications": 50,
      "admissions": 20
    }
  ]
}
```

### GET /api/dashboard/grade-distribution

**Returns:** Student distribution by grade

```bash
curl http://localhost:5000/api/dashboard/grade-distribution \
  -H "Authorization: Bearer <TOKEN>"
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "grade": "Grade 1",
      "total_applications": 15,
      "total_admissions": 8
    },
    {
      "grade": "Grade 5",
      "total_applications": 20,
      "total_admissions": 12
    }
  ]
}
```

### GET /api/dashboard/counselor-performance

**Returns:** Counselor performance metrics

```bash
curl http://localhost:5000/api/dashboard/counselor-performance \
  -H "Authorization: Bearer <TOKEN>"
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "counselor_id": 1,
      "counselor_name": "John Smith",
      "leads_assigned": 50,
      "conversions": 15,
      "conversion_rate": "30%"
    }
  ]
}
```

### GET /api/dashboard/funnel

**Returns:** Admission funnel data

```bash
curl http://localhost:5000/api/dashboard/funnel \
  -H "Authorization: Bearer <TOKEN>"
```

**Response:**

```json
{
  "success": true,
  "data": {
    "leads": 150,
    "applications_started": 120,
    "applications_submitted": 100,
    "admissions_approved": 50,
    "funnel_stages": [
      { "stage": "Lead", "count": 150 },
      { "stage": "Application Started", "count": 120 },
      { "stage": "Application Submitted", "count": 100 },
      { "stage": "Admission Approved", "count": 50 }
    ]
  }
}
```

---

## Common Response Format

### Success Response

```json
{
  "success": true,
  "data": {...},
  "message": "Operation successful"
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "error_code": "INVALID_REQUEST"
}
```

---

## Authentication

Most endpoints require JWT token in Authorization header:

```bash
curl http://localhost:5000/api/endpoint \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

---

## Error Handling

| Status Code | Meaning                      |
| ----------- | ---------------------------- |
| 200         | Success                      |
| 201         | Created                      |
| 204         | No Content                   |
| 400         | Bad Request                  |
| 401         | Unauthorized (missing token) |
| 403         | Forbidden (no access)        |
| 404         | Not Found                    |
| 409         | Conflict                     |
| 413         | Payload Too Large            |
| 500         | Server Error                 |

---

## Getting Started

1. **Start Backend**

   ```bash
   cd backend
   npm install
   npm start
   ```

2. **Test Health Check**

   ```bash
   curl http://localhost:5000/api/health
   ```

3. **Login to Get Token**

   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"user@example.com","password":"password"}'
   ```

4. **Use Token for Protected Routes**

   ```bash
   curl http://localhost:5000/api/leads \
     -H "Authorization: Bearer <TOKEN_FROM_LOGIN>"
   ```

---

**Last Updated:** April 21, 2026  
**Version:** 2.0  
**Status:** Complete - All Routes Documented

---

## 1. GET /stats

**Returns:** Admission counts by status

```bash
curl http://localhost:5000/api/admissions/stats
```

**Response:**

```json
{
  "success": true,
  "data": {
    "total": 2,
    "submitted": 1,
    "under_review": 1,
    "approved": 0,
    "waitlisted": 0
  },
  "message": "Admission statistics fetched successfully"
}
```

---

## 2. GET /search?query=...

**Returns:** Admissions matching the search query

**Parameters:**

- `query` - Student name or parent phone number (required)

```bash
# By student name
curl "http://localhost:5000/api/admissions/search?query=aarav"

# By parent phone
curl "http://localhost:5000/api/admissions/search?query=9876543210"
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "application_id": "APP001",
      "student_name": "Aarav Sharma",
      "grade": "Grade 5",
      "parent_contact": "+91 9876543210",
      "submitted_date": "2026-02-28",
      "status": "UNDER_REVIEW"
    }
  ],
  "message": "Found 1 admission(s) matching your search"
}
```

---

## 3. GET /

**Returns:** Paginated list of all admissions

**Parameters:**

- `limit` - Records per page (default: 10, max: 100)
- `offset` - Number of records to skip (default: 0)

```bash
# Default (first 10 records)
curl http://localhost:5000/api/admissions

# Custom pagination
curl "http://localhost:5000/api/admissions?limit=20&offset=0"

# Second page (11-20)
curl "http://localhost:5000/api/admissions?limit=10&offset=10"
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "application_id": "APP001",
      "student_name": "Aarav Sharma",
      "grade": "Grade 5",
      "parent_contact": "+91 9876543210",
      "submitted_date": "2026-02-28",
      "status": "UNDER_REVIEW"
    },
    {
      "application_id": "APP002",
      "student_name": "Aayush Patel",
      "grade": "Grade 4",
      "parent_contact": "+91 9876543211",
      "submitted_date": "2026-02-25",
      "status": "SUBMITTED"
    }
  ],
  "pagination": {
    "total": 2,
    "limit": 10,
    "offset": 0,
    "pages": 1
  }
}
```

---

## 4. GET /:applicationId

**Returns:** Detailed information for a specific application

**Parameters:**

- `applicationId` - Application ID (in URL path)

```bash
curl http://localhost:5000/api/admissions/APP001
```

**Response:**

```json
{
  "success": true,
  "data": {
    "application_id": "APP001",
    "student_id": 1,
    "class_id": 1,
    "section_id": 1,
    "submitted_date": "2026-02-28",
    "status": "UNDER_REVIEW",
    "first_name": "Aarav",
    "last_name": "Sharma",
    "date_of_birth": "2016-05-15",
    "gender": "Male",
    "aadhar_number": "123456789012",
    "phone_number": "9999999999",
    "email": "aarav@example.com",
    "class_name": "Grade 5",
    "section_name": "A",
    "father_name": "Rajesh Sharma",
    "father_mobile": "9876543210",
    "mother_name": "Priya Sharma",
    "mother_mobile": "9876543211"
  }
}
```

---

## Status Values

Possible admission statuses:

| Status       | Meaning                                |
| ------------ | -------------------------------------- |
| SUBMITTED    | Application submitted, awaiting review |
| UNDER_REVIEW | Application being reviewed             |
| APPROVED     | Application approved                   |
| REJECTED     | Application rejected                   |
| WAITLISTED   | Student on waitlist                    |
| COMPLETED    | Admission completed                    |

---

## Common Response Formats

### Success Response

```json
{
  "success": true,
  "data": {...},
  "message": "..."
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description"
}
```

---

## JavaScript Fetch Examples

### Get Statistics

```javascript
fetch("http://localhost:5000/api/admissions/stats")
  .then((res) => res.json())
  .then((data) => console.log(data.data))
  .catch((err) => console.error(err));
```

### Search Admissions

```javascript
const query = "aarav";
fetch(
  `http://localhost:5000/api/admissions/search?query=${encodeURIComponent(query)}`,
)
  .then((res) => res.json())
  .then((data) => {
    if (data.success) {
      console.log(data.data);
    }
  })
  .catch((err) => console.error(err));
```

### Get All Admissions

```javascript
fetch("http://localhost:5000/api/admissions?limit=20&offset=0")
  .then((res) => res.json())
  .then((data) => {
    console.log(data.data);
    console.log(`Total: ${data.pagination.total}`);
  })
  .catch((err) => console.error(err));
```

### Get Admission Details

```javascript
const appId = "APP001";
fetch(`http://localhost:5000/api/admissions/${appId}`)
  .then((res) => res.json())
  .then((data) => {
    if (data.success) {
      console.log(data.data);
    }
  })
  .catch((err) => console.error(err));
```

---

## Axios Examples

### Get Statistics

```javascript
import axios from "axios";

axios
  .get("http://localhost:5000/api/admissions/stats")
  .then((res) => console.log(res.data.data))
  .catch((err) => console.error(err));
```

### Search Admissions

```javascript
const query = "aarav";
axios
  .get("http://localhost:5000/api/admissions/search", {
    params: { query },
  })
  .then((res) => console.log(res.data.data))
  .catch((err) => console.error(err));
```

### Get All Admissions

```javascript
axios
  .get("http://localhost:5000/api/admissions", {
    params: { limit: 20, offset: 0 },
  })
  .then((res) => {
    console.log(res.data.data);
    console.log(`Total: ${res.data.pagination.total}`);
  })
  .catch((err) => console.error(err));
```

### Get Admission Details

````javascript
const appId = "APP001";
axios
  .get(`http://localhost:5000/api/admissions/${appId}`)
  .then((res) => console.log(res.data.data))

---

## Create Lead

POST /api/leads

### Request:

```json
{
  "student_name": "Rohan Sharma",
  "date_of_birth": "2010-05-10",
  "gender": "Male",
  "grade_applying_for": "Class 5",
  "current_school": "ABC School",

  "father_name": "Rajesh Sharma",
  "father_occupation": "Business",
  "father_email": "rajesh@email.com",
  "father_phone": "+919999999999",

  "mother_name": "Sunita Sharma",
  "mother_occupation": "Teacher",
  "mother_email": "sunita@email.com",
  "mother_phone": "+919888888888",

  "address": "Pune",
  "city": "Pune",
  "state": "Maharashtra",
  "pin_code": "411001",

  "lead_source": "Website",
  "referred_by": "School fair",
  "assigned_to": "admin",
  "priority": "high",
  "additional_notes": "Interested in sports quota",

  "school_id": 1,
  "academic_year_id": 2
}
````

### Response:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "message": "Lead created successfully"
  }
}
```

### Description:

Creates a new lead from the Add Lead form; extra fields are stored in `notes` JSON column.

.catch((err) => console.error(err));

````

---

## Error Handling Examples

### Complete Error Handling

```javascript
async function getAdmissions() {
  try {
    const response = await fetch("http://localhost:5000/api/admissions/stats");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message);
    }

    return data.data;
  } catch (error) {
    console.error("Failed to fetch admissions:", error.message);
    return null;
  }
}
````

---

## Search Tips

1. **Partial Matching**: Search uses ILIKE (case-insensitive substring matching)
   - Query "AAR" will match "Aarav", "aardvark", etc.
2. **Space Handling**: Spaces are preserved
   - Query "Aarav Sharma" searches for this exact string
   - Query "Aarav" searches by first name only

3. **Phone Number Search**: Can search with or without formatting
   - "9876543210" works
   - "+919876543210" works (formatting ignored)

4. **No Wildcards Needed**: The API handles ILIKE internally
   - Don't use '%' or '\_' in your query

---

## Performance Notes

- **Search**: Limited to 100 results to prevent large result sets
- **Pagination**: Maximum limit is 100 records per page
- **Response Time**: Should be <100ms for typical queries with proper indexes
- **Caching**: Statistics endpoint can be cached for 1-5 minutes in frontend

---

## Getting Started

1. **Start Backend**

   ```bash
   cd backend
   npm start
   ```

2. **Test Health Check**

   ```bash
   curl http://localhost:5000/api/health
   ```

3. **Fetch Statistics**

   ```bash
   curl http://localhost:5000/api/admissions/stats
   ```

4. **Search Admissions**
   ```bash
   curl "http://localhost:5000/api/admissions/search?query=aarav"
   ```

---

## Troubleshooting

| Issue                              | Solution                                            |
| ---------------------------------- | --------------------------------------------------- |
| `Cannot GET /api/admissions/stats` | Backend not running or route not registered         |
| `Cannot find package 'pg'`         | Run `npm install pg`                                |
| `Query parameter is required`      | Search endpoint needs `?query=value`                |
| `No results found`                 | Try different search term or check database         |
| `Limit must be between 1 and 100`  | Use valid limit value (1-100)                       |
| CORS errors                        | Check CORS_ORIGIN in .env file matches frontend URL |

---

**Last Updated:** 2026-03-06  
**Version:** 1.0
