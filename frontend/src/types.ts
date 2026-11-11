export type RiskTier = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type SessionStatus = 'created' | 'active' | 'ended' | 'expired';

export type ParticipantStatus = 'active' | 'idle' | 'disconnected';

export interface User {
  id: string;
  name: string;
  email: string;
  created_at?: string;
}

export interface Session {
  id: string;
  user_id: string;
  code: string;
  title: string;
  status: SessionStatus;
  max_participants: number;
  expires_at: string;
  created_at: string;
  updated_at?: string;
  active_participants_count?: number;
  total_participants_count?: number;
}

export interface Participant {
  id: string;
  session_id: string;
  nickname: string;
  status: ParticipantStatus;
  last_seen_at: string;
  created_at: string;
}

export interface Activity {
  id: string;
  participant_id: string;
  participant_nickname?: string;
  session_id: string;
  tool_name: string;
  risk_tier: RiskTier;
  score: number;
  duration_seconds: number;
  metadata: Record<string, any>;
  created_at: string;
}

export interface SessionAnalytics {
  session_id: string;
  session_code: string;
  session_title: string;
  session_status: SessionStatus;
  total_participants: number;
  active_participants: number;
  total_activities_completed: number;
  average_security_score: number;
  tool_usage: {
    tool_name: string;
    display_name: string;
    count: number;
    avg_score: number;
  }[];
  risk_distribution: {
    tier: RiskTier;
    count: number;
    percentage: number;
  }[];
  recent_activities: {
    id: string;
    tool_name: string;
    nickname: string;
    risk_tier: RiskTier;
    score: number;
    created_at: string;
  }[];
  activity_timeline: {
    time: string;
    count: number;
  }[];
}

// Tool 1: Password Checker Types
export interface PasswordAnalysisResult {
  score: number; // 0 - 100
  entropy: number; // bits
  strength: 'Very Weak' | 'Weak' | 'Fair' | 'Strong' | 'Very Strong';
  crackTimeDisplay: string;
  hasLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasDigit: boolean;
  hasSpecial: boolean;
  hasCommonPatterns: boolean;
  matchedPatterns: string[];
  recommendations: string[];
}

// Tool 2: Phishing URL Analyzer Types
export interface PhishingAnalysisResult {
  riskScore: number; // 0 - 100 (100 is critical phishing)
  riskTier: RiskTier;
  protocol: string;
  isHttps: boolean;
  hostname: string;
  isIpAddress: boolean;
  hasPunycode: boolean;
  hasSuspectTld: boolean;
  subdomainCount: number;
  excessiveSubdomains: boolean;
  hasEmbeddedCredentials: boolean;
  hasObfuscatedKeywords: boolean;
  findings: {
    title: string;
    description: string;
    severity: RiskTier;
  }[];
  recommendations: string[];
}

// Tool 3: Personal Data Leak Simulator Types
export interface PiiDetectionItem {
  type: 'INDONESIAN_NIK' | 'EMAIL' | 'PHONE' | 'CREDIT_CARD' | 'ADDRESS';
  rawSnippet: string;
  maskedSnippet: string;
  confidence: number;
  index: number;
  impactTier: RiskTier;
  description: string;
}

export interface PiiAnalysisResult {
  totalDetections: number;
  overallRiskTier: RiskTier;
  securityScore: number;
  detections: PiiDetectionItem[];
  maskedText: string;
  breachImpactSummary: string[];
}

// Tool 4: AI Privacy Risk Checker Types
export interface AiPrivacyDetection {
  category: 'API_KEY' | 'SSH_KEY' | 'BEARER_TOKEN' | 'PASSWORD_IN_PROMPT' | 'PII' | 'CONFIDENTIAL_MARKER';
  label: string;
  tokenPreview: string;
  riskTier: RiskTier;
  explanation: string;
}

export interface AiPrivacyAnalysisResult {
  riskTier: RiskTier;
  securityScore: number;
  findings: AiPrivacyDetection[];
  sanitizedPrompt: string;
  remediationAdvice: string[];
}

// Tool 5: 2FA Simulator Types
export interface TwoFactorState {
  step: 'INITIAL' | 'ATTACK_DEMO' | 'MFA_CHALLENGE' | 'SUCCESS';
  bruteForceAttempts: number;
  bruteForceCracked: boolean;
  timeToCrackSeconds: number;
  totpSecret: string;
  totpCode: string;
  remainingSeconds: number;
  isLockedOut: boolean;
}

// Tool 6: Cloud Security Simulator Types
export interface CloudBucketConfig {
  bucketName: string;
  acl: 'private' | 'public-read' | 'public-read-write';
  versioningEnabled: boolean;
  encryptionEnabled: boolean;
  blockPublicAccess: boolean;
  rolePolicy: 'strict-least-privilege' | 'overly-permissive-admin';
}

export interface CloudProbeResult {
  riskScore: number;
  riskTier: RiskTier;
  dataExposed: boolean;
  unauthorizedWriteAllowed: boolean;
  ransomwareVulnerable: boolean;
  findings: {
    category: string;
    issue: string;
    severity: RiskTier;
    remediation: string;
  }[];
}
