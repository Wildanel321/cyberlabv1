import { PasswordAnalysisResult } from '../types';

// Top 50 common passwords / dictionary patterns
const COMMON_PASSWORDS = new Set([
  'password', '123456', '12345678', '123456789', 'qwerty', '12345',
  '1234567', 'admin', 'welcome', 'login', 'football', 'iloveyou',
  'monkey', 'dragon', 'master', 'sunshine', 'princess', 'solo',
  'pass123', 'admin123', 'cyberlab', 'security', 'letmein', 'shadow',
  'hunter2', 'trustno1', 'starwars', 'superman', 'batman', 'system',
  'root', 'toor', 'default', 'guest', 'indonesia', 'merdeka', 'jakarta'
]);

export function analyzePassword(password: string): PasswordAnalysisResult {
  if (!password) {
    return {
      score: 0,
      entropy: 0,
      strength: 'Very Weak',
      crackTimeDisplay: 'Instant',
      hasLength: false,
      hasUpper: false,
      hasLower: false,
      hasDigit: false,
      hasSpecial: false,
      hasCommonPatterns: false,
      matchedPatterns: [],
      recommendations: ['Enter a password to evaluate its strength and entropy.']
    };
  }

  const length = password.length;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  // Pool size calculation for Shannon/NIST Entropy
  let poolSize = 0;
  if (hasLower) poolSize += 26;
  if (hasUpper) poolSize += 26;
  if (hasDigit) poolSize += 10;
  if (hasSpecial) poolSize += 33;

  // Entropy = L * log2(R)
  const entropy = poolSize > 0 ? Math.round(length * (Math.log(poolSize) / Math.LN2)) : 0;

  // Pattern checks
  const matchedPatterns: string[] = [];
  const lowerPwd = password.toLowerCase();

  if (COMMON_PASSWORDS.has(lowerPwd)) {
    matchedPatterns.push('Matches known breached/dictionary password');
  }

  if (/(.)\1{2,}/.test(password)) {
    matchedPatterns.push('Contains 3+ consecutive repeated characters (e.g. "aaa")');
  }

  if (/(123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|pqr|xyz)/i.test(password)) {
    matchedPatterns.push('Contains sequential alphabet or number sequences');
  }

  if (/(qwerty|asdfgh|zxcvbn|qwertz|azerty)/i.test(password)) {
    matchedPatterns.push('Contains predictable keyboard walk pattern');
  }

  if (/^(19|20)\d{2}/.test(password) || /(19|20)\d{2}$/.test(password)) {
    matchedPatterns.push('Contains probable birth or calendar year');
  }

  // Base score calculation
  let score = 0;

  // Length scoring
  if (length >= 16) score += 35;
  else if (length >= 12) score += 25;
  else if (length >= 8) score += 15;
  else score += Math.max(0, length * 1.5);

  // Diversity scoring
  let diversityCount = 0;
  if (hasLower) diversityCount++;
  if (hasUpper) diversityCount++;
  if (hasDigit) diversityCount++;
  if (hasSpecial) diversityCount++;

  score += diversityCount * 12;

  // Entropy bonus
  if (entropy > 75) score += 17;
  else if (entropy > 50) score += 10;

  // Penalties
  if (matchedPatterns.length > 0) {
    score -= matchedPatterns.length * 15;
  }
  if (length < 8) {
    score = Math.min(score, 30);
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  // Strength tier
  let strength: PasswordAnalysisResult['strength'] = 'Very Weak';
  if (score >= 85) strength = 'Very Strong';
  else if (score >= 70) strength = 'Strong';
  else if (score >= 50) strength = 'Fair';
  else if (score >= 30) strength = 'Weak';

  // Crack time estimation (assuming modern 8x RTX 4090 cluster: ~100 Billion hashes/sec for NTLM / 100k/sec for bcrypt)
  // For pedagogical comparison, we present offline GPU cluster cracking estimation
  let crackTimeDisplay = 'Instant';
  const combinations = Math.pow(poolSize || 1, length);
  const guessesPerSecond = 1e11; // 100 GH/s
  const secondsToCrack = combinations / (2 * guessesPerSecond);

  if (matchedPatterns.includes('Matches known breached/dictionary password')) {
    crackTimeDisplay = 'Less than 1 millisecond (Dictionary Lookup)';
  } else if (secondsToCrack < 1) {
    crackTimeDisplay = 'Less than 1 second';
  } else if (secondsToCrack < 60) {
    crackTimeDisplay = `${Math.round(secondsToCrack)} seconds`;
  } else if (secondsToCrack < 3600) {
    crackTimeDisplay = `${Math.round(secondsToCrack / 60)} minutes`;
  } else if (secondsToCrack < 86400) {
    crackTimeDisplay = `${Math.round(secondsToCrack / 3600)} hours`;
  } else if (secondsToCrack < 31536000) {
    crackTimeDisplay = `${Math.round(secondsToCrack / 86400)} days`;
  } else if (secondsToCrack < 31536000 * 100) {
    crackTimeDisplay = `${Math.round(secondsToCrack / 31536000)} years`;
  } else if (secondsToCrack < 31536000 * 1e6) {
    crackTimeDisplay = `${Math.round(secondsToCrack / (31536000 * 1000))} thousand years`;
  } else {
    crackTimeDisplay = 'Millions of centuries';
  }

  // Recommendations
  const recommendations: string[] = [];
  if (length < 12) recommendations.push('Increase length to at least 12-16 characters or use a passphrase.');
  if (!hasUpper) recommendations.push('Add uppercase characters (A-Z).');
  if (!hasLower) recommendations.push('Add lowercase characters (a-z).');
  if (!hasDigit) recommendations.push('Include numerical digits (0-9).');
  if (!hasSpecial) recommendations.push('Include special symbols (!@#$%^&*).');
  if (matchedPatterns.length > 0) recommendations.push('Eliminate dictionary words, repeated characters, and keyboard sequences.');
  if (recommendations.length === 0) {
    recommendations.push('Excellent passphrase structure! Store safely in an encrypted password manager.');
  }

  return {
    score,
    entropy,
    strength,
    crackTimeDisplay,
    hasLength: length >= 12,
    hasUpper,
    hasLower,
    hasDigit,
    hasSpecial,
    hasCommonPatterns: matchedPatterns.length > 0,
    matchedPatterns,
    recommendations
  };
}
