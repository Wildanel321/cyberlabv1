import { RiskTier } from '../types';

export interface AccountAuditConfig {
  accountType: 'banking' | 'social_media' | 'corporate_email' | 'ecommerce';
  passwordAgeDays: number;            // Usia password dalam hari
  passwordReusedAcrossSites: boolean; // Apakah password dipakai di web/akun lain
  hasTwoFactorAuth: boolean;          // Apakah 2FA aktif
  mfaMethod: 'none' | 'sms' | 'app_totp' | 'hardware_key'; // Metode 2FA
  hasRecoveryEmailOrPhone: boolean;   // Email/No HP pemulihan terverifikasi
  recoveryContactsUpToDate: boolean;  // Kontak pemulihan masih aktif & dipegang
  activeSessionCount: number;         // Jumlah sesi login aktif di perangkat berbeda
  hasThirdPartyOAuthApps: boolean;    // Menghubungkan akun ke aplikasi pihak ketiga (Google/FB login)
  oauthAppsCount: number;             // Jumlah aplikasi pihak ketiga yang memiliki akses
  loginNotificationsEnabled: boolean; // Notifikasi jika ada login dari perangkat baru
}

export interface SecurityCheckItem {
  id: string;
  category: 'Kredensial' | 'Otentikasi' | 'Pemulihan' | 'Sesi & Hak Akses';
  title: string;
  passed: boolean;
  severity: RiskTier;
  impactScore: number; // Pengurangan poin jika gagal
  recommendation: string;
}

export interface AccountAuditResult {
  securityScore: number;       // 0 - 100
  overallRiskTier: RiskTier;   // LOW | MEDIUM | HIGH | CRITICAL
  accountHealth: 'SANGAT AMAN' | 'CUKUP BAIK' | 'RENTAN' | 'KRITIS';
  checks: SecurityCheckItem[];
  criticalFindingsCount: number;
  remediations: string[];
}

export const PRESET_ACCOUNT_SCENARIOS: Array<{
  id: string;
  name: string;
  description: string;
  config: AccountAuditConfig;
}> = [
  {
    id: 'compromised_lifestyle',
    name: 'Skenario 1: Akun Rentan Kompromi (Kebiasaan Buruk)',
    description: 'Password tidak pernah diganti (2 tahun), dipakai di banyak web, tanpa 2FA, dan 7 perangkat asing masih login.',
    config: {
      accountType: 'social_media',
      passwordAgeDays: 730,
      passwordReusedAcrossSites: true,
      hasTwoFactorAuth: false,
      mfaMethod: 'none',
      hasRecoveryEmailOrPhone: true,
      recoveryContactsUpToDate: false,
      activeSessionCount: 8,
      hasThirdPartyOAuthApps: true,
      oauthAppsCount: 15,
      loginNotificationsEnabled: false,
    },
  },
  {
    id: 'average_user',
    name: 'Skenario 2: Standar Pengguna Umum (SMS 2FA)',
    description: 'Password unik tapi usia 1 tahun, 2FA aktif via SMS (rentan SIM swap), beberapa aplikasi OAuth terhubung.',
    config: {
      accountType: 'corporate_email',
      passwordAgeDays: 365,
      passwordReusedAcrossSites: false,
      hasTwoFactorAuth: true,
      mfaMethod: 'sms',
      hasRecoveryEmailOrPhone: true,
      recoveryContactsUpToDate: true,
      activeSessionCount: 3,
      hasThirdPartyOAuthApps: true,
      oauthAppsCount: 4,
      loginNotificationsEnabled: true,
    },
  },
  {
    id: 'hardened_account',
    name: 'Skenario 3: Akun Terproteksi Maksimal (Best Practice)',
    description: 'Password baru & unik, 2FA via Authenticator App / Hardware Key, sesi terpantau, notifikasi login aktif.',
    config: {
      accountType: 'banking',
      passwordAgeDays: 45,
      passwordReusedAcrossSites: false,
      hasTwoFactorAuth: true,
      mfaMethod: 'app_totp',
      hasRecoveryEmailOrPhone: true,
      recoveryContactsUpToDate: true,
      activeSessionCount: 1,
      hasThirdPartyOAuthApps: false,
      oauthAppsCount: 0,
      loginNotificationsEnabled: true,
    },
  },
];

/**
 * Mengevaluasi postur keamanan akun berdasarkan NIST SP 800-63B & CIS Benchmarks
 */
export function evaluateAccountSecurity(config: AccountAuditConfig): AccountAuditResult {
  const checks: SecurityCheckItem[] = [];
  let deduction = 0;

  // 1. Password Reuse Across Sites
  if (config.passwordReusedAcrossSites) {
    checks.push({
      id: 'pwd_reuse',
      category: 'Kredensial',
      title: 'Password Dipakai Berulang di Berbagai Layanan',
      passed: false,
      severity: 'CRITICAL',
      impactScore: 25,
      recommendation: 'Gunakan password unik untuk setiap layanan. Jika satu situs bocor, akun ini rentan terkena credential stuffing.',
    });
    deduction += 25;
  } else {
    checks.push({
      id: 'pwd_reuse',
      category: 'Kredensial',
      title: 'Password Unik & Tidak Dipakai Ulang',
      passed: true,
      severity: 'LOW',
      impactScore: 0,
      recommendation: 'Pertahankan kebijakan password unik dengan bantuan Password Manager terpercaya.',
    });
  }

  // 2. Usia Password (Password Age)
  if (config.passwordAgeDays > 365) {
    checks.push({
      id: 'pwd_age',
      category: 'Kredensial',
      title: `Usia Password Sangat Lama (${Math.round(config.passwordAgeDays / 30)} bulan)`,
      passed: false,
      severity: 'HIGH',
      impactScore: 15,
      recommendation: 'Perbarui password secara berkala atau segera ganti jika terindikasi pernah berada di database kebocoran (HaveIBeenPwned).',
    });
    deduction += 15;
  } else if (config.passwordAgeDays > 180) {
    checks.push({
      id: 'pwd_age',
      category: 'Kredensial',
      title: `Usia Password Sudah Cukup Lama (${Math.round(config.passwordAgeDays / 30)} bulan)`,
      passed: false,
      severity: 'MEDIUM',
      impactScore: 8,
      recommendation: 'Pertimbangkan untuk mengganti password secara terjadwal.',
    });
    deduction += 8;
  } else {
    checks.push({
      id: 'pwd_age',
      category: 'Kredensial',
      title: `Usia Password Masih Baru (${config.passwordAgeDays} hari)`,
      passed: true,
      severity: 'LOW',
      impactScore: 0,
      recommendation: 'Password masih segar dan belum terpapar risiko jangka panjang.',
    });
  }

  // 3. Multi-Factor Authentication (2FA/MFA)
  if (!config.hasTwoFactorAuth || config.mfaMethod === 'none') {
    checks.push({
      id: 'mfa_status',
      category: 'Otentikasi',
      title: 'Verifikasi Dua Langkah (2FA) Tidak Aktif',
      passed: false,
      severity: 'CRITICAL',
      impactScore: 30,
      recommendation: 'Segera aktifkan 2FA! Tanpa 2FA, siapa pun yang menebak password Anda bisa langsung mengambil alih akun.',
    });
    deduction += 30;
  } else if (config.mfaMethod === 'sms') {
    checks.push({
      id: 'mfa_status',
      category: 'Otentikasi',
      title: '2FA Menggunakan SMS (Kurang Aman dari Serangan SIM Swap)',
      passed: false,
      severity: 'MEDIUM',
      impactScore: 10,
      recommendation: 'Tingkatkan ke aplikasi Authenticator (Google Authenticator / Aegis) untuk menghindari pembajakan SMS / SIM Cloning.',
    });
    deduction += 10;
  } else {
    checks.push({
      id: 'mfa_status',
      category: 'Otentikasi',
      title: config.mfaMethod === 'hardware_key' ? '2FA Menggunakan Hardware Security Key (FIDO2)' : '2FA Menggunakan Authenticator App (RFC 6238 TOTP)',
      passed: true,
      severity: 'LOW',
      impactScore: 0,
      recommendation: 'Metode otentikasi sangat kuat dan kebal terhadap brute force sederhana.',
    });
  }

  // 4. Recovery Information Status
  if (!config.hasRecoveryEmailOrPhone || !config.recoveryContactsUpToDate) {
    checks.push({
      id: 'recovery_contacts',
      category: 'Pemulihan',
      title: 'Email atau Nomor HP Pemulihan Tidak Aktif / Kadaluarsa',
      passed: false,
      severity: 'HIGH',
      impactScore: 15,
      recommendation: 'Pastikan nomor HP dan email cadangan masih aktif di bawah kendali Anda untuk mencegah penguncian akun permanen.',
    });
    deduction += 15;
  } else {
    checks.push({
      id: 'recovery_contacts',
      category: 'Pemulihan',
      title: 'Informasi Pemulihan Akun Terverifikasi & Aktif',
      passed: true,
      severity: 'LOW',
      impactScore: 0,
      recommendation: 'Akses pemulihan darurat siap digunakan jika terjadi kendala login.',
    });
  }

  // 5. Active Sessions & Unknown Devices
  if (config.activeSessionCount > 4) {
    checks.push({
      id: 'active_sessions',
      category: 'Sesi & Hak Akses',
      title: `Terlalu Banyak Sesi Aktif (${config.activeSessionCount} Perangkat Login)`,
      passed: false,
      severity: 'MEDIUM',
      impactScore: 10,
      recommendation: 'Lakukan "Log out dari semua perangkat lain" untuk menutup sesi di komputer umum atau perangkat lama.',
    });
    deduction += 10;
  } else {
    checks.push({
      id: 'active_sessions',
      category: 'Sesi & Hak Akses',
      title: `Jumlah Sesi Login Terkendali (${config.activeSessionCount} Perangkat)`,
      passed: true,
      severity: 'LOW',
      impactScore: 0,
      recommendation: 'Periksa daftar perangkat yang terhubung secara berkala di menu keamanan akun.',
    });
  }

  // 6. Third-Party OAuth App Permissions
  if (config.hasThirdPartyOAuthApps && config.oauthAppsCount > 5) {
    checks.push({
      id: 'oauth_apps',
      category: 'Sesi & Hak Akses',
      title: `${config.oauthAppsCount} Aplikasi Pihak Ketiga Memiliki Akses Token ke Akun`,
      passed: false,
      severity: 'MEDIUM',
      impactScore: 8,
      recommendation: 'Cabut izin (*revoke access*) untuk aplikasi atau game yang sudah tidak Anda gunakan lagi.',
    });
    deduction += 8;
  }

  // 7. Login Alerts / Security Notifications
  if (!config.loginNotificationsEnabled) {
    checks.push({
      id: 'login_alerts',
      category: 'Sesi & Hak Akses',
      title: 'Notifikasi Login Baru Tidak Diaktifkan',
      passed: false,
      severity: 'MEDIUM',
      impactScore: 7,
      recommendation: 'Nyalakan alert login baru agar Anda langsung mendapat email/notifikasi saat ada yang masuk dari lokasi asing.',
    });
    deduction += 7;
  }

  const securityScore = Math.max(5, 100 - deduction);

  let overallRiskTier: RiskTier = 'LOW';
  let accountHealth: 'SANGAT AMAN' | 'CUKUP BAIK' | 'RENTAN' | 'KRITIS' = 'SANGAT AMAN';

  if (securityScore < 45) {
    overallRiskTier = 'CRITICAL';
    accountHealth = 'KRITIS';
  } else if (securityScore < 65) {
    overallRiskTier = 'HIGH';
    accountHealth = 'RENTAN';
  } else if (securityScore < 85) {
    overallRiskTier = 'MEDIUM';
    accountHealth = 'CUKUP BAIK';
  } else {
    overallRiskTier = 'LOW';
    accountHealth = 'SANGAT AMAN';
  }

  const criticalFindingsCount = checks.filter(c => !c.passed && (c.severity === 'CRITICAL' || c.severity === 'HIGH')).length;
  const remediations = checks.filter(c => !c.passed).map(c => c.recommendation);

  return {
    securityScore,
    overallRiskTier,
    accountHealth,
    checks,
    criticalFindingsCount,
    remediations,
  };
}

