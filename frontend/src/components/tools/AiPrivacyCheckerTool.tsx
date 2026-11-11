import React, { useState } from 'react';
import { Bot, ShieldAlert, AlertTriangle, CheckCircle2, Copy, ShieldCheck } from 'lucide-react';
import { analyzeAiPromptPrivacy } from '../../utils/aiPrivacyChecker';
import { AiPrivacyAnalysisResult, RiskTier } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface ToolProps {
  onComplete: (data: { tool_name: string; risk_tier: RiskTier; score: number; duration_seconds: number; metadata: any }) => void;
}

export const AiPrivacyCheckerTool: React.FC<ToolProps> = ({ onComplete }) => {
  const [promptInput, setPromptInput] = useState('');
  const [result, setResult] = useState<AiPrivacyAnalysisResult | null>(null);
  const [startTime] = useState<number>(Date.now());
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleScan = () => {
    if (!promptInput.trim()) return;
    setResult(analyzeAiPromptPrivacy(promptInput));
  };

  const handleCopySanitized = () => {
    if (!result?.sanitizedPrompt) return;
    navigator.clipboard.writeText(result.sanitizedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFinish = () => {
    if (!result) return;
    const duration = Math.max(1, Math.round((Date.now() - startTime) / 1000));

    onComplete({
      tool_name: 'ai_privacy',
      risk_tier: result.riskTier,
      score: result.securityScore,
      duration_seconds: duration,
      metadata: {
        secretsFound: result.findings.length,
        categories: Array.from(new Set(result.findings.map(f => f.category)))
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
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">AI Prompt Privacy & Secret Scanner</h2>
            <p className="text-xs text-slate-400">
              Scans LLM prompts for leaked OpenAI keys, AWS IAM keys, GitHub tokens, hardcoded passwords, and enterprise secrets.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-xs bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-emerald-400">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>No Data Sent to External AI Models</span>
        </div>
      </div>

      {/* Input area */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <label className="block text-sm font-medium text-slate-200">
          Enter Prompt or Code Intended for ChatGPT / Claude / Gemini
        </label>
        <textarea
          rows={5}
          value={promptInput}
          onChange={(e) => setPromptInput(e.target.value)}
          placeholder="Paste AI system prompt, python script with API keys, or database query..."
          className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white font-mono placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm"
        />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Preset buttons */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className="text-slate-400">Samples:</span>
            <button
              type="button"
              onClick={() => {
                const sample = 'Please debug my Python script:\nimport openai\nclient = openai.OpenAI(api_key="sk-proj-999abcd1234efgh5678ijkl9012mnop3456qrst7890")\nresponse = client.chat.completions.create(model="gpt-4o")';
                setPromptInput(sample);
                setResult(analyzeAiPromptPrivacy(sample));
              }}
              className="min-h-[44px] px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-slate-200 font-mono text-xs transition-colors"
            >
              Leaked OpenAI Key
            </button>
            <button
              type="button"
              onClick={() => {
                const sample = 'Help write a docker-compose connecting to: postgresql://admin:SuperSecretPass123!@db.internal.corp:5432/finance_production with AWS key AKIAIOSFODNN7EXAMPLE.';
                setPromptInput(sample);
                setResult(analyzeAiPromptPrivacy(sample));
              }}
              className="min-h-[44px] px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-slate-200 font-mono text-xs transition-colors"
            >
              AWS Key + DB Creds
            </button>
          </div>

          <Button onClick={handleScan} disabled={!promptInput.trim()} variant="primary" className="min-h-[44px] w-full sm:w-auto">
            Scan Prompt
          </Button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-5">
          {/* Severity & Score */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-xs uppercase font-mono text-slate-400">Threat Severity</span>
              <div className="mt-2 flex items-center space-x-2">
                <Badge tier={result.riskTier}>{result.riskTier} RISK</Badge>
                <span className="text-xs text-slate-400">Score: {result.securityScore}/100</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-xs uppercase font-mono text-slate-400">High-Risk Secrets Found</span>
              <div className="mt-2">
                <span className="text-2xl font-bold text-white">{result.findings.length}</span>
                <span className="text-xs text-slate-400 ml-2">token(s)</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-xs uppercase font-mono text-slate-400">Corporate Compliance</span>
              <div className="mt-2 text-xs font-medium">
                {result.riskTier === 'CRITICAL' ? (
                  <span className="text-rose-400">VIOLATION: Secret exposure in public AI</span>
                ) : (
                  <span className="text-emerald-400">Clean: Prompt safe for public LLM use</span>
                )}
              </div>
            </div>
          </div>

          {/* Sanitized Prompt Export */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-emerald-400" />
                <span>Sanitized Prompt (Safe for AI Queries)</span>
              </h3>
              <Button onClick={handleCopySanitized} variant="outline" size="sm">
                <Copy className="h-3.5 w-3.5 mr-1.5" />
                {copied ? 'Copied!' : 'Copy Sanitized'}
              </Button>
            </div>
            <pre className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 whitespace-pre-wrap">
              {result.sanitizedPrompt}
            </pre>
          </div>

          {/* Findings List */}
          {result.findings.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-400" />
                <span>Detected Security Anomalies</span>
              </h3>
              <div className="space-y-2.5">
                {result.findings.map((finding, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{finding.label}</span>
                        <Badge tier={finding.riskTier}>{finding.riskTier}</Badge>
                      </div>
                      <p className="text-slate-400 mt-1">{finding.explanation}</p>
                    </div>
                    <span className="font-mono text-rose-400 bg-rose-950/40 px-2 py-1 rounded border border-rose-900/60 shrink-0">
                      {finding.tokenPreview}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

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
