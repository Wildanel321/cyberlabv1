import { describe, it, expect } from 'vitest';
import { analyzePassword } from '../utils/passwordChecker';
import { analyzePhishingUrl } from '../utils/phishingAnalyzer';
import { analyzePersonalDataLeak } from '../utils/dataLeakSimulator';
import { analyzeAiPromptPrivacy } from '../utils/aiPrivacyChecker';
import { generateSimulatedTotp, runAttackerSimulation } from '../utils/twoFactorSimulator';
import { probeCloudSecurity } from '../utils/cloudSecuritySimulator';
import { calculateDreadRisk } from '../utils/dreadSimulator';
import { evaluateAccountSecurity } from '../utils/accountSecurityEvaluator';

describe('Tool 1: Password Security Checker', () => {
  it('flags common dictionary passwords with low score', () => {
    const result = analyzePassword('password123');
    expect(result.score).toBeLessThan(40);
    expect(result.hasCommonPatterns).toBe(true);
    expect(result.matchedPatterns.length).toBeGreaterThan(0);
  });

  it('recognizes high-entropy passphrase with high score', () => {
    const result = analyzePassword('Correct-Horse-Battery-Staple-99!');
    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.entropy).toBeGreaterThan(60);
    expect(result.strength).toBe('Very Strong');
    expect(result.hasLength).toBe(true);
  });
});

describe('Tool 2: Phishing URL Analyzer', () => {
  it('detects direct IP address hostnames as critical threats', () => {
    const result = analyzePhishingUrl('http://192.168.1.1/login.php');
    expect(result.isIpAddress).toBe(true);
    expect(result.riskTier).toBe('CRITICAL');
    expect(result.findings.some(f => f.title.includes('Direct IP Hostname'))).toBe(true);
  });

  it('detects punycode homograph attacks', () => {
    const result = analyzePhishingUrl('https://xn--appl-43d.com/login');
    expect(result.hasPunycode).toBe(true);
    expect(result.riskTier).toBe('CRITICAL');
  });

  it('validates benign standard HTTPS URLs', () => {
    const result = analyzePhishingUrl('https://cyberguard.edu/about');
    expect(result.isHttps).toBe(true);
    expect(result.isIpAddress).toBe(false);
    expect(result.riskTier).toBe('LOW');
  });
});

describe('Tool 3: Personal Data Leak Simulator', () => {
  it('detects Indonesian NIK and masks it safely', () => {
    const text = 'Data peserta NIK: 3171010105950001 atas nama Budi.';
    const result = analyzePersonalDataLeak(text);
    expect(result.totalDetections).toBeGreaterThanOrEqual(1);
    expect(result.overallRiskTier).toBe('CRITICAL');
    expect(result.maskedText).toContain('3171************');
    expect(result.maskedText).not.toContain('3171010105950001');
  });

  it('detects Luhn-valid credit card numbers', () => {
    // 4532-0150-1234-5671 is a valid test number
    const text = 'Payment with card 4532 0150 1234 5671 today.';
    const result = analyzePersonalDataLeak(text);
    expect(result.totalDetections).toBeGreaterThanOrEqual(1);
    expect(result.maskedText).toContain('4532-****-****-5671');
  });
});

describe('Tool 4: AI Privacy Risk Checker', () => {
  it('identifies and redacts OpenAI API keys', () => {
    const prompt = 'Please use key sk-proj-1234567890abcdef1234567890 to call OpenAI API.';
    const result = analyzeAiPromptPrivacy(prompt);
    expect(result.riskTier).toBe('CRITICAL');
    expect(result.findings.some(f => f.category === 'API_KEY')).toBe(true);
    expect(result.sanitizedPrompt).toContain('[REDACTED_OPENAI_API_KEY]');
    expect(result.sanitizedPrompt).not.toContain('sk-proj-1234567890abcdef1234567890');
  });

  it('identifies AWS access keys and database credentials', () => {
    const prompt = 'Connect with postgresql://admin:secret123@db.prod.internal:5432/finance and AKIAIOSFODNN7EXAMPLE';
    const result = analyzeAiPromptPrivacy(prompt);
    expect(result.findings.length).toBeGreaterThanOrEqual(2);
    expect(result.sanitizedPrompt).toContain('[REDACTED_DATABASE_CONNECTION_URI]');
    expect(result.sanitizedPrompt).toContain('[REDACTED_AWS_ACCESS_KEY]');
  });
});

describe('Tool 5: 2FA Simulator', () => {
  it('generates 6-digit TOTP code within 30-second window', () => {
    const totp = generateSimulatedTotp();
    expect(totp.code).toMatch(/^\d{6}$/);
    expect(totp.remainingSeconds).toBeGreaterThan(0);
    expect(totp.remainingSeconds).toBeLessThanOrEqual(30);
  });

  it('demonstrates single-factor breach vs 2FA defense', () => {
    const noMfa = runAttackerSimulation(false);
    expect(noMfa.bypassedMfa).toBe(true);

    const withMfa = runAttackerSimulation(true);
    expect(withMfa.bypassedMfa).toBe(false);
    expect(withMfa.logs.some(l => l.includes('Account locked out'))).toBe(true);
  });
});

describe('Tool 6: Cloud Security Simulator', () => {
  it('identifies critical risk when S3 bucket is public-read-write', () => {
    const probe = probeCloudSecurity({
      bucketName: 'leaked-data',
      acl: 'public-read-write',
      versioningEnabled: false,
      encryptionEnabled: false,
      blockPublicAccess: false,
      rolePolicy: 'overly-permissive-admin'
    });

    expect(probe.riskTier).toBe('CRITICAL');
    expect(probe.dataExposed).toBe(true);
    expect(probe.unauthorizedWriteAllowed).toBe(true);
    expect(probe.ransomwareVulnerable).toBe(true);
  });

  it('confirms low risk on hardened least-privilege bucket', () => {
    const probe = probeCloudSecurity({
      bucketName: 'vault',
      acl: 'private',
      versioningEnabled: true,
      encryptionEnabled: true,
      blockPublicAccess: true,
      rolePolicy: 'strict-least-privilege'
    });

    expect(probe.riskTier).toBe('LOW');
    expect(probe.dataExposed).toBe(false);
    expect(probe.findings.length).toBe(0);
  });
});

describe('Tool 7: Metode Pemetaan Risiko DREAD', () => {
  it('maps high threat score (>= 2.6) to TINGGI category and CRITICAL tier', () => {
    // 3 + 3 + 3 + 3 + 3 = 15 / 5 = 3.0
    const high = calculateDreadRisk({
      damage: 3,
      reproducibility: 3,
      exploitability: 3,
      affectedUsers: 3,
      discoverability: 3,
    });

    expect(high.averageScore).toBe(3.0);
    expect(high.dreadCategory).toBe('TINGGI');
    expect(high.riskTier).toBe('CRITICAL');
  });

  it('maps medium threat score (2.0 - 2.5) to SEDANG category', () => {
    // 2 + 2 + 3 + 2 + 2 = 11 / 5 = 2.2
    const med = calculateDreadRisk({
      damage: 2,
      reproducibility: 2,
      exploitability: 3,
      affectedUsers: 2,
      discoverability: 2,
    });

    expect(med.averageScore).toBe(2.2);
    expect(med.dreadCategory).toBe('SEDANG');
  });

  it('maps low threat score (< 2.0) to RENDAH category and LOW tier', () => {
    // 1 + 1 + 2 + 1 + 1 = 6 / 5 = 1.2
    const low = calculateDreadRisk({
      damage: 1,
      reproducibility: 1,
      exploitability: 2,
      affectedUsers: 1,
      discoverability: 1,
    });

    expect(low.averageScore).toBe(1.2);
    expect(low.dreadCategory).toBe('RENDAH');
    expect(low.riskTier).toBe('LOW');
  });
});

describe('Tool 8: Evaluasi Keamanan Akun', () => {
  it('flags account without 2FA and password reuse as CRITICAL', () => {
    const audit = evaluateAccountSecurity({
      accountType: 'social_media',
      passwordAgeDays: 730,
      passwordReusedAcrossSites: true,
      hasTwoFactorAuth: false,
      mfaMethod: 'none',
      hasRecoveryEmailOrPhone: false,
      recoveryContactsUpToDate: false,
      activeSessionCount: 8,
      hasThirdPartyOAuthApps: true,
      oauthAppsCount: 10,
      loginNotificationsEnabled: false,
    });

    expect(audit.overallRiskTier).toBe('CRITICAL');
    expect(audit.accountHealth).toBe('KRITIS');
    expect(audit.criticalFindingsCount).toBeGreaterThan(0);
    expect(audit.securityScore).toBeLessThan(50);
  });

  it('validates hardened account with FIDO/TOTP and fresh password as SANGAT AMAN', () => {
    const audit = evaluateAccountSecurity({
      accountType: 'banking',
      passwordAgeDays: 30,
      passwordReusedAcrossSites: false,
      hasTwoFactorAuth: true,
      mfaMethod: 'app_totp',
      hasRecoveryEmailOrPhone: true,
      recoveryContactsUpToDate: true,
      activeSessionCount: 1,
      hasThirdPartyOAuthApps: false,
      oauthAppsCount: 0,
      loginNotificationsEnabled: true,
    });

    expect(audit.overallRiskTier).toBe('LOW');
    expect(audit.accountHealth).toBe('SANGAT AMAN');
    expect(audit.criticalFindingsCount).toBe(0);
    expect(audit.securityScore).toBeGreaterThanOrEqual(90);
  });
});
