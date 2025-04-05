# Fr. Youhanna Makin API Documentation

This document outlines the API endpoints available for the Fr. Youhanna Makin appointment booking system's mobile application.

## Authentication

Most API endpoints require authentication using a JWT token. To authenticate:

1. Obtain a token via the `/api/v1/auth/sign_in` endpoint.
2. Include the token in all subsequent requests in the `Authorization` header:
   ```
   Authorization: Bearer <your_token>
   ```

## API Endpoints

### Authentication

#### Sign In

```
POST /api/v1/auth/sign_in
```

Request body:

```json
{
  "user": {
    "email": "admin@example.com",
    "password": "password"
  }
}
```

Response:

```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "name": "Admin User"
  }
}
```

### Availability Slots

#### List Available Slots

```
GET /api/v1/availability_slots
```

Query parameters:

- `start_date`: Filter slots starting from this date (format: YYYY-MM-DD)
- `end_date`: Filter slots ending at this date (format: YYYY-MM-DD)

Response:

```json
{
  "availability_slots": [
    {
      "id": 1,
      "start_time": "2023-04-15T09:00:00Z",
      "end_time": "2023-04-15T10:00:00Z",
      "booked": false
    },
    {
      "id": 2,
      "start_time": "2023-04-15T10:00:00Z",
      "end_time": "2023-04-15T11:00:00Z",
      "booked": true
    }
  ]
}
```

#### Create Availability Slot (Admin Only)

```
POST /api/v1/availability_slots
```

Request body:

```json
{
  "availability_slot": {
    "start_time": "2023-04-20T14:00:00Z",
    "end_time": "2023-04-20T15:00:00Z"
  }
}
```

Response:

```json
{
  "id": 3,
  "start_time": "2023-04-20T14:00:00Z",
  "end_time": "2023-04-20T15:00:00Z",
  "booked": false
}
```

#### Delete Availability Slot (Admin Only)

```
DELETE /api/v1/availability_slots/:id
```

Response:

```
Status: 204 No Content
```

### Appointments

#### Create an Appointment

```
POST /api/v1/appointments
```

Request body:

```json
{
  "appointment": {
    "availability_slot_id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "notes": "I would like to discuss my spiritual journey."
  }
}
```

Response:

```json
{
  "id": 1,
  "status": "pending",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "notes": "I would like to discuss my spiritual journey.",
  "slot": {
    "id": 1,
    "start_time": "2023-04-15T09:00:00Z",
    "end_time": "2023-04-15T10:00:00Z"
  }
}
```

#### List Appointments (Admin Only)

```
GET /api/v1/appointments
```

Query parameters:

- `status`: Filter by status (pending, confirmed, cancelled)
- `start_date`: Filter appointments from this date (format: YYYY-MM-DD)
- `end_date`: Filter appointments until this date (format: YYYY-MM-DD)

Response:

```json
{
  "appointments": [
    {
      "id": 1,
      "status": "pending",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "notes": "I would like to discuss my spiritual journey.",
      "slot": {
        "id": 1,
        "start_time": "2023-04-15T09:00:00Z",
        "end_time": "2023-04-15T10:00:00Z"
      }
    }
  ],
  "meta": {
    "page": 1,
    "total_pages": 1,
    "total_count": 1
  }
}
```

#### Get Appointment Details (Admin Only)

```
GET /api/v1/appointments/:id
```

Response:

```json
{
  "id": 1,
  "status": "pending",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "notes": "I would like to discuss my spiritual journey.",
  "created_at": "2023-04-10T12:34:56Z",
  "slot": {
    "id": 1,
    "start_time": "2023-04-15T09:00:00Z",
    "end_time": "2023-04-15T10:00:00Z"
  }
}
```

#### Update Appointment Status (Admin Only)

```
PATCH /api/v1/appointments/:id
```

Request body:

```json
{
  "appointment": {
    "status": "confirmed"
  }
}
```

Response:

```json
{
  "id": 1,
  "status": "confirmed",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "notes": "I would like to discuss my spiritual journey.",
  "slot": {
    "id": 1,
    "start_time": "2023-04-15T09:00:00Z",
    "end_time": "2023-04-15T10:00:00Z"
  }
}
```

## Error Handling

The API uses conventional HTTP response codes to indicate success or failure of a request.

- 200: Success
- 201: Created
- 204: No Content
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 422: Unprocessable Entity
- 500: Internal Server Error

Error response format:

```json
{
  "errors": {
    "field_name": ["error message"]
  }
}
```

## Rate Limiting

API requests are limited to 100 requests per IP address per hour. The following headers are included in the API response:

- `X-RateLimit-Limit`: Number of max requests allowed in the window
- `X-RateLimit-Remaining`: Number of requests left in the current window
- `X-RateLimit-Reset`: Time when the window resets (in Unix time)
