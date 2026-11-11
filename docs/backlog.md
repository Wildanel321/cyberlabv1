# CyberGuard Lab - Engineering Backlog

## Sprint 1: Setup & Environment Validation
- [x] Environment discovery (Node.js, PHP, PostgreSQL, WSL2 Ubuntu)
- [x] Protocol documentation (GEMINI.md, LEARNINGS.gemini.md, SRS, PRD, ADD, TDD)
- [x] Backend foundation (Laravel 11 setup, PostgreSQL database, Sanctum, Reverb)
- [x] Database migrations, models, seeders, and factories

## Sprint 2: Authentication & Session Management
- [x] Instructor registration & login with Sanctum tokens
- [x] Session creation with random 6-character code, expiration, and participant limits
- [x] Session lifecycle management (Created, Active, Ended, Expired)
- [x] Participant join flow (token generation, SHA-256 hashing, rate limiting)
- [x] Participant heartbeat & reconnection mechanism

## Sprint 3: The 6 Functional Cybersecurity & AI Privacy Tools
- [x] Tool 1: Password Security Checker (entropy, crack time, common patterns, local remediation)
- [x] Tool 2: Phishing URL Analyzer (heuristic risk scoring, punycode, IP hostnames, TLD checks)
- [x] Tool 3: Personal Data Leak Simulator (PII detection for NIK, Email, Phone, Credit Card with redaction)
- [x] Tool 4: AI Privacy Risk Checker (Secret/key scanner, token highlighter, sanitized prompt exporter)
- [x] Tool 5: 2FA Simulator (Brute force vs MFA demonstration, expiring TOTP simulation)
- [x] Tool 6: Cloud Security Simulator (Misconfigured S3 bucket ACLs, attacker probe simulation, IAM policy fixes)

## Sprint 4: Real-time Telemetry & Instructor Analytics
- [x] Laravel Reverb WebSocket integration with private channels
- [x] Real-time event broadcasting (`participant.joined`, `participant.left`, `activity.completed`, `session.ended`)
- [x] Resilient polling fallback (3-second interval)
- [x] Instructor Analytics Dashboard with Recharts (live counts, risk distribution, tool usage breakdown, timeline)

## Sprint 5: UI/UX, Mobile Experience & End-to-End Testing
- [x] Polished Cybersecurity SaaS theme (Dark navy, slate, cyan, electric blue, green, amber, red)
- [x] Mobile-first responsive participant layout (touch-friendly, single column, bottom nav)
- [x] Desktop instructor layout (collapsible sidebar, projector-ready QR modal, live telemetry)
- [x] Automated tests: Unit tests, API integration tests, 30-participant load simulation, and security checks
- [x] Deployment guides (Local network IP mode & VPS production mode)
