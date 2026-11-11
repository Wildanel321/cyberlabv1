import React, { useState } from 'react';
import { UserCheck, ShieldAlert, CheckCircle2, AlertTriangle, KeyRound, Smartphone, Bell, Globe, Check } from 'lucide-react';
import {
  evaluateAccountSecurity,
  AccountAuditConfig,
  PRESET_ACCOUNT_SCENARIOS,
} from '../../utils/accountSecurityEvaluator';
import { RiskTier } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface ToolProps {
  onComplete: (data: { tool_name: string; risk_tier: RiskTier; score: number; duration_seconds: number; metadata: any }) => void;
}

export const AccountSecurityEvaluatorTool: React.FC<ToolProps> = ({ onComplete }) => {
  const [config, setConfig] = useState<AccountAuditConfig>(PRESET_ACCOUNT_SCENARIOS[0].config);
  const [selectedPresetId, setSelectedPresetId] = useState<string>(PRESET_ACCOUNT_SCENARIOS[0].id);
  const [startTime] = useState<number>(() => Date.now());
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const result = evaluateAccountSecurity(config);

  const handleSelectPreset = (preset: typeof PRESET_ACCOUNT_SCENARIOS[0]) => {
    setSelectedPresetId(preset.id);
    setConfig(preset.config);
  };

  const handleFinish = () => {
    const duration = Math.max(1, Math.round((Date.now() - startTime) / 1000));

    onComplete({
      tool_name: 'account_evaluator',
      risk_tier: result.overallRiskTier,
      score: result.securityScore,
      duration_seconds: duration,
      metadata: {
        accountType: config.accountType,
        accountHealth: result.accountHealth,
        criticalFindingsCount: result.criticalFindingsCount,
        hasTwoFactorAuth: config.hasTwoFactorAuth,
        mfaMethod: config.mfaMethod,
        passwordReusedAcrossSites: config.passwordReusedAcrossSites,
        activeSessionCount: config.activeSessionCount,
      },
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
            <h2 className="text-lg font-bold text-white">Evaluasi Keamanan Akun (Account Security Audit)</h2>
            <p className="text-xs text-slate-400">
              Audit menyeluruh postur keamanan akun personal & institusi: kredensial, 2FA/MFA, sesi aktif, dan hak akses OAuth pihak ketiga.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-xs bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-emerald-400">
          <ShieldAlert className="h-3.5 w-3.5" />
          <span>NIST SP 800-63B / Zero-Trust Account Check</span>
        </div>
      </div>

      {/* Preset Scenarios Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <label className="block text-sm font-medium text-slate-200">
          Pilih Studi Kasus Profil Akun:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PRESET_ACCOUNT_SCENARIOS.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`text-left p-3.5 rounded-lg border transition-all min-h-[44px] ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-600/80 text-white shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-cyan-400">{preset.name.split(':')[0]}</span>
                  {isSelected && <Check className="h-4 w-4 text-cyan-400" />}
                </div>
                <div className="font-medium text-xs mt-1 text-slate-200">{preset.name.split(':')[1]}</div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{preset.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Account Checklist Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <KeyRound className="h-4 w-4 text-cyan-400" />
          <span>Konfigurasi & Parameter Kebiasaan Keamanan Akun</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          {/* Tipe Akun */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-medium">Tipe Layanan Akun:</label>
            <select
              value={config.accountType}
              onChange={(e) => setConfig({ ...config, accountType: e.target.value as any })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500 font-mono text-xs"
            >
              <option value="banking">Mobile / Internet Banking (Prioritas Finansial Tertinggi)</option>
              <option value="corporate_email">Email Institusi / Akun Kampus Poliwangi</option>
              <option value="social_media">Media Sosial & Chat (Instagram, TikTok, WhatsApp)</option>
              <option value="ecommerce">E-Commerce & Marketplace</option>
            </select>
          </div>

          {/* Penggunaan Password Berulang */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-medium">Penggunaan Ulang Password (Password Reuse):</label>
            <select
              value={config.passwordReusedAcrossSites ? 'true' : 'false'}
              onChange={(e) => setConfig({ ...config, passwordReusedAcrossSites: e.target.value === 'true' })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500 font-mono text-xs"
            >
              <option value="true">Ya, password sama dipakai di beberapa website/aplikasi lain (Rentan)</option>
              <option value="false">Tidak, password akun ini 100% unik khusus untuk akun ini saja (Aman)</option>
            </select>
          </div>

          {/* Metode 2FA */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-medium flex items-center gap-1.5">
              <Smartphone className="h-3.5 w-3.5 text-cyan-400" />
              Status Verifikasi Dua Langkah (2FA / MFA):
            </label>
            <select
              value={config.hasTwoFactorAuth ? config.mfaMethod : 'none'}
              onChange={(e) => {
                const val = e.target.value as any;
                if (val === 'none') {
                  setConfig({ ...config, hasTwoFactorAuth: false, mfaMethod: 'none' });
                } else {
                  setConfig({ ...config, hasTwoFactorAuth: true, mfaMethod: val });
                }
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500 font-mono text-xs"
            >
              <option value="none">Tidak Aktif (Hanya Password Saja - Sangat Berbahaya)</option>
              <option value="sms">Aktif via SMS / WhatsApp OTP (Rentan SIM Swap)</option>
              <option value="app_totp">Aktif via Aplikasi Authenticator (Google Auth / Aegis - Direkomendasikan)</option>
              <option value="hardware_key">Aktif via Hardware Security Key FIDO2 (YubiKey - Teraman)</option>
            </select>
          </div>

          {/* Usia Password */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-medium">Usia Password Sejak Terakhir Diganti:</label>
            <select
              value={config.passwordAgeDays}
              onChange={(e) => setConfig({ ...config, passwordAgeDays: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500 font-mono text-xs"
            >
              <option value={30}>Kurang dari 3 bulan yang lalu (Baru & Segar)</option>
              <option value={180}>Sekitar 6 bulan yang lalu (Wajar)</option>
              <option value={365}>1 tahun yang lalu (Mulai Rentan)</option>
              <option value={730}>Lebih dari 2 tahun yang lalu / Tidak pernah diganti sejak buat</option>
            </select>
          </div>

          {/* Jumlah Sesi Aktif */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-medium">Jumlah Sesi Login Aktif di Perangkat Lain:</label>
            <select
              value={config.activeSessionCount}
              onChange={(e) => setConfig({ ...config, activeSessionCount: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500 font-mono text-xs"
            >
              <option value={1}>1 Perangkat (Hanya perangkat yang sedang dipakai)</option>
              <option value={3}>2–3 Perangkat (HP dan Laptop pribadi)</option>
              <option value={8}>8+ Perangkat (Termasuk komputer warnet/kampus yang lupa logout)</option>
            </select>
          </div>

          {/* Notifikasi Login */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-medium flex items-center gap-1.5">
              <Bell className="h-3.5 w-3.5 text-cyan-400" />
              Notifikasi Login dari Perangkat Baru:
            </label>
            <select
              value={config.loginNotificationsEnabled ? 'true' : 'false'}
              onChange={(e) => setConfig({ ...config, loginNotificationsEnabled: e.target.value === 'true' })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500 font-mono text-xs"
            >
              <option value="true">Diaktifkan (Menerima email / push notification saat ada login baru)</option>
              <option value="false">Dimatikan (Tidak ada peringatan jika ada login mencurigakan)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results & Audit Score Overview */}
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <span className="text-xs uppercase font-mono text-slate-400">Skor Keamanan Akun</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className={`text-3xl font-extrabold font-mono ${
                result.securityScore >= 80 ? 'text-emerald-400' : result.securityScore >= 60 ? 'text-amber-400' : 'text-rose-400'
              }`}>
                {result.securityScore}
              </span>
              <span className="text-xs text-slate-500 font-mono">/ 100</span>
              <Badge variant={result.securityScore >= 80 ? 'success' : result.securityScore >= 60 ? 'warning' : 'danger'}>
                {result.accountHealth}
              </Badge>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  result.securityScore >= 80 ? 'bg-emerald-500' : result.securityScore >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${result.securityScore}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <span className="text-xs uppercase font-mono text-slate-400">Level Risiko Keseluruhan</span>
            <div className="mt-2">
              <Badge tier={result.overallRiskTier}>{result.overallRiskTier} RISK</Badge>
              <p className="text-[11px] text-slate-400 mt-2">
                {result.overallRiskTier === 'CRITICAL'
                  ? 'Akun berisiko tinggi segera dibajak atau diambil alih.'
                  : result.overallRiskTier === 'HIGH'
                  ? 'Ada celah signifikan yang memudahkan peretasan akun.'
                  : 'Postur akun terjaga dengan kontrol pertahanan yang baik.'}
              </p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <span className="text-xs uppercase font-mono text-slate-400">Temuan Celah Kritis</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white font-mono">{result.criticalFindingsCount}</span>
              <span className="text-xs text-slate-400">indikator rentan</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {result.criticalFindingsCount > 0
                ? 'Perlu tindakan perbaikan segera pada checklist di bawah.'
                : 'Semua kontrol keamanan utama berhasil dipenuhi.'}
            </p>
          </div>
        </div>

        {/* Detailed Security Checklist */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Globe className="h-4 w-4 text-cyan-400" />
            <span>Hasil Rincian Audit Parameter Keamanan</span>
          </h3>

          <div className="space-y-3">
            {result.checks.map((check) => (
              <div
                key={check.id}
                className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {check.passed ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
                    )}
                    <span className="font-semibold text-slate-200">{check.title}</span>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {check.category}
                    </span>
                  </div>
                  <p className="text-slate-400 pl-6">{check.recommendation}</p>
                </div>

                <div className="shrink-0 pl-6 sm:pl-0">
                  {check.passed ? (
                    <Badge variant="success">LULUS</Badge>
                  ) : (
                    <Badge tier={check.severity}>{check.severity}</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
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
              <span>Audit Keamanan Akun Tercatat</span>
            </span>
          ) : (
            <span className="flex items-center justify-center space-x-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>Record Audit to Telemetry</span>
            </span>
          )}
        </Button>
      </div>
    </div>
  );
};
