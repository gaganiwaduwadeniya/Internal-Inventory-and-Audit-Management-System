# API Documentation - Equipment Management System

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer {token}
```

---

## Endpoints

### 1. User Registration
**Endpoint:** `POST /auth/register`

**Description:** Register a new user account

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "Employee"  // Optional: "Employee" or "Admin"
}
```

**Responses:**
- **201 Created:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "Employee"
  }
}
```

- **400 Bad Request:**
```json
{
  "success": false,
  "message": "User already exists"
}
```

---

### 2. User Login
**Endpoint:** `POST /auth/login`

**Description:** Authenticate and get JWT token

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Responses:**
- **200 OK:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "Employee"
  }
}
```

- **401 Unauthorized:**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

---

### 3. Get Current User
**Endpoint:** `GET /auth/me`

**Description:** Get authenticated user's profile

**Headers:** Requires authentication

**Responses:**
- **200 OK:**
```json
{
  "success": true,
  "user": {
    "_id": "user_id",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "Employee",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### 4. Create Equipment
**Endpoint:** `POST /equipment`

**Description:** Create a new equipment record (Employee creates for self)

**Headers:** Requires authentication

**Request Body:**
```json
{
  "deviceName": "Dell Laptop",
  "serialNumber": "SN123456789",
  "assignedDate": "2024-01-15"
}
```

**Responses:**
- **201 Created:**
```json
{
  "success": true,
  "data": {
    "_id": "equipment_id",
    "deviceName": "Dell Laptop",
    "serialNumber": "SN123456789",
    "assignedDate": "2024-01-15T00:00:00Z",
    "status": "Active",
    "assignedTo": "user_id",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

- **400 Bad Request:**
```json
{
  "success": false,
  "message": "Serial number already exists"
}
```

---

### 5. Get Equipment
**Endpoint:** `GET /equipment`

**Description:** Get equipment records (Admin sees all, Employee sees own)

**Headers:** Requires authentication

**Query Parameters:** None

**Responses:**
- **200 OK:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "equipment_id",
      "deviceName": "Dell Laptop",
      "serialNumber": "SN123456789",
      "assignedDate": "2024-01-15T00:00:00Z",
      "status": "Active",
      "assignedTo": {
        "_id": "user_id",
        "username": "john_doe",
        "email": "john@example.com",
        "role": "Employee"
      },
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### 6. Get Equipment by ID
**Endpoint:** `GET /equipment/:id`

**Description:** Get a specific equipment record

**Headers:** Requires authentication

**URL Parameters:**
- `id` (required): Equipment ID

**Responses:**
- **200 OK:**
```json
{
  "success": true,
  "data": {
    "_id": "equipment_id",
    "deviceName": "Dell Laptop",
    "serialNumber": "SN123456789",
    "assignedDate": "2024-01-15T00:00:00Z",
    "status": "Active",
    "assignedTo": {
      "_id": "user_id",
      "username": "john_doe",
      "email": "john@example.com",
      "role": "Employee"
    },
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

- **404 Not Found:**
```json
{
  "success": false,
  "message": "Equipment not found"
}
```

- **403 Forbidden:**
```json
{
  "success": false,
  "message": "Not authorized to access this resource"
}
```

---

### 7. Update Equipment Status
**Endpoint:** `PUT /equipment/:id`

**Description:** Update equipment status (Admin only)

**Headers:** Requires authentication + Admin role

**URL Parameters:**
- `id` (required): Equipment ID

**Request Body:**
```json
{
  "status": "Damaged"  // "Active", "Damaged", or "Retired"
}
```

**Responses:**
- **200 OK:**
```json
{
  "success": true,
  "data": {
    "_id": "equipment_id",
    "deviceName": "Dell Laptop",
    "serialNumber": "SN123456789",
    "assignedDate": "2024-01-15T00:00:00Z",
    "status": "Damaged",
    "assignedTo": "user_id",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T12:30:00Z"
  }
}
```

- **403 Forbidden:**
```json
{
  "success": false,
  "message": "User with role 'Employee' is not authorized to access this route"
}
```

---

### 8. Delete Equipment
**Endpoint:** `DELETE /equipment/:id`

**Description:** Delete an equipment record (Admin only)

**Headers:** Requires authentication + Admin role

**URL Parameters:**
- `id` (required): Equipment ID

**Responses:**
- **200 OK:**
```json
{
  "success": true,
  "message": "Equipment deleted successfully"
}
```

- **404 Not Found:**
```json
{
  "success": false,
  "message": "Equipment not found"
}
```

- **403 Forbidden:**
```json
{
  "success": false,
  "message": "User with role 'Employee' is not authorized to access this route"
}
```

---

## Common Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "User with role 'Employee' is not authorized to access this route"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## HTTP Status Codes

- `200 OK` - Successful GET, PUT, DELETE
- `201 Created` - Successful POST
- `400 Bad Request` - Invalid input or data validation failure
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - Authenticated but insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Create Equipment
```bash
curl -X POST http://localhost:5000/api/equipment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "deviceName": "Test Device",
    "serialNumber": "TEST123",
    "assignedDate": "2024-01-15"
  }'
```

---

## Authentication Flow

1. **Register/Login** - Get JWT token
2. **Store token** - Save in localStorage or session
3. **Include in requests** - Add JWT to Authorization header
4. **Token expiration** - Tokens expire in 24 hours
5. **Re-login** - Get new token after expiration
