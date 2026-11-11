# Software Requirements Specification (SRS) - CyberGuard Lab

## 1. Introduction
### 1.1 Purpose
CyberGuard Lab is an interactive educational cybersecurity and AI privacy platform enabling real-time workshops and training sessions without friction.

### 1.2 Scope
- **Instructor Module**: Secure authentication (Sanctum), Session lifecycle management (Create, Open, Close, Terminate), Dynamic Join QR code & short code, Real-time telemetry dashboard (Recharts, WebSockets).
- **Participant Module**: Zero-registration friction onboarding via session code/QR, Anonymous tokenized session, 6 comprehensive interactive security tools.
- **Privacy Architecture**: Zero-PII transmission. Raw passwords, synthetic NIKs, email text, API keys, and sensitive prompts never leave the participant's client browser. Only anonymized telemetry (tool name, completion time, score, risk severity tier) is recorded in PostgreSQL.

## 2. Functional Requirements
- **FR-1**: Instructor authentication with email, password, and secure session tokens.
- **FR-2**: Session creation with configurable participant capacity, expiration timeout, and random 6-character alphanumeric code.
- **FR-3**: Participant join flow with heartbeat pinging every 15s and disconnect detection.
- **FR-4**: Six functional client-side security analyzers:
  1. Password Strength & Entropy Analyzer.
  2. Phishing URL & Threat Heuristics Analyzer.
  3. Personal Data Leak & Redaction Simulator.
  4. AI Privacy & Secret Leakage Checker.
  5. Interactive 2FA / Brute Force Attack Simulator.
  6. Cloud S3 Misconfiguration & Role Escalation Sandbox.
- **FR-5**: Real-time event broadcasting over Laravel Reverb with automatic HTTP long-polling fallback.
- **FR-6**: Anonymized activity logging and aggregate statistics rendering.

## 3. Non-Functional Requirements
- **NFR-Security**: OWASP Top 10 compliance, CSRF/XSS protection, CSP headers, rate-limiting on join and auth endpoints.
- **NFR-Performance**: Sub-100ms API response latency, minimal client footprint, supporting 30+ concurrent participants seamlessly.
- **NFR-Usability**: Responsive layout for mobile (participants) and desktop (instructors/projectors), accessible color contrast, dark cybersecurity theme.

