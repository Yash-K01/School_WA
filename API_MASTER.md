# API Master Reference

## Overview

This document consolidates all API endpoints used in the School ERP system. It references and combines information from:

- `ADMISSIONS_API_REFERENCE.md`
- `LEAD_API_IMPLEMENTATION.md`
- `UPCOMING_FOLLOWUPS_IMPLEMENTATION.md`
- `backend/API_DOCUMENTATION.md`

## Base URLs

- **Backend API**: `http://localhost:5001/api`
- **Admissions API**: `http://localhost:5000/api/admissions` (legacy)

---

## Table of Contents

1. [Health Check](#health-check)
2. [Authentication](#authentication)
3. [Schools](#schools)
4. [Students](#students)
5. [Leads](#leads)
6. [Applications](#applications)
7. [Admissions](#admissions)
8. [Dashboard](#dashboard)
9. [Communication](#communication)
10. [Error Handling](#error-handling)

---

## Health Check

### GET /api/health

Check server health status.

**Response:**

```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-03-12T22:31:47.000Z",
  "environment": "development"
}
```

---

## Authentication

JWT-based authentication required for all protected endpoints.

**Header:** `Authorization: Bearer <JWT_TOKEN>`

**Token Payload:**

```json
{
  "id": "user_id",
  "school_id": "school_id",
  "role": "counselor|admin|super_admin",
  "iat": 1234567890,
  "exp": 1234567890
}
```

---

## Schools

### GET /api/schools

Get all schools.

**Response:**

```json
{
  "success": true,
  "message": "Schools retrieved successfully",
  "count": 1,
  "data": [
    {
      "id": 1,
      "name": "Green Valley School",
      "email": "info@greenvalley.edu",
      "phone": "+91-9876543210",
      "city": "Delhi",
      "state": "Delhi",
      "principal_name": "Dr. Rajesh Kumar",
      "status": "active",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### GET /api/schools/:id

Get school by ID.

**Response:**

```json
{
  "success": true,
  "message": "School retrieved successfully",
  "data": {
    "id": 1,
    "name": "Green Valley School",
    "email": "info@greenvalley.edu",
    "phone": "+91-9876543210",
    "address": "123, School Road",
    "city": "Delhi",
    "state": "Delhi",
    "postal_code": "110001",
    "country": "India",
    "established_year": 2010,
    "principal_name": "Dr. Rajesh Kumar",
    "status": "active",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

### POST /api/schools

Create new school.

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

**Response:**

```json
{
  "success": true,
  "message": "School created successfully",
  "data": {
    "id": 2,
    "name": "Sunshine Academy",
    "email": "info@sunshine.edu",
    "status": "active",
    "created_at": "2024-03-12T22:31:47.000Z"
  }
}
```

---

## Students

### GET /api/students

Get all students (paginated).

**Query Parameters:**

- `page` (default: 1)
- `limit` (default: 10, max: 100)

**Response:**

```json
{
  "success": true,
  "message": "Students retrieved successfully",
  "data": [
    {
      "id": 1,
      "admission_number": "ADM001",
      "full_name": "Rohan Kumar Singh",
      "email": "rohan@example.com",
      "phone": "+91-9123456789",
      "gender": "Male",
      "status": "active",
      "school_name": "Green Valley School",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 10,
    "pages": 15
  }
}
```

---

## Leads

### POST /api/leads

Create new lead.

**Request:**

```json
{
  "academic_year_id": 5,
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "desired_class": "Grade 5",
  "source": "Website",
  "follow_up_status": "pending",
  "notes": "Interested in admission",
  "assigned_to": null,
  "follow_up_date": "2026-04-15"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "school_id": 1,
    "first_name": "John",
    "phone": "9876543210",
    "created_by": 123,
    "created_at": "2026-03-30T10:30:00Z"
  },
  "message": "Lead created successfully."
}
```

### GET /api/leads

Get all leads with optional filtering.

**Query Parameters:**

- `follow_up_status`
- `desired_class`
- `assigned_to`

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "school_id": 1,
      "academic_year_id": 5,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "phone": "9876543210",
      "desired_class": "Grade 5",
      "source": "Website",
      "follow_up_status": "pending",
      "notes": "Interested in admission",
      "assigned_to": null,
      "last_contacted_at": null,
      "created_at": "2026-03-30T10:30:00Z",
      "updated_at": "2026-03-30T10:30:00Z"
    }
  ]
}
```

### GET /api/leads/:id

Get lead by ID.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "school_id": 1,
    "academic_year_id": 5,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "desired_class": "Grade 5",
    "source": "Website",
    "follow_up_status": "pending",
    "notes": "Interested in admission",
    "assigned_to": null,
    "last_contacted_at": null,
    "created_at": "2026-03-30T10:30:00Z",
    "updated_at": "2026-03-30T10:30:00Z"
  }
}
```

### PUT /api/leads/:id

Update lead.

**Request:** (partial update)

```json
{
  "follow_up_status": "contacted",
  "notes": "Called parent",
  "last_contacted_at": "2026-04-01T10:00:00Z"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "follow_up_status": "contacted",
    "notes": "Called parent",
    "last_contacted_at": "2026-04-01T10:00:00Z",
    "updated_at": "2026-04-01T10:00:00Z"
  }
}
```

### DELETE /api/leads/:id

Delete lead.

**Response:** `204 No Content`

### GET /api/leads/followups/upcoming

Get upcoming follow-ups.

**Query Parameters:**

- `interval` (default: 2) - Days interval for follow-up calculation
- `limit` (default: 10) - Maximum records to return

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 45,
      "first_name": "Rahul",
      "last_name": "Sharma",
      "phone": "9876543210",
      "email": "rahul@email.com",
      "follow_up_status": "contacted",
      "last_contacted_at": "2026-04-03T14:30:00.000Z",
      "next_follow_up_date": "2026-04-05T14:30:00.000Z",
      "assigned_to": "counselor1",
      "desired_class": "Grade 4",
      "priority": "upcoming"
    }
  ],
  "count": 1
}
```

---

## Applications

### POST /api/applications

Create new application.

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
    "id": 1,
    "school_id": 1,
    "lead_id": 1,
    "academic_year_id": 2026,
    "application_number": "APP001",
    "status": "draft",
    "current_step": 1,
    "created_at": "2026-04-01T10:00:00Z"
  }
}
```

### GET /api/applications

Get all applications.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "school_id": 1,
      "lead_id": 1,
      "academic_year_id": 2026,
      "application_number": "APP001",
      "status": "draft",
      "current_step": 1,
      "created_at": "2026-04-01T10:00:00Z"
    }
  ]
}
```

### GET /api/applications/:id

Get application by ID.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "school_id": 1,
    "lead_id": 1,
    "academic_year_id": 2026,
    "application_number": "APP001",
    "status": "draft",
    "current_step": 1,
    "created_at": "2026-04-01T10:00:00Z"
  }
}
```

---

## Admissions

### GET /api/admissions/stats

Get admission statistics.

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

### GET /api/admissions/search

Search admissions by name or phone.

**Query Parameters:**

- `query` (required) - Student name or parent phone number

**Examples:**

```
GET /api/admissions/search?query=aarav
GET /api/admissions/search?query=9876543210
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

Get all admissions (paginated).

**Query Parameters:**

- `limit` (default: 10, max: 100)
- `offset` (default: 0)

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

### GET /api/admissions/:applicationId

Get detailed admission information.

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

**Status Values:**

- SUBMITTED - Application submitted, awaiting review
- UNDER_REVIEW - Application being reviewed
- APPROVED - Application approved
- REJECTED - Application rejected
- WAITLISTED - Student on waitlist
- COMPLETED - Admission completed

---

## Dashboard

### GET /api/dashboard

Get dashboard statistics.

**Response:**

```json
{
  "success": true,
  "data": {
    "totalInquiries": 150,
    "conversionRate": 25.5,
    "activeLeads": 45,
    "enrolledStudents": 38,
    "pendingApplications": 12,
    "offersSent": 35,
    "feesCollected": 2500000,
    "totalInquiriesChange": "+12%",
    "conversionRateChange": "+5%",
    "activeLeadsChange": "-3%",
    "enrolledStudentsChange": "+8%",
    "pendingApplicationsChange": "+2%",
    "offersSentChange": "+15%",
    "feesCollectedChange": "+20%"
  }
}
```

### GET /api/dashboard/funnel

Get admission funnel data.

**Response:**

```json
{
  "success": true,
  "data": {
    "inquiry": 150,
    "contacted": 120,
    "interested": 90,
    "visit": 60,
    "applied": 45,
    "enrolled": 38
  }
}
```

### GET /api/dashboard/monthly-trend

Get monthly trends for inquiries and enrollments.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "month": "Jan",
      "inquiries": 45,
      "enrollments": 12
    },
    {
      "month": "Feb",
      "inquiries": 52,
      "enrollments": 15
    }
  ]
}
```

### GET /api/dashboard/grade-distribution

Get grade distribution for applications.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "label": "Grade 1",
      "value": 15
    },
    {
      "label": "Grade 2",
      "value": 20
    }
  ]
}
```

### GET /api/dashboard/counselor-performance

Get counselor performance data.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "name": "John Smith",
      "leads": 25,
      "conversions": 8,
      "pct": 32
    }
  ]
}
```

---

## Communication

### GET /api/communication/logs

Get communication logs.

**Query Parameters:**

- `recipient_type` (lead|student|parent)
- `channel` (email|sms|whatsapp)
- `status` (sent|delivered|failed|opened|clicked)

### POST /api/communication/send

Send communication.

**Request:**

```json
{
  "recipient_type": "lead",
  "recipient_id": 1,
  "channel": "email",
  "subject": "Welcome",
  "message": "Welcome to our school"
}
```

### GET /api/communication/templates

Get message templates.

### POST /api/communication/campaigns

Create communication campaign.

---

## Error Handling

All API responses follow a consistent error format:

**Error Response:**

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information (optional)"
}
```

**Common HTTP Status Codes:**

- 200 - Success
- 201 - Created
- 204 - No Content (for DELETE)
- 400 - Bad Request
- 401 - Unauthorized
- 403 - Forbidden
- 404 - Not Found
- 422 - Validation Error
- 500 - Internal Server Error

---

## Authentication Errors

**401 Unauthorized:**

```json
{
  "success": false,
  "message": "Access token is required"
}
```

**403 Forbidden:**

```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

---

## Validation Errors

**422 Unprocessable Entity:**

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

---

This master reference consolidates all API endpoints. For implementation details, refer to the individual documentation files mentioned at the top.
