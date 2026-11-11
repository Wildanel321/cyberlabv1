import React, { useState, useEffect } from 'react';
import { Smartphone, ShieldAlert, KeyRound, AlertTriangle, CheckCircle2, Lock, Unlock } from 'lucide-react';
import { generateSimulatedTotp, runAttackerSimulation } from '../../utils/twoFactorSimulator';
import { RiskTier } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface ToolProps {
  onComplete: (data: { tool_name: string; risk_tier: RiskTier; score: number; duration_seconds: number; metadata: any }) => void;
}

export const TwoFactorSimulatorTool: React.FC<ToolProps> = ({ onComplete }) => {
  const [enable2FA, setEnable2FA] = useState(false);
  const [totpInfo, setTotpInfo] = useState(generateSimulatedTotp());
  const [simulationResult, setSimulationResult] = useState<ReturnType<typeof runAttackerSimulation> | null>(null);
  const [userCode, setUserCode] = useState('');
  const [otpVerifyStatus, setOtpVerifyStatus] = useState<'IDLE' | 'CORRECT' | 'WRONG' | 'LOCKED'>('IDLE');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [startTime] = useState<number>(Date.now());
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Timer loop for TOTP code rotation (every second)
  useEffect(() => {
    const timer = setInterval(() => {
      setTotpInfo(generateSimulatedTotp());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRunAttack = (withMfa: boolean) => {
    setEnable2FA(withMfa);
    const result = runAttackerSimulation(withMfa);
    setSimulationResult(result);
  };

  const handleVerifyOtp = () => {
    if (failedAttempts >= 3) {
      setOtpVerifyStatus('LOCKED');
      return;
    }
    if (userCode.trim() === totpInfo.code) {
      setOtpVerifyStatus('CORRECT');
    } else {
      const nextFailed = failedAttempts + 1;
      setFailedAttempts(nextFailed);
      if (nextFailed >= 3) {
        setOtpVerifyStatus('LOCKED');
      } else {
        setOtpVerifyStatus('WRONG');
      }
    }
  };

  const handleFinish = () => {
    const duration = Math.max(1, Math.round((Date.now() - startTime) / 1000));
    const score = enable2FA ? 95 : 20;
    const tier: RiskTier = enable2FA ? 'LOW' : 'CRITICAL';

    onComplete({
      tool_name: 'two_factor',
      risk_tier: tier,
      score,
      duration_seconds: duration,
      metadata: {
        mfaEnabled: enable2FA,
        attackerCompromisePrevented: enable2FA,
        totpVerified: otpVerifyStatus === 'CORRECT'
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
            <Smartphone className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">2-Factor Authentication (2FA) & Credential Stuffing Simulator</h2>
            <p className="text-xs text-slate-400">
              Compares single-factor password vulnerability vs RFC 6238 TOTP authentication and brute force lockout defenses.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-xs bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-cyan-400">
          <KeyRound className="h-3.5 w-3.5" />
          <span>Interactive Attack Vector Simulator</span>
        </div>
      </div>

      {/* Mode selection buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Scenario 1: Password Only */}
        <div
          onClick={() => handleRunAttack(false)}
          className={`cursor-pointer rounded-xl p-5 border transition-all ${
            !enable2FA && simulationResult
              ? 'bg-rose-950/30 border-rose-600/80 shadow-lg shadow-rose-950/50'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-rose-400">
              <Unlock className="h-5 w-5" />
              <span className="font-bold text-sm">Scenario A: Single-Factor Only</span>
            </div>
            <Badge variant="danger">Vulnerable</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            The target user relies solely on a password. Simulate what happens when an attacker replays leaked credentials.
          </p>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleRunAttack(false);
            }}
            variant="danger"
            size="sm"
            className="mt-4 w-full min-h-[44px]"
          >
            Launch Attack (No 2FA)
          </Button>
        </div>

        {/* Scenario 2: Password + 2FA */}
        <div
          onClick={() => handleRunAttack(true)}
          className={`cursor-pointer rounded-xl p-5 border transition-all ${
            enable2FA && simulationResult
              ? 'bg-emerald-950/30 border-emerald-600/80 shadow-lg shadow-emerald-950/50'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-emerald-400">
              <Lock className="h-5 w-5" />
              <span className="font-bold text-sm">Scenario B: Defense-in-Depth (2FA Enabled)</span>
            </div>
            <Badge variant="success">Hardened</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            The target account enforces 6-digit TOTP authentication. Even if the password is known, the attacker is challenged.
          </p>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleRunAttack(true);
            }}
            variant="primary"
            size="sm"
            className="mt-4 w-full min-h-[44px]"
          >
            Launch Attack (With 2FA)
          </Button>
        </div>
      </div>

      {/* Interactive TOTP Authenticator Demo Widget */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Virtual Mobile Authenticator */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2 text-white text-xs font-semibold">
              <Smartphone className="h-4 w-4 text-cyan-400" />
              <span>Simulated Mobile Authenticator App</span>
            </div>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
              Rotates every 30s
            </span>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 text-center space-y-3">
            <span className="text-xs text-slate-400">CyberGuard Lab (user@cyberguard.id)</span>
            <div className="text-4xl sm:text-5xl font-mono font-extrabold tracking-widest text-cyan-400 select-all">
              {totpInfo.code}
            </div>
            <div className="flex items-center justify-center space-x-2 text-xs text-slate-400">
              <span>Code expires in:</span>
              <span className="font-mono font-bold text-amber-400">{totpInfo.remainingSeconds}s</span>
            </div>
            {/* Visual timer countdown bar */}
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-400 transition-all duration-1000"
                style={{ width: `${(totpInfo.remainingSeconds / 30) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Challenge Verification Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 text-white text-xs font-semibold">
                <KeyRound className="h-4 w-4 text-cyan-400" />
                <span>Simulated Login Verification Barrier</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Attempts: {failedAttempts}/3
              </span>
            </div>

            <p className="text-xs text-slate-400 mt-3">
              Enter the 6-digit TOTP token displayed on the left to complete authentication:
            </p>

            <div className="mt-4 flex gap-2">
              <input
                type="text"
                maxLength={6}
                value={userCode}
                onChange={(e) => setUserCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-center font-mono text-xl tracking-widest text-white focus:outline-none focus:border-cyan-500"
              />
              <Button onClick={handleVerifyOtp} variant="primary" disabled={userCode.length !== 6}>
                Verify OTP
              </Button>
            </div>

            {/* Status alerts */}
            <div className="mt-3">
              {otpVerifyStatus === 'CORRECT' && (
                <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>2FA Verification Succeeded! Secure session initiated.</span>
                </div>
              )}
              {otpVerifyStatus === 'WRONG' && (
                <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
                  <span>Invalid OTP code. {3 - failedAttempts} attempt(s) remaining before account lockout!</span>
                </div>
              )}
              {otpVerifyStatus === 'LOCKED' && (
                <div className="p-3 rounded-lg bg-rose-950 border border-rose-700 text-rose-200 text-xs flex items-center space-x-2">
                  <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0" />
                  <span>SECURITY LOCKOUT ACTIVATED: Too many failed attempts. Brute force defeated.</span>
                </div>
              )}
            </div>
          </div>

          <div className="text-[11px] text-slate-500 border-t border-slate-800 pt-3">
            Pedagogical note: Attackers cannot guess a 6-digit code in 3 attempts out of 1,000,000 possibilities.
          </div>
        </div>
      </div>

      {/* Attacker Terminal Logs */}
      {simulationResult && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-rose-500"></span>
              Attacker Simulation Telemetry Terminal
            </span>
            <span className="text-slate-500">Target: corporate-sso.cyberguard.id</span>
          </div>
          <div className="space-y-1.5 pt-1 text-slate-300">
            {simulationResult.logs.map((log, i) => (
              <div
                key={i}
                className={
                  log.includes('[CRITICAL]') || log.includes('[COMPROMISE]')
                    ? 'text-rose-400 font-bold'
                    : log.includes('[DEFENSE]') || log.includes('[SUCCESS]')
                    ? 'text-emerald-400 font-bold'
                    : log.includes('[ATTACKER]')
                    ? 'text-amber-400'
                    : 'text-slate-400'
                }
              >
                {log}
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
  );
};
