import { CloudBucketConfig, CloudProbeResult, RiskTier } from '../types';

export function probeCloudSecurity(config: CloudBucketConfig): CloudProbeResult {
  const findings: CloudProbeResult['findings'] = [];
  let riskScore = 0;
  let dataExposed = false;
  let unauthorizedWriteAllowed = false;
  let ransomwareVulnerable = false;

  // 1. ACL & Block Public Access Check
  if (config.acl === 'public-read-write') {
    riskScore += 50;
    dataExposed = true;
    unauthorizedWriteAllowed = true;
    ransomwareVulnerable = true;
    findings.push({
      category: 'Public Write Exposure',
      issue: 'Bucket ACL is configured to "public-read-write". Any anonymous entity on the internet can overwrite files, deploy malware, or delete databases.',
      severity: 'CRITICAL',
      remediation: 'Change ACL to "private" and enable AWS S3 "Block Public Access" at both bucket and account levels.'
    });
  } else if (config.acl === 'public-read') {
    riskScore += 35;
    dataExposed = true;
    findings.push({
      category: 'Public Read Exposure',
      issue: 'Bucket ACL permits anonymous "public-read". Anyone with the bucket URL can enumerate and download confidential assets.',
      severity: 'HIGH',
      remediation: 'Enable S3 Block Public Access and restrict access via signed CloudFront URLs or IAM policies.'
    });
  }

  // 2. Block Public Access override
  if (!config.blockPublicAccess && config.acl === 'private') {
    riskScore += 15;
    findings.push({
      category: 'Block Public Access Disabled',
      issue: 'While the ACL is currently private, the global "Block Public Access" safeguard is disabled. A future rogue policy could expose the bucket unintentionally.',
      severity: 'MEDIUM',
      remediation: 'Turn on all 4 Block Public Access settings: IgnorePublicAcls, BlockPublicAcls, BlockPublicPolicy, RestrictPublicBuckets.'
    });
  }

  // 3. Server-side Encryption check
  if (!config.encryptionEnabled) {
    riskScore += 20;
    findings.push({
      category: 'Unencrypted Storage at Rest',
      issue: 'Server-Side Encryption (SSE-KMS / SSE-S3) is disabled. Stored objects are vulnerable if raw storage volumes or backup snapshots are leaked.',
      severity: 'HIGH',
      remediation: 'Enforce default encryption using AWS-KMS managed customer master keys (CMK).'
    });
  }

  // 4. Object Versioning check
  if (!config.versioningEnabled) {
    riskScore += 15;
    if (unauthorizedWriteAllowed) ransomwareVulnerable = true;
    findings.push({
      category: 'Object Versioning Disabled',
      issue: 'Versioning is disabled. Accidental deletes, malicious overwrites, or ransomware attacks will permanently destroy objects with no rollback capability.',
      severity: 'MEDIUM',
      remediation: 'Enable S3 Object Versioning and consider MFA Delete for critical production buckets.'
    });
  }

  // 5. IAM Policy Wildcards
  if (config.rolePolicy === 'overly-permissive-admin') {
    riskScore += 30;
    findings.push({
      category: 'IAM Wildcard Privilege Escalation',
      issue: 'Assigned IAM Role uses "AdministratorAccess" with "Action: *" and "Resource: *". An application compromise results in full cloud infrastructure takeover.',
      severity: 'CRITICAL',
      remediation: 'Apply the Principle of Least Privilege (PoLP). Restrict Actions strictly to "s3:GetObject" on specific resource ARNs.'
    });
  }

  // Normalize risk score
  riskScore = Math.min(100, riskScore);

  let riskTier: RiskTier = 'LOW';
  if (riskScore >= 70) riskTier = 'CRITICAL';
  else if (riskScore >= 40) riskTier = 'HIGH';
  else if (riskScore >= 20) riskTier = 'MEDIUM';

  return {
    riskScore,
    riskTier,
    dataExposed,
    unauthorizedWriteAllowed,
    ransomwareVulnerable,
    findings
  };
}

