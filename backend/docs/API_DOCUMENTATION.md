# API Documentation

## Base URL
```
http://localhost:5000/api/v1
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### Register User
```
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "role": "employee",
  "firstName": "John",
  "lastName": "Doe",
  "department": "IT",
  "position": "Developer"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "userId",
      "email": "user@example.com",
      "role": "employee"
    },
    "token": "jwtToken"
  }
}
```

### Login
```
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "userId",
      "email": "user@example.com",
      "role": "employee"
    },
    "token": "jwtToken"
  }
}
```

### Get Current User
```
GET /auth/me
```

**Headers:** Authorization required

**Response (200):**
```json
{
  "success": true,
  "message": "User fetched successfully",
  "data": {
    "user": {...},
    "employee": {...}
  }
}
```

### Change Password
```
POST /auth/change-password
```

**Headers:** Authorization required

**Request Body:**
```json
{
  "currentPassword": "oldPassword",
  "newPassword": "newPassword"
}
```

---

## Employee Endpoints

### Get Profile
```
GET /employees/profile
```

**Headers:** Authorization required

### Update Profile
```
PUT /employees/profile
```

**Headers:** Authorization required

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "phone": "+1-555-0101",
  "department": "Marketing",
  "position": "Manager",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "zipCode": "10001"
  }
}
```

### Get Dashboard
```
GET /employees/dashboard
```

**Headers:** Authorization required

### Get Rewards
```
GET /employees/rewards?page=1&limit=10
```

**Headers:** Authorization required

### Get All Employees
```
GET /employees/all?page=1&limit=10&department=IT&status=active&search=john
```

**Headers:** Authorization required (Admin/HR only)

---

## Attendance Endpoints

### Mark Attendance
```
POST /attendance/mark
```

**Headers:** Authorization required

**Request Body:**
```json
{
  "employeeId": "empId",
  "date": "2024-01-15",
  "status": "present",
  "notes": "Regular attendance"
}
```

### Check In
```
POST /attendance/check-in
```

**Headers:** Authorization required

**Request Body:**
```json
{
  "employeeId": "empId"
}
```

### Check Out
```
POST /attendance/check-out
```

**Headers:** Authorization required

**Request Body:**
```json
{
  "employeeId": "empId"
}
```

### Get Attendance History
```
GET /attendance/history/:employeeId?page=1&limit=10&startDate=2024-01-01&endDate=2024-01-31
```

**Headers:** Authorization required

### Get Monthly Report
```
GET /attendance/report/:employeeId/:month/:year
```

### Get Analytics
```
GET /attendance/analytics/:employeeId?months=3
```

---

## Performance Endpoints

### Add Performance Review
```
POST /performance/add
```

**Headers:** Authorization required (Admin/HR only)

**Request Body:**
```json
{
  "employeeId": "empId",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "taskCompletionRate": 85,
  "productivityScore": 4.5,
  "teamCollaborationScore": 4.0,
  "monthlyRating": 4,
  "managerFeedback": "Excellent work",
  "strengths": ["Leadership", "Communication"],
  "improvementAreas": ["Time management"],
  "goals": [{"goal": "Complete project X", "status": "pending"}]
}
```

### Get Performance History
```
GET /performance/history/:employeeId?page=1&limit=10
```

### Get Top Performers
```
GET /performance/top-performers?limit=10
```

### Get Department Performance
```
GET /performance/department/:departmentName
```

---

## Reward Endpoints

### Assign Reward
```
POST /rewards/assign
```

**Headers:** Authorization required (Admin/HR only)

**Request Body:**
```json
{
  "employeeId": "empId",
  "rewardType": "bonus",
  "points": 100,
  "bonus": 5000,
  "badge": "high_productivity",
  "reason": "Outstanding performance",
  "criteria": ["High productivity", "Team collaboration"],
  "month": "2024-01"
}
```

### Approve Reward
```
PUT /rewards/approve/:rewardId
```

**Headers:** Authorization required (Admin only)

**Request Body:**
```json
{
  "approvalStatus": "approved"
}
```

### Get Rewards
```
GET /rewards/employee/:employeeId?page=1&limit=10&month=2024-01&status=approved
```

### Get Leaderboard
```
GET /rewards/leaderboard?month=2024-01&limit=10
```

### Get Bonus History
```
GET /rewards/bonus-history/:employeeId?page=1&limit=10
```

---

## Feedback Endpoints

### Submit Feedback
```
POST /feedback/submit
```

**Headers:** Authorization required

**Request Body:**
```json
{
  "receiverId": "empId",
  "feedbackType": "peer_review",
  "rating": 4,
  "comment": "Great work on the project",
  "category": "collaboration",
  "isAnonymous": false,
  "actionItems": [
    {
      "item": "Improve documentation",
      "priority": "high",
      "status": "pending"
    }
  ]
}
```

### Get Received Feedback
```
GET /feedback/received/:employeeId?page=1&limit=10&feedbackType=peer_review
```

### Get Given Feedback
```
GET /feedback/given/:employeeId?page=1&limit=10
```

### Get Feedback Analytics
```
GET /feedback/analytics/:employeeId
```

### Update Feedback
```
PUT /feedback/:feedbackId
```

**Request Body:**
```json
{
  "isResolved": true,
  "actionItems": [...]
}
```

---

## Dashboard Endpoints

### Admin Dashboard
```
GET /dashboard/admin
```

**Headers:** Authorization required (Admin/HR only)

### Monthly Trends
```
GET /dashboard/trends?months=6
```

### Department Analytics
```
GET /dashboard/departments
```

### Attendance Analytics
```
GET /dashboard/attendance?month=2024-01
```

### Reward Analytics
```
GET /dashboard/rewards?month=2024-01
```

---

## AI Endpoints

### Get AI Recommendations
```
GET /ai/recommendations/:employeeId
```

**Headers:** Authorization required

**Response:**
```json
{
  "success": true,
  "data": {
    "recommendations": {
      "assessment": "...",
      "improvements": [...],
      "rewardEligibility": "...",
      "alerts": [...],
      "nextSteps": "..."
    }
  }
}
```

### Get Burnout Analysis
```
GET /ai/burnout-analysis
```

**Headers:** Authorization required (Admin/HR only)

### Get Reward Fairness Analysis
```
GET /ai/fairness-analysis?month=2024-01
```

**Headers:** Authorization required (Admin/HR only)

---

## Error Responses

### 400 - Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {"field": "email", "message": "Invalid email"}
  ]
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

### 403 - Forbidden
```json
{
  "success": false,
  "message": "Access denied - insufficient permissions"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 - Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

---

## Pagination

All list endpoints support pagination:

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

## Rate Limiting

API is rate limited per IP:
- 100 requests per 15 minutes for general endpoints
- 10 requests per 15 minutes for auth endpoints

---

## Webhook Events

Coming soon...

---

For more help, visit `/docs` or contact the development team.
