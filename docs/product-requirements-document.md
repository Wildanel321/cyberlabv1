# Product Requirements Document (PRD) - CyberGuard Lab

## 1. Executive Summary
CyberGuard Lab provides cybersecurity educators, trainers, and conference speakers with an instant, friction-free environment to teach defense-in-depth cybersecurity concepts and AI data privacy principles.

## 2. Target Users
1. **Instructors / Speakers / Trainers**:
   - Needs to launch a live room in < 10 seconds.
   - Project a QR code & join code on a lecture screen.
   - Watch live participation, tool engagements, and risk metrics update in real-time.
   - Zero worry about students submitting illegal, harmful, or private PII data to backend servers.
2. **Participants / Students / Attendees**:
   - Zero login / zero registration friction: scan QR code on mobile phone or enter code on laptop.
   - Pick an anonymous nickname.
   - Full self-paced freedom to use all 6 cybersecurity & privacy tools.
   - Immediate feedback, security scores, remediation tips, and local history.

## 3. Core Modules (The 6 Tools)
1. **Password Security Checker**:
   - Visual entropy gauge (bits of entropy).
   - Character diversity, dictionary checks, sequential patterns, crack time simulation across GPU rigs (RTX 4090 cluster).
   - Hardened recommendations.
2. **Phishing URL Analyzer**:
   - Protocol check (HTTP vs HTTPS).
   - IP-address as domain detection.
   - Punycode & homograph attack recognition.
   - High-risk TLDs (.xyz, .top, .ru, .zip, etc.).
   - Excessive subdomains, embedded credentials, obfuscated query parameters.
3. **Personal Data Leak Simulator**:
   - Instant PII scanning: Indonesian NIK (16-digit regex with date/region validation), Emails, Phone numbers (international & local +62/08), Credit Cards (Luhn algorithm validation).
   - Masked text preview (`3171************`).
   - Impact classification (Low, Medium, High, Critical).
4. **AI Privacy Risk Checker**:
   - Scans system prompts for leaked API keys (OpenAI, AWS, GitHub, Stripe tokens), Passwords, SSH keys, Bearer tokens, and confidential corporate secrets.
   - Highlighted threat tokens and instant safe/sanitized prompt output.
5. **2FA Simulator**:
   - Demonstrates vulnerable single-factor login vs 2-Factor Authentication (TOTP).
   - Brute-force simulation showing how single-factor fails in seconds while 2FA prevents unauthorized account access.
   - Interactive 6-digit TOTP generator with 30-second expiring window and brute force attempt lockout.
6. **Cloud Security Simulator**:
   - Cloud S3 Bucket / Storage configuration console.
   - Toggle bucket ACLs (Public Read, Public Write, Authenticated Users Only, Private).
   - Simulate unauthorized attacker probes: bucket enumeration, data leak, and ransomware overwrites.
   - Step-by-step AWS/Azure hardening guidance.
