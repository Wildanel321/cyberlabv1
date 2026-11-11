# CyberGuard Lab - API Documentation (Version 1)

**Base URL**: `/api/v1`

---

## 1. Instructor Authentication

### `POST /api/v1/auth/register`
Create a new instructor account.
- **Request Body**:
  ```json
  {
    "name": "Prof. Alex Vance",
    "email": "instructor@cyberlab.edu",
    "password": "DefenseSecret2024!",
    "password_confirmation": "DefenseSecret2024!"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "message": "Instructor registered successfully.",
    "user": {
      "id": 1,
      "name": "Prof. Alex Vance",
      "email": "instructor@cyberlab.edu"
    },
    "token": "1|AbCdEf1234567890..."
  }
  ```

### `POST /api/v1/auth/login`
Authenticate instructor and retrieve Sanctum bearer token.
- **Request Body**:
  ```json
  {
    "email": "instructor@cyberlab.edu",
    "password": "DefenseSecret2024!"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "message": "Login successful.",
    "user": { "id": 1, "name": "Prof. Alex Vance", "email": "instructor@cyberlab.edu" },
    "token": "1|AbCdEf1234567890..."
  }
  ```

### `GET /api/v1/auth/me`
Retrieve authenticated instructor profile.
- **Headers**: `Authorization: Bearer <token>`
- **Response (200 OK)**:
  ```json
  {
    "user": { "id": 1, "name": "Prof. Alex Vance", "email": "instructor@cyberlab.edu" }
  }
  ```

---

## 2. Session Management (Instructor)

### `GET /api/v1/instructor/sessions`
List all training sessions created by current instructor.
- **Headers**: `Authorization: Bearer <token>`
- **Response (200 OK)**: Array of session objects with participant counts.

### `POST /api/v1/instructor/sessions`
Create a new training session room.
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "title": "Interactive Cybersecurity & AI Privacy Lab",
    "max_participants": 50,
    "expires_in_minutes": 120
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "message": "Training session created successfully.",
    "data": {
      "id": "uuid",
      "code": "CYB101",
      "title": "Interactive Cybersecurity & AI Privacy Lab",
      "status": "active",
      "max_participants": 50,
      "expires_at": "2026-11-11T12:00:00.000000Z"
    }
  }
  ```

### `POST /api/v1/instructor/sessions/{id}/end`
Gracefully terminate an active session. Broadcasts `session.ended` to participants.
- **Headers**: `Authorization: Bearer <token>`

### `GET /api/v1/instructor/sessions/{id}/analytics`
Retrieve live aggregated telemetry metrics.
- **Headers**: `Authorization: Bearer <token>`
- **Response (200 OK)**:
  ```json
  {
    "data": {
      "session_id": "uuid",
      "session_code": "CYB101",
      "session_title": "Interactive Cybersecurity & AI Privacy Lab",
      "session_status": "active",
      "total_participants": 30,
      "active_participants": 28,
      "total_activities_completed": 85,
      "average_security_score": 84,
      "tool_usage": [
        { "tool_name": "password_checker", "display_name": "Password Checker", "count": 28, "avg_score": 86 }
      ],
      "risk_distribution": [
        { "tier": "LOW", "count": 45, "percentage": 53 },
        { "tier": "MEDIUM", "count": 25, "percentage": 29 },
        { "tier": "HIGH", "count": 12, "percentage": 14 },
        { "tier": "CRITICAL", "count": 3, "percentage": 4 }
      ],
      "recent_activities": [
        {
          "id": "uuid",
          "tool_name": "Password Checker",
          "nickname": "CyberHero",
          "risk_tier": "LOW",
          "score": 95,
          "created_at": "2026-11-11T10:30:00.000000Z"
        }
      ]
    }
  }
  ```

---

## 3. Participant Gateway

### `POST /api/v1/participant/join`
Join a room using the 6-character code and nickname.
- **Request Body**:
  ```json
  {
    "code": "CYB101",
    "nickname": "StudentA"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "message": "Joined session successfully.",
    "data": {
      "participant_id": "uuid",
      "participant_token": "64_hex_character_token",
      "nickname": "StudentA",
      "session": { "id": "uuid", "code": "CYB101", "title": "Lab", "status": "active" }
    }
  }
  ```

### `POST /api/v1/participant/heartbeat`
Send periodic ping (every 15s) to maintain active status.
- **Headers**: `X-Participant-Token: <participant_token>`
- **Response (200 OK)**: `{"status": "acknowledged"}`

### `POST /api/v1/participant/activities`
Submit non-sensitive tool completion telemetry.
- **Headers**: `X-Participant-Token: <participant_token>`
- **Request Body**:
  ```json
  {
    "tool_name": "password_checker",
    "risk_tier": "LOW",
    "score": 90,
    "duration_seconds": 12,
    "metadata": {
      "entropy": 74
    }
  }
  ```
- **Response (201 Created)**: Saved activity model. Zero sensitive inputs stored.

