# Technical Design Document (TDD) - CyberGuard Lab

## 1. Database Schema Specifications

### `users`
- `id` (UUID, Primary Key)
- `name` (VARCHAR 255)
- `email` (VARCHAR 255, Unique)
- `password` (VARCHAR 255, Hashed)
- `created_at`, `updated_at` (TIMESTAMPTZ)

### `sessions`
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key referencing users.id, Indexed)
- `code` (VARCHAR(6), Unique, Indexed)
- `title` (VARCHAR 255)
- `status` (ENUM: `created`, `active`, `ended`, `expired`, Indexed)
- `max_participants` (INTEGER, Default 50)
- `expires_at` (TIMESTAMPTZ, Indexed)
- `created_at`, `updated_at` (TIMESTAMPTZ)

### `participants`
- `id` (UUID, Primary Key)
- `session_id` (UUID, Foreign Key referencing sessions.id, Cascading Delete, Indexed)
- `nickname` (VARCHAR 64)
- `token_hash` (CHAR(64), SHA-256 hash of random bearer token, Indexed)
- `status` (ENUM: `active`, `idle`, `disconnected`, Indexed)
- `last_seen_at` (TIMESTAMPTZ, Indexed)
- `created_at`, `updated_at` (TIMESTAMPTZ)

### `activities`
- `id` (UUID, Primary Key)
- `session_id` (UUID, Foreign Key referencing sessions.id, Indexed)
- `participant_id` (UUID, Foreign Key referencing participants.id, Indexed)
- `tool_name` (VARCHAR 64, e.g. `password_checker`, `phishing_analyzer`, `data_leak`, `ai_privacy`, `two_factor`, `cloud_security`)
- `risk_tier` (ENUM: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`, Indexed)
- `score` (INTEGER, 0 to 100)
- `duration_seconds` (INTEGER)
- `metadata` (JSONB / JSON: Non-sensitive stats only)
- `created_at`, `updated_at` (TIMESTAMPTZ)

### `session_events`
- `id` (UUID, Primary Key)
- `session_id` (UUID, Foreign Key referencing sessions.id, Indexed)
- `event_type` (VARCHAR 64, e.g. `participant.joined`, `participant.left`, `activity.completed`)
- `payload` (JSONB / JSON: Aggregate data only)
- `created_at` (TIMESTAMPTZ)

## 2. API Endpoints (Version 1 - `/api/v1`)

### Authentication & Instructor Management
- `POST /api/v1/auth/register` - Instructor registration
- `POST /api/v1/auth/login` - Instructor login (returns Sanctum token)
- `POST /api/v1/auth/logout` - Revoke token
- `GET  /api/v1/auth/me` - Get current instructor profile

### Session Orchestration (Instructor)
- `GET    /api/v1/instructor/sessions` - List instructor's sessions
- `POST   /api/v1/instructor/sessions` - Create new session (generates 6-char code)
- `GET    /api/v1/instructor/sessions/{id}` - Get session detail, join code, QR data
- `POST   /api/v1/instructor/sessions/{id}/end` - End session (broadcasts session.ended)
- `GET    /api/v1/instructor/sessions/{id}/analytics` - Aggregated live metrics & charts

### Participant Gateway
- `POST /api/v1/participant/join` - Join session via code + nickname. Returns `participant_token`, `participant_id`, `session_info`.
- `POST /api/v1/participant/heartbeat` - Send heartbeat to maintain `active` status.
- `POST /api/v1/participant/leave` - Graceful leave.
- `POST /api/v1/participant/activities` - Submit completed tool activity telemetry (No raw secrets).
- `GET  /api/v1/participant/history` - Get personal activity history for current session.

