import { PhishingAnalysisResult, RiskTier } from '../types';

const SUSPICIOUS_TLDS = new Set([
  'xyz', 'top', 'work', 'click', 'zip', 'mov', 'gq', 'cf', 'tk', 'ml', 'cc', 'rest', 'fit', 'buzz', 'icu'
]);

const SENSITIVE_KEYWORDS = [
  'login', 'signin', 'verify', 'account', 'banking', 'secure', 'wallet', 'update',
  'paypal', 'bca', 'mandiri', 'bri', 'bni', 'google', 'apple', 'microsoft', 'netflix',
  'token', 'password', 'checkpoint', 'confirm', 'billing', 'security'
];

const KNOWN_SHORTENERS = new Set([
  'bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'is.gd', 'buff.ly', 'ow.ly', 'cutt.ly', 'rb.gy'
]);

export function analyzePhishingUrl(rawUrl: string): PhishingAnalysisResult {
  const cleanInput = rawUrl.trim();

  if (!cleanInput) {
    return {
      riskScore: 0,
      riskTier: 'LOW',
      protocol: '',
      isHttps: false,
      hostname: '',
      isIpAddress: false,
      hasPunycode: false,
      hasSuspectTld: false,
      subdomainCount: 0,
      excessiveSubdomains: false,
      hasEmbeddedCredentials: false,
      hasObfuscatedKeywords: false,
      findings: [],
      recommendations: ['Enter a suspicious URL to inspect its structural threat indicators.']
    };
  }

  // Prepend protocol if missing for URL parsing
  let parsedUrl: URL;
  let assumedProtocol = false;

  try {
    if (!/^https?:\/\//i.test(cleanInput)) {
      parsedUrl = new URL('http://' + cleanInput);
      assumedProtocol = true;
    } else {
      parsedUrl = new URL(cleanInput);
    }
  } catch {
    return {
      riskScore: 90,
      riskTier: 'CRITICAL',
      protocol: 'Malformed',
      isHttps: false,
      hostname: cleanInput,
      isIpAddress: false,
      hasPunycode: false,
      hasSuspectTld: false,
      subdomainCount: 0,
      excessiveSubdomains: false,
      hasEmbeddedCredentials: false,
      hasObfuscatedKeywords: false,
      findings: [
        {
          title: 'Malformed URL Structure',
          description: 'The URL syntax violates RFC standards and cannot be parsed safely.',
          severity: 'HIGH'
        }
      ],
      recommendations: ['Do not open malformed or obfuscated URLs in any browser.']
    };
  }

  const hostname = parsedUrl.hostname.toLowerCase();
  const protocol = assumedProtocol ? 'none (defaulted to http)' : parsedUrl.protocol;
  const isHttps = parsedUrl.protocol === 'https:';

  // 1. IP Address as Hostname Detection
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const isIpAddress = ipv4Regex.test(hostname) || hostname.startsWith('[');

  // 2. Punycode / IDN Homograph Detection
  const hasPunycode = hostname.includes('xn--');

  // 3. TLD analysis
  const domainParts = hostname.split('.');
  const tld = domainParts.length > 1 ? domainParts[domainParts.length - 1] : '';
  const hasSuspectTld = SUSPICIOUS_TLDS.has(tld);

  // 4. Subdomain count & deep chain
  const subdomainCount = Math.max(0, domainParts.length - 2);
  const excessiveSubdomains = subdomainCount >= 3;

  // 5. Embedded credentials (e.g. https://google.com@evil.com)
  const hasEmbeddedCredentials = Boolean(parsedUrl.username || parsedUrl.password);

  // 6. Obfuscated keywords & brand impersonation in subdomains
  const lowerUrl = cleanInput.toLowerCase();
  const matchedKeywords = SENSITIVE_KEYWORDS.filter(kw => lowerUrl.includes(kw));
  const hasObfuscatedKeywords = matchedKeywords.length >= 2 || (domainParts.length > 2 && domainParts.some(p => SENSITIVE_KEYWORDS.includes(p)));

  // 7. URL Shorteners
  const isShortener = KNOWN_SHORTENERS.has(hostname);

  // Heuristic Findings Compilation
  const findings: PhishingAnalysisResult['findings'] = [];
  let riskScore = 0;

  if (isIpAddress) {
    riskScore += 45;
    findings.push({
      title: 'Direct IP Hostname Identified',
      description: `Legitimate institutions use registered domain names. Direct IP address (${hostname}) is frequently used by phishing kits to bypass domain reputation blocklists.`,
      severity: 'CRITICAL'
    });
  }

  if (hasPunycode) {
    riskScore += 40;
    findings.push({
      title: 'Punycode / IDN Homograph Detected',
      description: `Hostname contains "xn--" punycode prefix. Attackers exploit Cyrillic/Greek characters that look identical to Latin letters (e.g., Cyrillic "а" instead of Latin "a").`,
      severity: 'CRITICAL'
    });
  }

  if (hasEmbeddedCredentials) {
    riskScore += 35;
    findings.push({
      title: 'Credential / Redirection Trickery (@ symbol)',
      description: 'The URL embeds authentication credentials before an "@" symbol to mislead users into believing they are visiting the brand name preceding the @.',
      severity: 'HIGH'
    });
  }

  if (!isHttps) {
    riskScore += 25;
    findings.push({
      title: 'Unencrypted HTTP Transport',
      description: 'The connection lacks TLS/SSL encryption, making credentials and tokens subject to man-in-the-middle (MITM) eavesdropping.',
      severity: 'MEDIUM'
    });
  }

  if (hasSuspectTld) {
    riskScore += 25;
    findings.push({
      title: `High-Abuse Top-Level Domain (.${tld})`,
      description: `The .${tld} top-level domain has historically high abuse rates in automated spam and phishing campaigns due to low registrar cost.`,
      severity: 'MEDIUM'
    });
  }

  if (excessiveSubdomains) {
    riskScore += 25;
    findings.push({
      title: 'Excessive Subdomain Chaining',
      description: `The domain contains ${subdomainCount} subdomains. Phishers frequently pad legitimate brand names in subdomains (e.g. bca.klik.com-verification.site).`,
      severity: 'HIGH'
    });
  }

  if (hasObfuscatedKeywords) {
    riskScore += 20;
    findings.push({
      title: 'Suspicious Security & Brand Keywords',
      description: `Found keywords (${matchedKeywords.slice(0, 3).join(', ')}) commonly used in phishing lure templates.`,
      severity: 'MEDIUM'
    });
  }

  if (isShortener) {
    riskScore += 15;
    findings.push({
      title: 'URL Shortener In Use',
      description: 'The destination domain masks the final landing page. Attackers use shorteners to evade automated email scanner filters.',
      severity: 'LOW'
    });
  }

  // Normalize risk score
  riskScore = Math.min(100, riskScore);

  let riskTier: RiskTier = 'LOW';
  if (riskScore >= 70) riskTier = 'CRITICAL';
  else if (riskScore >= 45) riskTier = 'HIGH';
  else if (riskScore >= 20) riskTier = 'MEDIUM';

  const recommendations: string[] = [];
  if (riskTier === 'CRITICAL' || riskTier === 'HIGH') {
    recommendations.push('Do not click or enter credentials on this page.');
    recommendations.push('Inspect the actual base domain (SLD + TLD) rather than misleading subdomains.');
    recommendations.push('Submit this URL to organization SOC / threat intel feed.');
  } else if (riskTier === 'MEDIUM') {
    recommendations.push('Verify the sender before opening links.');
    recommendations.push('Check the browser address bar for valid SSL certificate details.');
  } else {
    recommendations.push('Domain structure exhibits standard conventions. Always verify contextual legitimacy.');
  }

  return {
    riskScore,
    riskTier,
    protocol,
    isHttps,
    hostname,
    isIpAddress,
    hasPunycode,
    hasSuspectTld,
    subdomainCount,
    excessiveSubdomains,
    hasEmbeddedCredentials,
    hasObfuscatedKeywords,
    findings,
    recommendations
  };
}
