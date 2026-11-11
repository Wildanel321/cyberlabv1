# CyberGuard Lab - Engineering Backlog

## Sprint 1: Setup & Environment Validation
- [x] Environment discovery (Node.js, PHP, PostgreSQL, WSL2 Ubuntu)
- [x] Protocol documentation (GEMINI.md, LEARNINGS.gemini.md, SRS, PRD, ADD, TDD)
- [ ] Backend foundation (Laravel 11 setup, PostgreSQL database, Sanctum, Reverb)
- [ ] Database migrations, models, seeders, and factories

## Sprint 2: Authentication & Session Management
- [ ] Instructor registration & login with Sanctum tokens
- [ ] Session creation with random 6-character code, expiration, and participant limits
- [ ] Session lifecycle management (Created, Active, Ended, Expired)
- [ ] Participant join flow (token generation, SHA-256 hashing, rate limiting)
- [ ] Participant heartbeat & reconnection mechanism

## Sprint 3: The 6 Functional Cybersecurity & AI Privacy Tools
- [ ] Tool 1: Password Security Checker (entropy, crack time, common patterns, local remediation)
- [ ] Tool 2: Phishing URL Analyzer (heuristic risk scoring, punycode, IP hostnames, TLD checks)
- [ ] Tool 3: Personal Data Leak Simulator (PII detection for NIK, Email, Phone, Credit Card with redaction)
- [ ] Tool 4: AI Privacy Risk Checker (Secret/key scanner, token highlighter, sanitized prompt exporter)
- [ ] Tool 5: 2FA Simulator (Brute force vs MFA demonstration, expiring TOTP simulation)
- [ ] Tool 6: Cloud Security Simulator (Misconfigured S3 bucket ACLs, attacker probe simulation, IAM policy fixes)

## Sprint 4: Real-time Telemetry & Instructor Analytics
- [ ] Laravel Reverb WebSocket integration with private channels
- [ ] Real-time event broadcasting (`participant.joined`, `participant.left`, `activity.completed`, `session.ended`)
- [ ] Resilient polling fallback (3-second interval)
- [ ] Instructor Analytics Dashboard with Recharts (live counts, risk distribution, tool usage breakdown, timeline)

## Sprint 5: UI/UX, Mobile Experience & End-to-End Testing
- [ ] Polished Cybersecurity SaaS theme (Dark navy, slate, cyan, electric blue, green, amber, red)
- [ ] Mobile-first responsive participant layout (touch-friendly, single column, bottom nav)
- [ ] Desktop instructor layout (collapsible sidebar, projector-ready QR modal, live telemetry)
- [ ] Automated tests: Unit tests, API integration tests, 30-participant load simulation, and security checks
- [ ] Deployment guides (Local network IP mode & VPS production mode)
