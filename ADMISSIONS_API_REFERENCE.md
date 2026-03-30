# Admission APIs - Quick Reference Guide

## Base URL

```
http://localhost:5000/api/admissions
```

---

## Endpoints Summary

| Method | Endpoint          | Purpose                  | Parameters               |
| ------ | ----------------- | ------------------------ | ------------------------ |
| GET    | `/stats`          | Get admission statistics | None                     |
| GET    | `/search`         | Search admissions        | `query` (required)       |
| GET    | `/`               | Get all admissions       | `limit`, `offset`        |
| GET    | `/:applicationId` | Get admission details    | `applicationId` (in URL) |

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
