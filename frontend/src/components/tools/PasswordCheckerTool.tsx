import React, { useState, useEffect } from 'react';
import { KeyRound, ShieldAlert, CheckCircle2, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { analyzePassword } from '../../utils/passwordChecker';
import { PasswordAnalysisResult, RiskTier } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface ToolProps {
  onComplete: (data: { tool_name: string; risk_tier: RiskTier; score: number; duration_seconds: number; metadata: any }) => void;
}

export const PasswordCheckerTool: React.FC<ToolProps> = ({ onComplete }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [result, setResult] = useState<PasswordAnalysisResult>(analyzePassword(''));
  const [startTime] = useState<number>(Date.now());
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    setResult(analyzePassword(password));
  }, [password]);

  const handleFinish = () => {
    const duration = Math.max(1, Math.round((Date.now() - startTime) / 1000));
    let tier: RiskTier = 'LOW';
    if (result.score < 40) tier = 'CRITICAL';
    else if (result.score < 65) tier = 'HIGH';
    else if (result.score < 80) tier = 'MEDIUM';

    onComplete({
      tool_name: 'password_checker',
      risk_tier: tier,
      score: result.score,
      duration_seconds: duration,
      metadata: {
        entropy: result.entropy,
        strength: result.strength,
        crackTime: result.crackTimeDisplay,
        patternsDetected: result.matchedPatterns.length,
      }
    });
    setHasSubmitted(true);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 bg-emerald-500';
    if (score >= 60) return 'text-cyan-400 bg-cyan-500';
    if (score >= 40) return 'text-amber-400 bg-amber-500';
    return 'text-rose-400 bg-rose-500';
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-lg bg-cyan-950/80 border border-cyan-800 flex items-center justify-center text-cyan-400">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Password Security & Entropy Analyzer</h2>
            <p className="text-xs text-slate-400">
              Evaluates Shannon entropy, dictionary lookups, pattern walks, and GPU cluster crack time.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-xs bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-emerald-400">
          <ShieldAlert className="h-3.5 w-3.5" />
          <span>Client-Side Only: Never transmitted to server</span>
        </div>
      </div>

      {/* Input area */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <label className="block text-sm font-medium text-slate-200">
          Test Password / Passphrase
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Type or paste any password to evaluate..."
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 pr-12 text-white font-mono placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm sm:text-base"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {/* Quick sample pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 pt-1">
          <span className="text-slate-400">Samples:</span>
          <button
            type="button"
            onClick={() => setPassword('password123')}
            className="min-h-[44px] px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-slate-200 font-mono text-xs transition-colors"
          >
            password123
          </button>
          <button
            type="button"
            onClick={() => setPassword('Admin!2024')}
            className="min-h-[44px] px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-slate-200 font-mono text-xs transition-colors"
          >
            Admin!2024
          </button>
          <button
            type="button"
            onClick={() => setPassword('Correct-Horse-Battery-Staple-99!')}
            className="min-h-[44px] px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-slate-200 font-mono text-xs transition-colors"
          >
            Correct-Horse-Battery-Staple-99!
          </button>
        </div>
      </div>

      {/* Analysis Results Display */}
      {password && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Score & Gauge */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <span className="text-xs uppercase font-mono text-slate-400">Security Score</span>
              <div className="flex items-baseline space-x-2 mt-2">
                <span className={`text-4xl font-extrabold ${getScoreColor(result.score).split(' ')[0]}`}>
                  {result.score}
                </span>
                <span className="text-sm text-slate-500">/ 100</span>
                <Badge variant={result.score >= 70 ? 'success' : result.score >= 40 ? 'warning' : 'danger'}>
                  {result.strength}
                </Badge>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-800 h-2.5 rounded-full mt-4 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${getScoreColor(result.score).split(' ')[1]}`}
                  style={{ width: `${result.score}%` }}
                />
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Shannon Entropy:</span>
                <span className="font-mono text-cyan-400 font-semibold">{result.entropy} bits</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">GPU Cluster Crack Time:</span>
                <span className="font-mono text-amber-300 font-semibold">{result.crackTimeDisplay}</span>
              </div>
            </div>
          </div>

          {/* Complexity Breakdown */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <span className="text-xs uppercase font-mono text-slate-400">Character Attributes</span>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-slate-950">
                <span className="text-slate-300">Length &ge; 12 chars</span>
                {result.hasLength ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-rose-400" />
                )}
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-950">
                <span className="text-slate-300">Uppercase Letters (A-Z)</span>
                {result.hasUpper ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-rose-400" />
                )}
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-950">
                <span className="text-slate-300">Lowercase Letters (a-z)</span>
                {result.hasLower ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-rose-400" />
                )}
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-950">
                <span className="text-slate-300">Numbers (0-9)</span>
                {result.hasDigit ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-rose-400" />
                )}
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-950">
                <span className="text-slate-300">Special Characters (!@#$)</span>
                {result.hasSpecial ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-rose-400" />
                )}
              </div>
            </div>
          </div>

          {/* Patterns & Warnings */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 flex flex-col justify-between">
            <div>
              <span className="text-xs uppercase font-mono text-slate-400">Vulnerability Flags</span>
              {result.matchedPatterns.length > 0 ? (
                <div className="space-y-2 mt-2">
                  {result.matchedPatterns.map((pat, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded bg-rose-950/40 border border-rose-900/50 text-rose-300 text-xs flex items-start space-x-2"
                    >
                      <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                      <span>{pat}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded bg-emerald-950/40 border border-emerald-900/50 text-emerald-300 text-xs flex items-center space-x-2 mt-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>No dictionary or sequential patterns identified.</span>
                </div>
              )}
            </div>

            {/* Recommendations */}
            <div className="pt-3 border-t border-slate-800">
              <span className="text-[11px] font-mono text-slate-400 uppercase">Remediation:</span>
              <ul className="text-xs text-slate-300 list-disc list-inside mt-1 space-y-1">
                {result.recommendations.slice(0, 2).map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Submit / Record Activity Button */}
      <div className="flex justify-end pt-2">
        <Button
          onClick={handleFinish}
          disabled={!password || hasSubmitted}
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
  );
};
