import { RiskTier } from '../types';

export interface DreadScores {
  damage: number;          // 1 - 3: Besarnya kerusakan
  reproducibility: number; // 1 - 3: Kemudahan ancaman diulang
  exploitability: number;  // 1 - 3: Kemudahan dieksploitasi
  affectedUsers: number;   // 1 - 3: Jumlah pengguna terdampak
  discoverability: number; // 1 - 3: Kemudahan ancaman ditemukan
}

export interface ThreatScenario {
  id: string;
  title: string;
  category: string;
  description: string;
  defaultScores: DreadScores;
  mitigation: string;
}

export interface DreadAnalysisResult {
  averageScore: number;
  dreadCategory: 'TINGGI' | 'SEDANG' | 'RENDAH';
  riskTier: RiskTier;
  securityScore: number;
  recommendations: string[];
}

export const PRESET_THREAT_SCENARIOS: ThreatScenario[] = [
  {
    id: 'sql_injection',
    title: 'SQL Injection pada Form Login Portal Siswa',
    category: 'Injection / Data Breach',
    description: 'Penyerang menyisipkan payload SQL pada kolom input tanpa parameterized query untuk bypass otentikasi admin.',
    defaultScores: {
      damage: 3,
      reproducibility: 3,
      exploitability: 3,
      affectedUsers: 3,
      discoverability: 3,
    },
    mitigation: 'Implementasikan ORM / Parameterized Prepared Statements dan WAF rule.',
  },
  {
    id: 'idor_profile',
    title: 'IDOR (Insecure Direct Object Reference) Dokumen Nilai',
    category: 'Broken Access Control',
    description: 'Pengguna dapat mengganti parameter user_id pada URL REST API untuk mengunduh transkrip nilai siswa lain.',
    defaultScores: {
      damage: 2,
      reproducibility: 3,
      exploitability: 2,
      affectedUsers: 2,
      discoverability: 2,
    },
    mitigation: 'Terapkan validasi otorisasi berbasis sesi server-side (Policy/Middleware) sebelum mengembalikan data.',
  },
  {
    id: 'cleartext_backup',
    title: 'File Backup Database .sql Tersimpan di Direktori Publik Web',
    category: 'Security Misconfiguration',
    description: 'File dump backup database disimpan pada folder public/downloads tanpa proteksi access control.',
    defaultScores: {
      damage: 3,
      reproducibility: 3,
      exploitability: 3,
      affectedUsers: 3,
      discoverability: 2,
    },
    mitigation: 'Pindahkan backup ke storage private terenkripsi dan larang akses ekstensi .sql pada web server Nginx.',
  },
  {
    id: 'csrf_transfer',
    title: 'Cross-Site Request Forgery (CSRF) pada Ubah Email Profil',
    category: 'Cross-Site Scripting / CSRF',
    description: 'Endpoint pengubahan email akun tidak memverifikasi CSRF token sehingga rentan dipicu via link phising.',
    defaultScores: {
      damage: 2,
      reproducibility: 2,
      exploitability: 2,
      affectedUsers: 1,
      discoverability: 2,
    },
    mitigation: 'Wajibkan Anti-CSRF token pada seluruh HTTP POST/PUT request dan SameSite=Strict pada cookie sesi.',
  },
];

/**
 * Menghitung pemetaan risiko DREAD:
 * Skala 1 - 3 untuk setiap dimensi (Damage, Reproducibility, Exploitability, Affected Users, Discoverability).
 * Skor akhir = rata-rata dari kelima dimensi (1.0 - 3.0).
 * 
 * Klasifikasi (sesuai spesifikasi modul):
 * - TINGGI: Rata-rata >= 2.6  (CRITICAL)
 * - SEDANG: Rata-rata 2.0 - 2.5 (HIGH / MEDIUM)
 * - RENDAH: Rata-rata < 2.0   (LOW)
 */
export function calculateDreadRisk(scores: DreadScores): DreadAnalysisResult {
  const { damage, reproducibility, exploitability, affectedUsers, discoverability } = scores;

  // Pastikan rentang nilai aman antara 1 dan 3
  const clamp = (val: number) => Math.min(3, Math.max(1, Number(val) || 1));
  const d = clamp(damage);
  const r = clamp(reproducibility);
  const e = clamp(exploitability);
  const a = clamp(affectedUsers);
  const disc = clamp(discoverability);

  const sum = d + r + e + a + disc;
  const rawAvg = sum / 5;
  const averageScore = Math.round(rawAvg * 10) / 10; // 1 desimal, misal 2.6

  let dreadCategory: 'TINGGI' | 'SEDANG' | 'RENDAH' = 'RENDAH';
  let riskTier: RiskTier = 'LOW';
  let securityScore = 90;

  if (averageScore >= 2.6) {
    dreadCategory = 'TINGGI';
    riskTier = 'CRITICAL';
    securityScore = Math.max(10, Math.round(100 - (averageScore / 3) * 85));
  } else if (averageScore >= 2.0) {
    dreadCategory = 'SEDANG';
    riskTier = averageScore >= 2.3 ? 'HIGH' : 'MEDIUM';
    securityScore = Math.max(35, Math.round(100 - (averageScore / 3) * 60));
  } else {
    dreadCategory = 'RENDAH';
    riskTier = 'LOW';
    securityScore = Math.min(100, Math.round(100 - (averageScore / 3) * 20));
  }

  const recommendations: string[] = [];
  if (d === 3) recommendations.push('Tingkat kerusakan (Damage) maksimal: Siapkan fail-safe dan pembatasan hak akses (least privilege).');
  if (r === 3) recommendations.push('Eksploitasi dapat diulang dengan mudah: Otomasi unit test dan validasi input di sisi server.');
  if (e === 3) recommendations.push('Kemudahan eksploitasi tinggi (Exploitability): Tutup celah dengan patch keamanan darurat.');
  if (a === 3) recommendations.push('Dampak pengguna luas (Affected Users): Segmentasi data pengguna dan isolasi tenant.');
  if (disc === 3) recommendations.push('Kemudahan ditemukan tinggi (Discoverability): Jangan ekspos header debug, stack trace, atau struktur internal API.');
  if (recommendations.length === 0) {
    recommendations.push('Risiko berada pada batas terkendali. Lakukan audit berkala dan pemantauan log logis.');
  }

  return {
    averageScore,
    dreadCategory,
    riskTier,
    securityScore,
    recommendations,
  };
}

