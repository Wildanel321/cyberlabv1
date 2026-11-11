import React, { useState } from 'react';
import { Cloud, ShieldAlert, CheckCircle2, AlertTriangle, Sparkles, ArrowRight, Server, Database, Key } from 'lucide-react';
import { probeCloudSecurity } from '../../utils/cloudSecuritySimulator';
import { CloudBucketConfig, CloudProbeResult, RiskTier } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface ToolProps {
  onComplete: (data: { tool_name: string; risk_tier: RiskTier; score: number; duration_seconds: number; metadata: any }) => void;
}

export const CloudSecuritySimulatorTool: React.FC<ToolProps> = ({ onComplete }) => {
  const [config, setConfig] = useState<CloudBucketConfig>({
    bucketName: 'corp-customer-backups-2024',
    acl: 'public-read-write',
    versioningEnabled: false,
    encryptionEnabled: false,
    blockPublicAccess: false,
    rolePolicy: 'overly-permissive-admin'
  });

  const [result, setResult] = useState<CloudProbeResult | null>(null);
  const [startTime] = useState<number>(Date.now());
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleSimulateProbe = () => {
    setResult(probeCloudSecurity(config));
  };

  const handleFinish = () => {
    if (!result) return;
    const duration = Math.max(1, Math.round((Date.now() - startTime) / 1000));
    const securityScore = Math.max(0, 100 - result.riskScore);

    onComplete({
      tool_name: 'cloud_security',
      risk_tier: result.riskTier,
      score: securityScore,
      duration_seconds: duration,
      metadata: {
        bucketAcl: config.acl,
        encryptionEnabled: config.encryptionEnabled,
        blockPublicAccess: config.blockPublicAccess,
        rolePolicy: config.rolePolicy,
        dataExposed: result.dataExposed
      }
    });
    setHasSubmitted(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-lg bg-cyan-950/80 border border-cyan-800 flex items-center justify-center text-cyan-400">
            <Cloud className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Cloud Storage (S3 / Blob) Security & IAM Simulator</h2>
            <p className="text-xs text-slate-400">
              Interactive sandbox modeling public ACLs, unencrypted data at rest, ransomware tampering, and wildcard IAM escalation.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-xs bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-emerald-400">
          <ShieldAlert className="h-3.5 w-3.5" />
          <span>Zero Real Cloud Access / Isolated Sandbox</span>
        </div>
      </div>

      {/* Cloud Console Simulator Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Server className="h-4 w-4 text-cyan-400" />
            Cloud Storage Bucket Policy Console
          </span>
          <span className="text-xs font-mono text-cyan-400">s3://{config.bucketName}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          {/* Bucket ACL */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-medium">Access Control List (ACL):</label>
            <select
              value={config.acl}
              onChange={(e) => setConfig({ ...config, acl: e.target.value as any })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="private">private (Owner Only - Secure)</option>
              <option value="public-read">public-read (Anonymous Read Access)</option>
              <option value="public-read-write">public-read-write (Anonymous Read & Write - Critical Risk)</option>
            </select>
          </div>

          {/* S3 Block Public Access */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-medium">S3 Block Public Access Setting:</label>
            <select
              value={config.blockPublicAccess ? 'true' : 'false'}
              onChange={(e) => setConfig({ ...config, blockPublicAccess: e.target.value === 'true' })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="true">Enabled (Enforce strict account-level public blocking)</option>
              <option value="false">Disabled (Allow public bucket policies)</option>
            </select>
          </div>

          {/* Encryption at rest */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-medium flex items-center gap-1.5">
              <Database className="h-3.5 w-3.5 text-cyan-400" />
              Default Server-Side Encryption (SSE):
            </label>
            <select
              value={config.encryptionEnabled ? 'true' : 'false'}
              onChange={(e) => setConfig({ ...config, encryptionEnabled: e.target.value === 'true' })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="true">Enabled (SSE-KMS Customer Managed Key)</option>
              <option value="false">Disabled (Plaintext storage at rest)</option>
            </select>
          </div>

          {/* Object versioning */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-medium">Object Versioning & Anti-Ransomware:</label>
            <select
              value={config.versioningEnabled ? 'true' : 'false'}
              onChange={(e) => setConfig({ ...config, versioningEnabled: e.target.value === 'true' })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="true">Enabled (Preserve prior object versions on overwrite)</option>
              <option value="false">Disabled (Overwriting destroys previous object)</option>
            </select>
          </div>

          {/* IAM Role Policy */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-slate-300 font-medium flex items-center gap-1.5">
              <Key className="h-3.5 w-3.5 text-cyan-400" />
              Attached IAM Application Role Policy:
            </label>
            <select
              value={config.rolePolicy}
              onChange={(e) => setConfig({ ...config, rolePolicy: e.target.value as any })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="strict-least-privilege">Principle of Least Privilege (Action: s3:GetObject only on this bucket)</option>
              <option value="overly-permissive-admin">Overly Permissive Wildcard (Action: * on Resource: * - Critical Risk)</option>
            </select>
          </div>
        </div>

        {/* Quick config presets */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span>Presets:</span>
            <button
              type="button"
              onClick={() => {
                const c: CloudBucketConfig = {
                  bucketName: 'leaked-finance-backups',
                  acl: 'public-read-write',
                  versioningEnabled: false,
                  encryptionEnabled: false,
                  blockPublicAccess: false,
                  rolePolicy: 'overly-permissive-admin'
                };
                setConfig(c);
                setResult(probeCloudSecurity(c));
              }}
              className="px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800 text-rose-300 font-mono"
            >
              Worst Case (Full Breach)
            </button>
            <button
              type="button"
              onClick={() => {
                const c: CloudBucketConfig = {
                  bucketName: 'hardened-production-vault',
                  acl: 'private',
                  versioningEnabled: true,
                  encryptionEnabled: true,
                  blockPublicAccess: true,
                  rolePolicy: 'strict-least-privilege'
                };
                setConfig(c);
                setResult(probeCloudSecurity(c));
              }}
              className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-300 font-mono"
            >
              Hardened (Zero Trust)
            </button>
          </div>

          <Button onClick={handleSimulateProbe} variant="primary">
            Simulate Attacker Audit
          </Button>
        </div>
      </div>

      {/* Audit Probe Results */}
      {result && (
        <div className="space-y-5">
          {/* Summary Badges */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-xs uppercase font-mono text-slate-400">Security Posture</span>
              <div className="mt-2 flex items-center space-x-2">
                <Badge tier={result.riskTier}>{result.riskTier} RISK</Badge>
                <span className="text-xs text-slate-400">Score: {100 - result.riskScore}/100</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-xs uppercase font-mono text-slate-400">Data Leak Status</span>
              <div className="mt-2">
                {result.dataExposed ? (
                  <Badge variant="danger">LEAKED (Unauthenticated)</Badge>
                ) : (
                  <Badge variant="success">PROTECTED (Private)</Badge>
                )}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-xs uppercase font-mono text-slate-400">Ransomware Exposure</span>
              <div className="mt-2">
                {result.ransomwareVulnerable ? (
                  <Badge variant="danger">CRITICAL VULNERABILITY</Badge>
                ) : (
                  <Badge variant="success">SAFE (Versioned)</Badge>
                )}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-xs uppercase font-mono text-slate-400">Findings Count</span>
              <div className="mt-2 text-xl font-bold text-white">
                {result.findings.length} Finding(s)
              </div>
            </div>
          </div>

          {/* Findings & Remediation list */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <span>Simulated Attacker Probe Observations</span>
            </h3>

            {result.findings.length === 0 ? (
              <div className="p-4 rounded-lg bg-emerald-950/40 border border-emerald-900/60 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Zero security misconfigurations detected. Storage conforms to CIS Cloud Benchmarks!</span>
              </div>
            ) : (
              <div className="space-y-3">
                {result.findings.map((finding, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{finding.category}</span>
                      <Badge tier={finding.severity}>{finding.severity}</Badge>
                    </div>
                    <p className="text-slate-400">{finding.issue}</p>
                    <div className="p-2.5 rounded bg-cyan-950/30 border border-cyan-900/40 text-cyan-300 font-mono text-[11px]">
                      <strong>Remediation:</strong> {finding.remediation}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Record button */}
          <div className="flex justify-end pt-2">
            <Button
              onClick={handleFinish}
              disabled={hasSubmitted}
              variant="primary"
              size="lg"
            >
              {hasSubmitted ? (
                <span className="flex items-center space-x-2 text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Activity Recorded to Instructor Analytics!</span>
                </span>
              ) : (
                <span className="flex items-center space-x-2">
                  <Sparkles className="h-4 w-4" />
                  <span>Record Analysis to Session Telemetry</span>
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
