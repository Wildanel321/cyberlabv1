# CyberGuard Lab - Interactive Cybersecurity & AI Privacy Platform

CyberGuard Lab is a production-ready, full-stack, real-time cybersecurity and AI privacy education platform designed for live interactive classrooms, training workshops, and university lectures.

## Key Highlights
- **Zero-Friction Participant Access**: Participants scan a dynamic QR code or enter a 6-character session code from mobile phones or laptops. No account registration needed.
- **Strict Zero-PII Ingestion**: High-security client-side execution. Sensitive inputs (raw passwords, synthetic NIKs, email text, API keys, system prompts) are analyzed strictly in the client's browser and never leave the client. Only anonymized metrics (score, entropy, risk tier, duration) are saved.
- **Real-Time Instructor Analytics**: Live telemetry powered by Laravel Reverb (WebSockets) with automatic HTTP long-polling fallback. Renders active participants, tool adoption, risk tier distributions, and activity feeds with Recharts.
- **6 Production-Ready Simulators**:
  1. **Password Security Checker**: Entropy estimation, zxcvbn-style pattern checks, GPU crack-time estimation, and actionable remediation.
  2. **Phishing URL Analyzer**: Heuristic analysis, punycode/IDN detection, IP hostname detection, risky TLDs, and structural decomposition.
  3. **Personal Data Leak Simulator**: Detection of Indonesian NIK (16-digit regex & checksum verification), Emails, Phone numbers, and Credit Cards with real-time redaction/masking.
  4. **AI Privacy Risk Checker**: High-sensitivity scanning of AI system prompts for OpenAI keys, AWS access keys, GitHub tokens, passwords, and confidential markers with safe sanitized preview.
  5. **2FA Simulator**: Interactive brute force / credential stuffing demonstration showing how passwords fail instantly while TOTP authentication protects the account.
  6. **Cloud Security Simulator**: Interactive AWS S3 bucket ACL & IAM role misconfiguration sandbox with simulated attacker probing and hardening guide.

---

## Architecture Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts, qrcode.react.
- **Backend**: Laravel 11 REST API, Laravel Sanctum (instructor tokens), Laravel Reverb (WebSocket), Service Layer pattern.
- **Database**: PostgreSQL (with SQLite compatibility fallback for zero-dependency standalone demonstrations).

---

## Quick Start & Installation

### Option 1: Running Frontend & Backend locally

#### 1. Backend Setup
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan reverb:start
php artisan serve --port=8000
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## License
MIT License. Built for educational and defensive cybersecurity training.
