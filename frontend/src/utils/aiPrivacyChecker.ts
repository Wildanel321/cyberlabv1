import { AiPrivacyAnalysisResult, AiPrivacyDetection, RiskTier } from '../types';

interface SecretRule {
  category: AiPrivacyDetection['category'];
  label: string;
  regex: RegExp;
  riskTier: RiskTier;
  explanation: string;
  maskReplacement: string;
}

const SECRET_RULES: SecretRule[] = [
  // 1. OpenAI API Keys (sk-... or sk-proj-...)
  {
    category: 'API_KEY',
    label: 'OpenAI API Secret Key',
    regex: /\b(sk-(?:proj-)?[A-Za-z0-9_-]{20,80})\b/g,
    riskTier: 'CRITICAL',
    explanation: 'Exposes your paid OpenAI account credentials. Attackers can drain billing quotas or access private assistant logs.',
    maskReplacement: '[REDACTED_OPENAI_API_KEY]'
  },
  // 2. AWS Access Key IDs
  {
    category: 'API_KEY',
    label: 'Amazon AWS Access Key ID',
    regex: /\b(AKIA[0-9A-Z]{16})\b/g,
    riskTier: 'CRITICAL',
    explanation: 'AWS IAM access key discovered. Can grant attackers full programmatic control over cloud instances and databases.',
    maskReplacement: '[REDACTED_AWS_ACCESS_KEY]'
  },
  // 3. GitHub Personal Access Tokens
  {
    category: 'API_KEY',
    label: 'GitHub Personal Access Token',
    regex: /\b((?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{36}|github_pat_[A-Za-z0-9_]{82})\b/g,
    riskTier: 'CRITICAL',
    explanation: 'GitHub authentication token found. Enables unauthorized commit push, private repository clones, and CI/CD takeover.',
    maskReplacement: '[REDACTED_GITHUB_TOKEN]'
  },
  // 4. Stripe API Keys (Live secret or restricted)
  {
    category: 'API_KEY',
    label: 'Stripe Live Secret Key',
    regex: /\b(sk_live_[0-9a-zA-Z]{24,34}|rk_live_[0-9a-zA-Z]{24,34})\b/g,
    riskTier: 'CRITICAL',
    explanation: 'Payment processor live secret key. Attackers can initiate unauthorized payouts and access customer financial records.',
    maskReplacement: '[REDACTED_STRIPE_LIVE_KEY]'
  },
  // 5. Private Keys (RSA, OpenSSH, PGP)
  {
    category: 'SSH_KEY',
    label: 'Private Cryptographic Key Header',
    regex: /-----BEGIN\s+(?:RSA|OPENSSH|EC|DSA|PGP)?\s*PRIVATE\s+KEY-----/g,
    riskTier: 'CRITICAL',
    explanation: 'Cryptographic private key detected in prompt. Gives attackers direct SSH server access or decryption capability.',
    maskReplacement: '[REDACTED_PRIVATE_KEY_BLOCK]'
  },
  // 6. Database Connection Strings (Postgres / MySQL / MongoDB URI)
  {
    category: 'BEARER_TOKEN',
    label: 'Database Connection String with Credentials',
    regex: /(?:postgres|postgresql|mysql|mongodb(?:\+srv)?):\/\/[^\s:]+:[^\s@]+@[^\s/]+/gi,
    riskTier: 'CRITICAL',
    explanation: 'Database connection URI embeds raw username, password, and host. Attackers can dump or wipe production databases.',
    maskReplacement: '[REDACTED_DATABASE_CONNECTION_URI]'
  },
  // 7. Generic Passwords inside code/prompts (e.g. password = "...", db_password: "...")
  {
    category: 'PASSWORD_IN_PROMPT',
    label: 'Hardcoded Password in Prompt',
    regex: /(?:password|passwd|pwd|secret_key)\s*[:=]\s*["']([^"'\s]{6,64})["']/gi,
    riskTier: 'HIGH',
    explanation: 'Hardcoded password assigned in prompt text. Model providers cache prompts and may train on user conversations.',
    maskReplacement: 'password = "[REDACTED_PASSWORD]"'
  },
  // 8. Bearer / JWT Tokens
  {
    category: 'BEARER_TOKEN',
    label: 'Bearer / JSON Web Token (JWT)',
    regex: /\b(ey[A-Za-z0-9-_]{15,}\.ey[A-Za-z0-9-_]{15,}\.[A-Za-z0-9-_]{15,})\b/g,
    riskTier: 'HIGH',
    explanation: 'Signed JSON Web Token (JWT) detected. May grant active session impersonation to internal microservices.',
    maskReplacement: '[REDACTED_JWT_TOKEN]'
  },
  // 9. Confidential Enterprise Markers
  {
    category: 'CONFIDENTIAL_MARKER',
    label: 'Enterprise Confidential Classification',
    regex: /\b(STRICTLY CONFIDENTIAL|INTERNAL USE ONLY|NDA PROTECTED|PROPRIETARY TRADE SECRET|DO NOT DISTRIBUTE)\b/gi,
    riskTier: 'MEDIUM',
    explanation: 'Notice indicates sensitive business data. Ingesting this into public AI models violates corporate privacy & compliance standards.',
    maskReplacement: '[CONFIDENTIAL_CONTENT_OMITTED]'
  }
];

export function analyzeAiPromptPrivacy(promptText: string): AiPrivacyAnalysisResult {
  if (!promptText || !promptText.trim()) {
    return {
      riskTier: 'LOW',
      securityScore: 100,
      findings: [],
      sanitizedPrompt: '',
      remediationAdvice: ['Paste an AI prompt to inspect for leaked secrets, API keys, and confidential markers.']
    };
  }

  const findings: AiPrivacyDetection[] = [];
  let sanitizedPrompt = promptText;

  for (const rule of SECRET_RULES) {
    const matches = promptText.match(rule.regex);
    if (matches && matches.length > 0) {
      for (const match of matches) {
        const preview = match.length > 18 ? match.slice(0, 6) + '...' + match.slice(-4) : match;
        findings.push({
          category: rule.category,
          label: rule.label,
          tokenPreview: preview,
          riskTier: rule.riskTier,
          explanation: rule.explanation
        });
      }

      // Replace in sanitized prompt
      sanitizedPrompt = sanitizedPrompt.replace(rule.regex, rule.maskReplacement);
    }
  }

  // Calculate score & risk tier
  let criticalCount = 0;
  let highCount = 0;
  let mediumCount = 0;

  for (const f of findings) {
    if (f.riskTier === 'CRITICAL') criticalCount++;
    else if (f.riskTier === 'HIGH') highCount++;
    else if (f.riskTier === 'MEDIUM') mediumCount++;
  }

  let riskTier: RiskTier = 'LOW';
  let securityScore = 100;

  if (criticalCount > 0) {
    riskTier = 'CRITICAL';
    securityScore = Math.max(5, 30 - criticalCount * 10);
  } else if (highCount > 0) {
    riskTier = 'HIGH';
    securityScore = Math.max(25, 60 - highCount * 12);
  } else if (mediumCount > 0) {
    riskTier = 'MEDIUM';
    securityScore = Math.max(50, 80 - mediumCount * 10);
  }

  const remediationAdvice: string[] = [];
  if (criticalCount > 0) {
    remediationAdvice.push('NEVER paste production API keys, connection strings, or cloud tokens into AI chat windows.');
    remediationAdvice.push('Rotate any API keys or credentials that have been shared in previous AI chat logs immediately.');
  }
  if (highCount > 0 || mediumCount > 0) {
    remediationAdvice.push('Use the Sanitized Prompt preview below when collaborating with public AI models.');
    remediationAdvice.push('Adopt enterprise AI proxies with automated DLP (Data Loss Prevention) token masking.');
  }
  if (findings.length === 0) {
    remediationAdvice.push('Safe: No API credentials, cryptographic keys, or corporate classification markers detected.');
  }

  return {
    riskTier,
    securityScore,
    findings,
    sanitizedPrompt,
    remediationAdvice
  };
}

