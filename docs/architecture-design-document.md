# Architecture Design Document (ADD) - CyberGuard Lab

## 1. System Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                                Client Layer                                       |
|  +------------------------------------+   +------------------------------------+  |
|  |     Instructor Web Application     |   |    Participant Mobile/Desktop App  |  |
|  |  (React 18 + Vite + TS + Tailwind) |   | (React 18 + Vite + TS + Tailwind)  |  |
|  |  - Auth & Session Orchestration   |   | - Tokenized Local Auth             |  |
|  |  - Real-time Recharts Analytics   |   | - 6 Functional Security Simulators |  |
|  |  - QR Code Display                 |   | - Client-side PII Sanitization     |  |
|  +-----------------+------------------+   +-----------------+------------------+  |
+--------------------|----------------------------------------|---------------------+
                     | REST API (JSON)                        | REST API (JSON)
                     | WebSocket (Reverb)                     | Heartbeat & Telemetry
                     v                                        v
+-----------------------------------------------------------------------------------+
|                                Backend Layer                                      |
|  +-----------------------------------------------------------------------------+  |
|  |                          Laravel 11 REST API                                |  |
|  |  - Routing: /api/v1/auth, /api/v1/sessions, /api/v1/participants, etc.     |  |
|  |  - Middleware: Sanctum, ParticipantTokenVerify, RateLimiter, SecurityHeaders|  |
|  |  - Services: SessionService, ParticipantService, AnalyticsService          |  |
|  |  - WebSocket Server: Laravel Reverb (port 8080)                            |  |
|  +------------------------------------+----------------------------------------+  |
+---------------------------------------|-------------------------------------------+
                                        |
                                        v
+-----------------------------------------------------------------------------------+
|                                Database Layer                                     |
|  +-----------------------------------------------------------------------------+  |
|  |                      PostgreSQL (or SQLite fallback)                        |  |
|  |  - users: id, name, email, password_hash, created_at                        |  |
|  |  - sessions: id, instructor_id, code, title, max_p, status, expires_at      |  |
|  |  - participants: id, session_id, nickname, token_hash, status, last_seen_at |  |
|  |  - activities: id, participant_id, session_id, tool_name, risk_tier, score |  |
|  |  - session_events: id, session_id, event_type, metadata, created_at        |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
```

## 2. Zero-Trust & Zero-PII Ingestion Policy
- None of the user inputs from the 6 tools (plain passwords, personal phone numbers, synthetic NIKs, API keys, system prompts) are ever posted to the server.
- The client-side security engines compute the scores, entropy, risk levels, and detected categories locally.
- The client sends solely the aggregate telemetry:
  `{ tool_name: "password_checker", score: 85, risk_tier: "LOW", duration_seconds: 12, metadata: { entropy_bits: 64, rule_checks_passed: 4 } }`
- Participant tokens are hashed using SHA-256 before storage in the database.
- Instructors are strictly scoped: An instructor can only query and stream sessions created by their own authenticated user ID.

## 3. Realtime & Fallback Architecture
- Primary: Laravel Reverb WebSockets broadcasting on private channel `private-session.{sessionId}`.
- Authorization: HTTP POST `/broadcasting/auth` verifies instructor Sanctum bearer token or participant session token.
- Secondary: Automatic HTTP polling fallback every 3 seconds if WebSocket connection encounters network partition or firewall blockage.
