import { PiiAnalysisResult, PiiDetectionItem, RiskTier } from '../types';

// Luhn algorithm validator for credit cards
function isValidLuhn(digits: string): boolean {
  let sum = 0;
  let alternate = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits.charAt(i), 10);
    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alternate = !alternate;
  }
  return sum % 10 === 0;
}

export function analyzePersonalDataLeak(inputText: string): PiiAnalysisResult {
  if (!inputText || !inputText.trim()) {
    return {
      totalDetections: 0,
      overallRiskTier: 'LOW',
      securityScore: 100,
      detections: [],
      maskedText: '',
      breachImpactSummary: ['No PII detected. Text is safe to share.']
    };
  }

  const detections: PiiDetectionItem[] = [];
  let maskedText = inputText;

  // 1. Indonesian NIK (Nomor Induk Kependudukan - 16 digits)
  // Format: [2 digit province][2 digit city][2 digit district][6 digit DOB][4 digit sequence]
  const nikRegex = /\b([1-9][0-9]{5})([0-7][0-9])([01][0-9])([0-9]{2})([0-9]{4})\b/g;
  let nikMatch: RegExpExecArray | null;
  while ((nikMatch = nikRegex.exec(inputText)) !== null) {
    const raw = nikMatch[0];
    const masked = raw.slice(0, 4) + '************';
    detections.push({
      type: 'INDONESIAN_NIK',
      rawSnippet: raw,
      maskedSnippet: masked,
      confidence: 0.95,
      index: nikMatch.index,
      impactTier: 'CRITICAL',
      description: 'Indonesian National Identification Number (NIK). Exposing this enables identity theft, fraudulent banking applications, and social engineering attacks.'
    });
  }

  // 2. Credit Card Numbers (13-19 digits, possibly hyphenated or spaced)
  const ccRegex = /\b(?:\d{4}[ -]?){3,4}\d{1,4}\b/g;
  let ccMatch: RegExpExecArray | null;
  while ((ccMatch = ccRegex.exec(inputText)) !== null) {
    const raw = ccMatch[0];
    const stripped = raw.replace(/[- ]/g, '');
    if (stripped.length >= 13 && stripped.length <= 19 && isValidLuhn(stripped)) {
      const masked = stripped.slice(0, 4) + '-****-****-' + stripped.slice(-4);
      detections.push({
        type: 'CREDIT_CARD',
        rawSnippet: raw,
        maskedSnippet: masked,
        confidence: 0.98,
        index: ccMatch.index,
        impactTier: 'CRITICAL',
        description: 'Payment Card Number (Luhn verified). Immediate financial fraud and unauthorized charging risk.'
      });
    }
  }

  // 3. Email Addresses
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
  let emailMatch: RegExpExecArray | null;
  while ((emailMatch = emailRegex.exec(inputText)) !== null) {
    const raw = emailMatch[0];
    const parts = raw.split('@');
    const masked = parts[0].charAt(0) + '***@' + parts[1];
    detections.push({
      type: 'EMAIL',
      rawSnippet: raw,
      maskedSnippet: masked,
      confidence: 0.99,
      index: emailMatch.index,
      impactTier: 'MEDIUM',
      description: 'Personal or Work Email Address. Vulnerable to spear-phishing campaigns and credential stuffing.'
    });
  }

  // 4. Phone Numbers (Indonesian +62 / 08 or international E.164)
  const phoneRegex = /(?:\+?62|08)[0-9\s-]{8,14}\b/g;
  let phoneMatch: RegExpExecArray | null;
  while ((phoneMatch = phoneRegex.exec(inputText)) !== null) {
    const raw = phoneMatch[0];
    const cleanDigits = raw.replace(/\D/g, '');
    if (cleanDigits.length >= 10 && cleanDigits.length <= 14) {
      const masked = raw.slice(0, 4) + '-****-' + raw.slice(-3);
      detections.push({
        type: 'PHONE',
        rawSnippet: raw,
        maskedSnippet: masked,
        confidence: 0.90,
        index: phoneMatch.index,
        impactTier: 'HIGH',
        description: 'Mobile Phone Number. Susceptible to SIM swap fraud, malicious SMS phishing (Smishing), and OTP interception.'
      });
    }
  }

  // 5. Indonesian Physical Address patterns (Jalan / Jl. / RT / RW / Kelurahan)
  const addressRegex = /\b(?:jl\.|jalan|komplek|gang|rt\s?\d{1,3}\/?\s?rw\s?\d{1,3})\s+[^,\n.]{5,40}/gi;
  let addrMatch: RegExpExecArray | null;
  while ((addrMatch = addressRegex.exec(inputText)) !== null) {
    const raw = addrMatch[0];
    const masked = raw.slice(0, 7) + ' [ALAMAT DISAMARKAN]';
    detections.push({
      type: 'ADDRESS',
      rawSnippet: raw,
      maskedSnippet: masked,
      confidence: 0.85,
      index: addrMatch.index,
      impactTier: 'MEDIUM',
      description: 'Physical Residential Address indicator. Physical stalking and targeted harassment risk.'
    });
  }

  // Sort detections backwards by index to replace in string cleanly
  const sortedDetections = [...detections].sort((a, b) => b.index - a.index);
  for (const item of sortedDetections) {
    maskedText =
      maskedText.substring(0, item.index) +
      item.maskedSnippet +
      maskedText.substring(item.index + item.rawSnippet.length);
  }

  // Risk calculation
  let criticalCount = 0;
  let highCount = 0;
  let mediumCount = 0;

  for (const item of detections) {
    if (item.impactTier === 'CRITICAL') criticalCount++;
    else if (item.impactTier === 'HIGH') highCount++;
    else if (item.impactTier === 'MEDIUM') mediumCount++;
  }

  let overallRiskTier: RiskTier = 'LOW';
  let securityScore = 100;

  if (criticalCount > 0) {
    overallRiskTier = 'CRITICAL';
    securityScore = Math.max(10, 40 - criticalCount * 15);
  } else if (highCount > 0) {
    overallRiskTier = 'HIGH';
    securityScore = Math.max(30, 65 - highCount * 10);
  } else if (mediumCount > 0) {
    overallRiskTier = 'MEDIUM';
    securityScore = Math.max(50, 85 - mediumCount * 10);
  }

  // Impact summary
  const breachImpactSummary: string[] = [];
  if (criticalCount > 0) {
    breachImpactSummary.push(`CRITICAL EXPOSURE: ${criticalCount} piece(s) of high-value PII (NIK / Financial Data) discovered.`);
    breachImpactSummary.push('Identity theft probability: HIGH. Fraudulent loans/banking attacks can be opened with NIK data.');
  }
  if (highCount > 0) {
    breachImpactSummary.push(`HIGH RISK: ${highCount} mobile phone number(s) detected. High risk of SMS phishing and OTP social engineering.`);
  }
  if (mediumCount > 0) {
    breachImpactSummary.push(`MEDIUM RISK: Contact information / Email detected. May result in marketing spam and targeted phishing.`);
  }
  if (detections.length === 0) {
    breachImpactSummary.push('Safe: No sensitive PII detected according to UU PDP (Indonesian Personal Data Protection Law) standards.');
  }

  return {
    totalDetections: detections.length,
    overallRiskTier,
    securityScore,
    detections,
    maskedText,
    breachImpactSummary
  };
}
