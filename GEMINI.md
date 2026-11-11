# CyberGuard Lab - Project Context & Directives

## 1. Project Purpose
CyberGuard Lab is an enterprise-grade, interactive, real-time cybersecurity and AI privacy education platform designed for training sessions, university classes, enterprise security awareness, and interactive workshops.

In CyberGuard Lab:
- An **Instructor** logs in, creates a security training session, displays a join code & QR code on a projector/screen, monitors live participant metrics in real-time without seeing sensitive inputs, and terminates/manages sessions.
- **Participants** join seamlessly via mobile phone or laptop without any registration (using session code or scanning QR code, picking a nickname).
- Each participant receives an isolated dashboard with **6 functional cybersecurity and AI privacy tools**:
  1. **Password Security Checker**: Client-side entropy calculation, pattern analysis, crack-time estimation, and remediation recommendations. Zero password transmission.
  2. **Phishing URL Analyzer**: Deep URL parsing, protocol/HTTPS inspection, punycode/IDN detection, IP hostname recognition, URL-shortener analysis, suspicious TLD and entropy checks. Safe inspection without crawling.
  3. **Personal Data Leak Simulator**: Client-side detection of PII (Emails, Indonesian NIK, Phone numbers, Credit cards, physical addresses) with real-time redaction/masking preview and breach risk impact report.
  4. **AI Privacy Risk Checker**: Analyzes AI system prompts for sensitive secrets (API keys, JWTs, private keys, passwords, PII, company confidential markers), highlighting high-risk entities with sanitized prompt generation.
  5. **2FA Simulator**: Interactive credential attack vs MFA simulator demonstrating credential stuffing/brute force vulnerability compared to TOTP/OTP verification with timers, attempts, and defense-in-depth comparison.
  6. **Cloud Security Simulator**: Interactive AWS S3/Azure Blob misconfiguration sandbox with public/private bucket ACLs, IAM roles, permissive policies, simulated data exposure, and hardening remediation steps.
- **Real-Time Instructor Analytics**: Powered by Laravel Reverb (WebSocket) with polling fallback, streaming aggregate event counts, active participants, tool usage distribution, risk exposure graphs (Recharts), and completion timelines without logging or transmitting sensitive user inputs.

## 2. Architecture Overview
- **Frontend**: React 18+ / TypeScript / Vite / Tailwind CSS / shadcn/ui components / Recharts / Lucide icons / qrcode.react.
- **Backend**: Laravel 11 REST API / Laravel Sanctum (instructor auth) / Laravel Reverb (WebSockets) / PostgreSQL (with SQLite compatibility fallback for zero-dependency offline runs).
- **Service Layer**: Decoupled domain services (`SessionService`, `ParticipantService`, `AnalyticsService`, `ActivityService`).
- **Security Boundaries**: Hash-stored participant tokens (`sha256`), UUID primary keys, rate limiting, strict CORS allowlisting, CSP security headers, zero-PII logging policy.

## 3. Directory Layout
```
cyberlab/
├── backend/                  # Laravel 11 API Backend
│   ├── app/
│   │   ├── Http/Controllers/Api/v1/
│   │   ├── Models/
│   │   ├── Services/
│   │   └── Events/
│   ├── database/migrations/
│   ├── routes/api.php
│   └── tests/
├── frontend/                 # React + Vite + TypeScript Frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── lib/
└── docs/                     # Architecture & Design Docs
```

