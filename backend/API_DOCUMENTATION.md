# University Course Management System - API Documentation

## Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Response Format

### Success Response
```json
{
  "status": "success",
  "message": "Operation completed successfully",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Validation error message",
      "value": "invalid_value"
    }
  ]
}
```

## Authentication Endpoints

### Admin Authentication

#### POST /auth/admin/login
Authenticate an admin user.

**Request Body:**
```json
{
  "email": "admin@university.edu",
  "password": "admin123"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "admin_id",
      "name": "Admin Name",
      "email": "admin@university.edu",
      "role": "admin",
      "lastLogin": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

#### POST /auth/admin/register
Register a new admin (admin-only).

**Headers:** `Authorization: Bearer <admin_jwt_token>`

**Request Body:**
```json
{
  "email": "newadmin@university.edu",
  "password": "newpassword123",
  "name": "New Admin Name"
}
```

### Student Authentication

#### POST /auth/student/login
Authenticate a student user.

**Request Body:**
```json
{
  "studentId": "S12345",
  "password": "student123"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "student_id",
      "name": "Student Name",
      "studentId": "S12345",
      "email": "student@university.edu",
      "role": "student",
      "lastLogin": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

#### PUT /auth/student/profile
Update student profile (student-only).

**Headers:** `Authorization: Bearer <student_jwt_token>`

**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "newemail@university.edu",
  "password": "newpassword123"
}
```

### Common Authentication

#### GET /auth/validate
Validate JWT token and return user info.

**Headers:** `Authorization: Bearer <jwt_token>`

#### GET /auth/me
Get current user profile.

**Headers:** `Authorization: Bearer <jwt_token>`

#### POST /auth/logout
Logout user (client-side token removal).

## Course Management (Admin Only)

### GET /courses
Get all courses with optional filtering and pagination.

**Headers:** `Authorization: Bearer <admin_jwt_token>`

**Query Parameters:**
- `search` (optional): Search by title or code
- `department` (optional): Filter by department
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "status": "success",
  "data": {
    "courses": [
      {
        "id": "course_id",
        "title": "Introduction to Programming",
        "code": "CS101",
        "description": "Course description",
        "credits": 3,
        "department": "Computer Science",
        "maxEnrollment": 30,
        "enrollmentCount": 25,
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 25,
      "itemsPerPage": 10
    }
  }
}
```

### GET /courses/:id
Get single course by ID.

**Headers:** `Authorization: Bearer <admin_jwt_token>`

### POST /courses
Create a new course.

**Headers:** `Authorization: Bearer <admin_jwt_token>`

**Request Body:**
```json
{
  "title": "Web Development",
  "code": "CS401",
  "description": "Modern web development course",
  "credits": 4,
  "department": "Computer Science",
  "maxEnrollment": 25
}
```

### PUT /courses/:id
Update an existing course.

**Headers:** `Authorization: Bearer <admin_jwt_token>`

**Request Body:**
```json
{
  "title": "Advanced Web Development",
  "description": "Updated course description"
}
```

### DELETE /courses/:id
Delete a course (soft delete).

**Headers:** `Authorization: Bearer <admin_jwt_token>`

### GET /courses/:id/stats
Get course statistics.

**Headers:** `Authorization: Bearer <admin_jwt_token>`

**Response:**
```json
{
  "status": "success",
  "data": {
    "course": {
      "id": "course_id",
      "title": "Introduction to Programming",
      "code": "CS101"
    },
    "statistics": {
      "enrollmentCount": 25,
      "maxEnrollment": 30,
      "availableSpots": 5,
      "completedStudents": 20,
      "averageGPA": "3.45",
      "gradeDistribution": {
        "A": 8,
        "B": 7,
        "C": 4,
        "D": 1
      }
    }
  }
}
```

## Student Management (Admin Only)

### GET /students
Get all students with optional filtering and pagination.

**Headers:** `Authorization: Bearer <admin_jwt_token>`

**Query Parameters:**
- `search` (optional): Search by name, student ID, or email
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

### POST /students
Create a new student.

**Headers:** `Authorization: Bearer <admin_jwt_token>`

**Request Body:**
```json
{
  "name": "John Smith",
  "studentId": "S12345",
  "email": "john.smith@student.university.edu",
  "password": "student123"
}
```

### PUT /students/:id
Update a student.

**Headers:** `Authorization: Bearer <admin_jwt_token>`

### DELETE /students/:id
Delete a student (soft delete).

**Headers:** `Authorization: Bearer <admin_jwt_token>`

### POST /students/bulk
Bulk create students.

**Headers:** `Authorization: Bearer <admin_jwt_token>`

**Request Body:**
```json
{
  "students": [
    {
      "name": "Student 1",
      "studentId": "S12345",
      "email": "student1@university.edu"
    },
    {
      "name": "Student 2",
      "studentId": "S12346",
      "email": "student2@university.edu"
    }
  ]
}
```

## Registration Management (Admin Only)

### GET /registrations
Get all registrations with optional filtering.

**Headers:** `Authorization: Bearer <admin_jwt_token>`

**Query Parameters:**
- `search` (optional): Search by student or course
- `studentId` (optional): Filter by student
- `courseId` (optional): Filter by course
- `status` (optional): Filter by status (active, dropped, completed)

### POST /registrations
Register a student for a course.

**Headers:** `Authorization: Bearer <admin_jwt_token>`

**Request Body:**
```json
{
  "studentId": "student_object_id",
  "courseId": "course_object_id",
  "semester": "Fall 2024",
  "academicYear": "2024-2025"
}
```

### DELETE /registrations/:id
Deregister a student from a course.

**Headers:** `Authorization: Bearer <admin_jwt_token>`

### GET /registrations/student/:studentId
Get all registrations for a specific student.

**Headers:** `Authorization: Bearer <admin_jwt_token>`

### GET /registrations/course/:courseId
Get all registrations for a specific course.

**Headers:** `Authorization: Bearer <admin_jwt_token>`

## Result Management (Admin Only)

### GET /results
Get all results with optional filtering.

**Headers:** `Authorization: Bearer <admin_jwt_token>`

**Query Parameters:**
- `search` (optional): Search by student, course, or grade
- `studentId` (optional): Filter by student
- `courseId` (optional): Filter by course
- `grade` (optional): Filter by grade

### POST /results
Assign a grade to a student for a course.

**Headers:** `Authorization: Bearer <admin_jwt_token>`

**Request Body:**
```json
{
  "studentId": "student_object_id",
  "courseId": "course_object_id",
  "grade": "A",
  "semester": "Fall 2024",
  "academicYear": "2024-2025",
  "comments": "Excellent performance"
}
```

### PUT /results/:id
Update a result.

**Headers:** `Authorization: Bearer <admin_jwt_token>`

**Request Body:**
```json
{
  "grade": "A+",
  "comments": "Outstanding work"
}
```

### DELETE /results/:id
Delete a result.

**Headers:** `Authorization: Bearer <admin_jwt_token>`

### POST /results/bulk
Bulk assign grades.

**Headers:** `Authorization: Bearer <admin_jwt_token>`

**Request Body:**
```json
{
  "results": [
    {
      "studentId": "student_id_1",
      "courseId": "course_id_1",
      "grade": "A",
      "semester": "Fall 2024",
      "academicYear": "2024-2025"
    }
  ]
}
```

## Student Self-Service

### GET /students/me/courses
Get logged-in student's registered courses.

**Headers:** `Authorization: Bearer <student_jwt_token>`

**Response:**
```json
{
  "status": "success",
  "data": {
    "courses": [
      {
        "registrationId": "registration_id",
        "course": {
          "id": "course_id",
          "title": "Introduction to Programming",
          "code": "CS101",
          "credits": 3
        },
        "registrationDate": "2024-01-15T10:30:00.000Z",
        "status": "active"
      }
    ]
  }
}
```

### GET /students/me/results
Get logged-in student's results.

**Headers:** `Authorization: Bearer <student_jwt_token>`

**Response:**
```json
{
  "status": "success",
  "data": {
    "results": [
      {
        "id": "result_id",
        "course": {
          "title": "Introduction to Programming",
          "code": "CS101"
        },
        "grade": "A",
        "gradePoints": 4.0,
        "assignedAt": "2024-03-15T10:30:00.000Z"
      }
    ],
    "gpa": "3.75"
  }
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (invalid/missing token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (duplicate data) |
| 429 | Too Many Requests (rate limit) |
| 500 | Internal Server Error |

## Rate Limits

- **General API**: 100 requests per 15 minutes per IP
- **Authentication**: Same rate limit applies
- **Bulk Operations**: Same rate limit applies

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Validation Rules

### Course Validation
- **title**: 3-200 characters, required
- **code**: Format like CS101, MATH201, unique, required
- **credits**: 1-6, integer
- **maxEnrollment**: Minimum 1

### Student Validation
- **name**: 2-100 characters, required
- **studentId**: Format S12345, unique, required
- **email**: Valid email format, unique, required
- **password**: Minimum 6 characters, required

### Registration Validation
- **studentId**: Valid MongoDB ObjectId, required
- **courseId**: Valid MongoDB ObjectId, required
- **academicYear**: Format YYYY-YYYY

### Result Validation
- **grade**: One of A+, A, A-, B+, B, B-, C+, C, C-, D+, D, F
- **comments**: Maximum 500 characters

## Sample Data

The seeding script creates:

### Admins
- admin@university.edu / admin123
- coordinator@university.edu / admin123

### Students
- S12345 / student123 (John Smith)
- S12346 / student123 (Emily Johnson)
- S12347 / student123 (Michael Brown)
- ... (10 total students)

### Courses
- CS101 - Introduction to Programming
- CS201 - Data Structures and Algorithms
- CS301 - Database Management Systems
- CS401 - Web Development
- CS501 - Software Engineering
- MATH101 - Calculus I
- MATH201 - Linear Algebra
- PHYS101 - Physics I

### Sample Registrations and Results
- Random registrations for each student (2-5 courses)
- Random grades assigned to 70% of registrations
- Realistic grade distribution across all courses