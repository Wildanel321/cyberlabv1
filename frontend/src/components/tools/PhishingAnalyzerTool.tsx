import React, { useState } from 'react';
import { Globe, ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { analyzePhishingUrl } from '../../utils/phishingAnalyzer';
import { PhishingAnalysisResult, RiskTier } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface ToolProps {
  onComplete: (data: { tool_name: string; risk_tier: RiskTier; score: number; duration_seconds: number; metadata: any }) => void;
}

export const PhishingAnalyzerTool: React.FC<ToolProps> = ({ onComplete }) => {
  const [urlInput, setUrlInput] = useState('');
  const [result, setResult] = useState<PhishingAnalysisResult | null>(null);
  const [startTime] = useState<number>(Date.now());
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleAnalyze = () => {
    if (!urlInput.trim()) return;
    setResult(analyzePhishingUrl(urlInput));
  };

  const handleFinish = () => {
    if (!result) return;
    const duration = Math.max(1, Math.round((Date.now() - startTime) / 1000));
    // Score in DB represents security score (100 - riskScore)
    const securityScore = Math.max(0, 100 - result.riskScore);

    onComplete({
      tool_name: 'phishing_analyzer',
      risk_tier: result.riskTier,
      score: securityScore,
      duration_seconds: duration,
      metadata: {
        hostname: result.hostname,
        isHttps: result.isHttps,
        isIpAddress: result.isIpAddress,
        hasPunycode: result.hasPunycode,
        findingsCount: result.findings.length
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
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Phishing URL & Threat Heuristics Analyzer</h2>
            <p className="text-xs text-slate-400">
              Evaluates punycode spoofing, IP hostnames, credential injection, and abusive top-level domains without navigating.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-xs bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-emerald-400">
          <ShieldAlert className="h-3.5 w-3.5" />
          <span>Zero-Crawling: Safe offline parser</span>
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <label className="block text-sm font-medium text-slate-200">
          Enter Suspicious URL / Link
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
            placeholder="e.g. https://paypal.com-security-verification.xyz/login"
            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white font-mono placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm"
          />
          <Button onClick={handleAnalyze} disabled={!urlInput.trim()} variant="primary">
            Analyze URL
          </Button>
        </div>

        {/* Preset attack samples */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 pt-1">
          <span className="text-slate-400">Samples:</span>
          <button
            type="button"
            onClick={() => {
              setUrlInput('http://192.168.1.100/login/bca-klik');
              setResult(analyzePhishingUrl('http://192.168.1.100/login/bca-klik'));
            }}
            className="min-h-[44px] px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-slate-200 font-mono text-xs transition-colors"
          >
            Direct IP Phish
          </button>
          <button
            type="button"
            onClick={() => {
              setUrlInput('https://xn--appl-43d.com/support');
              setResult(analyzePhishingUrl('https://xn--appl-43d.com/support'));
            }}
            className="min-h-[44px] px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-slate-200 font-mono text-xs transition-colors"
          >
            Punycode Homograph
          </button>
          <button
            type="button"
            onClick={() => {
              setUrlInput('https://bca.klik.com-verification-account.xyz/update');
              setResult(analyzePhishingUrl('https://bca.klik.com-verification-account.xyz/update'));
            }}
            className="min-h-[44px] px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-slate-200 font-mono text-xs transition-colors"
          >
            Subdomain Spoof
          </button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-5">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-xs uppercase font-mono text-slate-400">Risk Assessment</span>
              <div className="mt-2 flex items-center space-x-2">
                <Badge tier={result.riskTier}>{result.riskTier} RISK</Badge>
                <span className="text-xs font-mono text-slate-400">({result.riskScore}/100)</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-xs uppercase font-mono text-slate-400">Protocol</span>
              <div className="mt-2 flex items-center space-x-2">
                {result.isHttps ? (
                  <Badge variant="success">HTTPS (Encrypted)</Badge>
                ) : (
                  <Badge variant="danger">HTTP (Plaintext)</Badge>
                )}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-xs uppercase font-mono text-slate-400">Hostname Type</span>
              <div className="mt-2">
                <span className="text-xs font-mono font-semibold text-slate-200">
                  {result.isIpAddress ? 'Raw IP Address (Hostile)' : result.hostname}
                </span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-xs uppercase font-mono text-slate-400">Heuristic Flags</span>
              <div className="mt-2">
                <span className="text-lg font-bold text-white">{result.findings.length} Flagged</span>
              </div>
            </div>
          </div>

          {/* Detailed Findings */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <span>Structural Anomaly Findings</span>
            </h3>

            {result.findings.length === 0 ? (
              <div className="p-4 rounded-lg bg-emerald-950/30 border border-emerald-900/50 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>No high-risk phishing indicators detected in the URL structure.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {result.findings.map((f, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col gap-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">{f.title}</span>
                      <Badge tier={f.severity}>{f.severity}</Badge>
                    </div>
                    <p className="text-slate-400">{f.description}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Recommendations */}
            <div className="pt-3 border-t border-slate-800">
              <span className="text-xs font-mono text-slate-400 uppercase">Educational Guidance:</span>
              <ul className="text-xs text-slate-300 list-disc list-inside mt-1.5 space-y-1">
                {result.recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Record button */}
          <div className="flex justify-end pt-2">
            <Button
              onClick={handleFinish}
              disabled={hasSubmitted}
              variant="primary"
              size="lg"
              className="w-full sm:w-auto min-h-[44px]"
            >
              {hasSubmitted ? (
                <span className="flex items-center justify-center space-x-2 text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Activity Recorded</span>
                </span>
              ) : (
                <span className="flex items-center justify-center space-x-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Record Telemetry</span>
                </span>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
