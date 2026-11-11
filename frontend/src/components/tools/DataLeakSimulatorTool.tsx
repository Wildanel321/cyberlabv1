import React, { useState } from 'react';
import { UserCheck, ShieldAlert, CheckCircle2, AlertTriangle, Eye } from 'lucide-react';
import { analyzePersonalDataLeak } from '../../utils/dataLeakSimulator';
import { PiiAnalysisResult, RiskTier } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface ToolProps {
  onComplete: (data: { tool_name: string; risk_tier: RiskTier; score: number; duration_seconds: number; metadata: any }) => void;
}

export const DataLeakSimulatorTool: React.FC<ToolProps> = ({ onComplete }) => {
  const [textInput, setTextInput] = useState('');
  const [result, setResult] = useState<PiiAnalysisResult | null>(null);
  const [startTime] = useState<number>(Date.now());
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleScan = () => {
    if (!textInput.trim()) return;
    setResult(analyzePersonalDataLeak(textInput));
  };

  const handleFinish = () => {
    if (!result) return;
    const duration = Math.max(1, Math.round((Date.now() - startTime) / 1000));

    onComplete({
      tool_name: 'data_leak',
      risk_tier: result.overallRiskTier,
      score: result.securityScore,
      duration_seconds: duration,
      metadata: {
        totalDetections: result.totalDetections,
        detectionTypes: Array.from(new Set(result.detections.map(d => d.type)))
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
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Personal Data Leak & Redaction Simulator</h2>
            <p className="text-xs text-slate-400">
              Detects Indonesian NIK (16-digit ID), Emails, Phone numbers (+62 / 08), Credit Cards (Luhn algorithm), and provides instant masking.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-xs bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-emerald-400">
          <ShieldAlert className="h-3.5 w-3.5" />
          <span>UU PDP Compliant / Local Redaction</span>
        </div>
      </div>

      {/* Input Text Area */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <label className="block text-sm font-medium text-slate-200">
          Paste Text to Inspect for PII Leaks
        </label>
        <textarea
          rows={4}
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="Paste message, customer support ticket, or chat snippet with sample data..."
          className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white font-mono placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm"
        />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Preset buttons */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className="text-slate-400">Samples:</span>
            <button
              type="button"
              onClick={() => {
                const sample = 'Nama saya Budi Santoso, NIK: 3171010105950001, no HP 081234567890, alamat di Jalan Sudirman No. 45 Jakarta Pusat.';
                setTextInput(sample);
                setResult(analyzePersonalDataLeak(sample));
              }}
              className="min-h-[44px] px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-slate-200 font-mono text-xs transition-colors"
            >
              Indonesian NIK + Phone
            </button>
            <button
              type="button"
              onClick={() => {
                const sample = 'Mohon konfirmasi pembayaran kartu 4532-0150-1234-5678 dengan email finance@perusahaan.co.id.';
                setTextInput(sample);
                setResult(analyzePersonalDataLeak(sample));
              }}
              className="min-h-[44px] px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-slate-200 font-mono text-xs transition-colors"
            >
              Credit Card + Email
            </button>
          </div>

          <Button onClick={handleScan} disabled={!textInput.trim()} variant="primary" className="min-h-[44px] w-full sm:w-auto">
            Scan & Redact
          </Button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-5">
          {/* Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-xs uppercase font-mono text-slate-400">Exposure Severity</span>
              <div className="mt-2 flex items-center space-x-2">
                <Badge tier={result.overallRiskTier}>{result.overallRiskTier} RISK</Badge>
                <span className="text-xs text-slate-400">Score: {result.securityScore}/100</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-xs uppercase font-mono text-slate-400">PII Entities Discovered</span>
              <div className="mt-2">
                <span className="text-2xl font-bold text-white">{result.totalDetections}</span>
                <span className="text-xs text-slate-400 ml-2">item(s)</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-xs uppercase font-mono text-slate-400">Identity Risk Impact</span>
              <div className="mt-2">
                <span className="text-xs text-slate-300 font-medium">
                  {result.overallRiskTier === 'CRITICAL' ? 'High probability of identity theft & fraud' : 'Low to moderate exposure'}
                </span>
              </div>
            </div>
          </div>

          {/* Masked Output Preview */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Eye className="h-4 w-4 text-cyan-400" />
                <span>Sanitized & Masked Output Preview</span>
              </h3>
              <span className="text-[11px] font-mono text-emerald-400">Safe for Public / AI Processing</span>
            </div>
            <pre className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 whitespace-pre-wrap">
              {result.maskedText}
            </pre>
          </div>

          {/* Detected Items Breakdown */}
          {result.detections.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <span>Specific PII Entities Flagged</span>
              </h3>
              <div className="space-y-2">
                {result.detections.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white font-mono">{item.type}</span>
                        <Badge tier={item.impactTier}>{item.impactTier}</Badge>
                      </div>
                      <p className="text-slate-400 mt-1">{item.description}</p>
                    </div>
                    <div className="font-mono text-left sm:text-right shrink-0 flex flex-wrap items-center gap-1.5">
                      <span className="text-rose-400 line-through">{item.rawSnippet}</span>
                      <span className="text-slate-500">to</span>
                      <span className="text-emerald-400">{item.maskedSnippet}</span>
                    </div>
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
