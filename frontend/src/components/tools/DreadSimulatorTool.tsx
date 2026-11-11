import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, Layers, Info, Check } from 'lucide-react';
import { calculateDreadRisk, DreadScores, PRESET_THREAT_SCENARIOS, ThreatScenario } from '../../utils/dreadSimulator';
import { RiskTier } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface ToolProps {
  onComplete: (data: { tool_name: string; risk_tier: RiskTier; score: number; duration_seconds: number; metadata: any }) => void;
}

const DIMENSIONS: Array<{ key: keyof DreadScores; label: string; meaning: string; desc: string }> = [
  {
    key: 'damage',
    label: 'Damage',
    meaning: 'Besarnya kerusakan',
    desc: 'Seberapa besar kerugian atau kerusakan sistem/data jika ancaman berhasil dieksekusi.',
  },
  {
    key: 'reproducibility',
    label: 'Reproducibility',
    meaning: 'Kemudahan ancaman diulang',
    desc: 'Seberapa mudah penyerang mengulangi eksploitasi yang sama tanpa kegagalan.',
  },
  {
    key: 'exploitability',
    label: 'Exploitability',
    meaning: 'Kemudahan dieksploitasi',
    desc: 'Seberapa sedikit usaha, alat, atau keahlian teknis yang diperlukan untuk membobol sistem.',
  },
  {
    key: 'affectedUsers',
    label: 'Affected Users',
    meaning: 'Jumlah pengguna terdampak',
    desc: 'Berapa banyak persentase atau jumlah pengguna sistem yang terkena imbas langsung.',
  },
  {
    key: 'discoverability',
    label: 'Discoverability',
    meaning: 'Kemudahan ancaman ditemukan',
    desc: 'Seberapa mudah celah keamanan ini ditemukan oleh penyerang dari luar sistem.',
  },
];

export const DreadSimulatorTool: React.FC<ToolProps> = ({ onComplete }) => {
  const [selectedThreat, setSelectedThreat] = useState<ThreatScenario>(PRESET_THREAT_SCENARIOS[0]);
  const [customTitle, setCustomTitle] = useState(PRESET_THREAT_SCENARIOS[0].title);
  const [scores, setScores] = useState<DreadScores>(PRESET_THREAT_SCENARIOS[0].defaultScores);
  const [startTime] = useState<number>(() => Date.now());
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const result = calculateDreadRisk(scores);

  const handleScoreChange = (dim: keyof DreadScores, val: number) => {
    setScores(prev => ({ ...prev, [dim]: val }));
  };

  const handleSelectPreset = (threat: ThreatScenario) => {
    setSelectedThreat(threat);
    setCustomTitle(threat.title);
    setScores(threat.defaultScores);
  };

  const handleFinish = () => {
    const duration = Math.max(1, Math.round((Date.now() - startTime) / 1000));

    onComplete({
      tool_name: 'dread_simulator',
      risk_tier: result.riskTier,
      score: result.securityScore,
      duration_seconds: duration,
      metadata: {
        threatTitle: customTitle,
        threatCategory: selectedThreat.category,
        averageDreadScore: result.averageScore,
        dreadCategory: result.dreadCategory,
        scores,
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
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Metode Pemetaan Risiko DREAD</h2>
            <p className="text-xs text-slate-400">
              Setiap ancaman dinilai pada lima dimensi dengan skala 1–3 untuk menentukan level risiko objektif.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-xs bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-emerald-400">
          <ShieldAlert className="h-3.5 w-3.5" />
          <span>Threat Modeling Standard / Microsoft DREAD</span>
        </div>
      </div>

      {/* Preset Scenarios Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <label className="block text-sm font-medium text-slate-200">
          Pilih Studi Kasus Ancaman (Threat Scenario)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PRESET_THREAT_SCENARIOS.map((scenario) => {
            const isSelected = selectedThreat.id === scenario.id;
            return (
              <button
                key={scenario.id}
                type="button"
                onClick={() => handleSelectPreset(scenario)}
                className={`text-left p-3.5 rounded-lg border transition-all min-h-[44px] ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-600/80 text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-cyan-300">{scenario.category}</span>
                  {isSelected && <Check className="h-4 w-4 text-cyan-400" />}
                </div>
                <div className="font-medium text-sm mt-1 text-slate-100">{scenario.title}</div>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{scenario.description}</p>
              </button>
            );
          })}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Nama / Deskripsi Ancaman yang Dikaji:
          </label>
          <input
            type="text"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500 font-mono"
            placeholder="Masukkan nama ancaman atau skenario sistem..."
          />
        </div>
      </div>

      {/* Evaluator & Category Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dimensions Matrix (Left 2 Columns) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Info className="h-4 w-4 text-cyan-400" />
              <span>Penilaian 5 Dimensi DREAD (Skala 1 - 3)</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">1: Rendah | 2: Sedang | 3: Tinggi</span>
          </div>

          <div className="space-y-4">
            {DIMENSIONS.map((dim) => {
              const currentVal = scores[dim.key];
              return (
                <div
                  key={dim.key}
                  className="bg-slate-950 border border-slate-800/80 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{dim.label}</span>
                      <span className="text-xs text-cyan-400 font-medium">({dim.meaning})</span>
                    </div>
                    <p className="text-xs text-slate-400 max-w-md">{dim.desc}</p>
                  </div>

                  {/* Rating Selector 1 - 2 - 3 */}
                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                    {[1, 2, 3].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleScoreChange(dim.key, val)}
                        className={`flex-1 sm:flex-none min-h-[44px] min-w-[44px] px-3 py-2 rounded-lg font-mono text-sm font-bold transition-all active:scale-[0.98] ${
                          currentVal === val
                            ? val === 3
                              ? 'bg-rose-600 text-white shadow-md shadow-rose-950'
                              : val === 2
                              ? 'bg-amber-600 text-white shadow-md shadow-amber-950'
                              : 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 text-xs text-slate-400 font-mono flex items-center justify-between border-t border-slate-800">
            <span>Formula: Skor akhir = rata-rata dari lima dimensi DREAD.</span>
            <span className="text-cyan-400 font-bold">
              ({scores.damage} + {scores.reproducibility} + {scores.exploitability} + {scores.affectedUsers} + {scores.discoverability}) / 5
            </span>
          </div>
        </div>

        {/* DREAD Risk Gauge & Legend (Right Column - Matching User Diagram) */}
        <div className="space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Legend / Category Cards as shown in diagram */}
            <div
              className={`p-4 rounded-xl border transition-all ${
                result.dreadCategory === 'TINGGI'
                  ? 'bg-rose-950/40 border-rose-500 shadow-lg shadow-rose-950/40'
                  : 'bg-slate-900 border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-rose-400 tracking-wide uppercase">TINGGI</span>
                <Badge variant="danger">Kritis</Badge>
              </div>
              <div className="font-mono text-xs text-slate-200 mt-2 font-semibold">
                Rata-rata &ge; 2,6
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Ancaman berisiko tinggi. Memerlukan mitigasi mendesak dan kontrol ketat.
              </p>
            </div>

            <div
              className={`p-4 rounded-xl border transition-all ${
                result.dreadCategory === 'SEDANG'
                  ? 'bg-amber-950/40 border-amber-500 shadow-lg shadow-amber-950/40'
                  : 'bg-slate-900 border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-amber-400 tracking-wide uppercase">SEDANG</span>
                <Badge variant="warning">Prioritas</Badge>
              </div>
              <div className="font-mono text-xs text-slate-200 mt-2 font-semibold">
                Rata-rata 2,0–2,5
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Risiko sedang. Perlu perbaikan terjadwal sebelum rilis produksi.
              </p>
            </div>

            <div
              className={`p-4 rounded-xl border transition-all ${
                result.dreadCategory === 'RENDAH'
                  ? 'bg-emerald-950/40 border-emerald-500 shadow-lg shadow-emerald-950/40'
                  : 'bg-slate-900 border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-emerald-400 tracking-wide uppercase">RENDAH</span>
                <Badge variant="success">Terkendali</Badge>
              </div>
              <div className="font-mono text-xs text-slate-200 mt-2 font-semibold">
                Rata-rata &lt; 2,0
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Dampak minim. Dapat diterima dalam batasan risiko normal.
              </p>
            </div>
          </div>

          {/* Current Assessment Summary Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <span className="text-xs uppercase font-mono text-slate-400">Hasil Pemetaan Saat Ini</span>
            <div className="flex items-baseline justify-between mt-1">
              <div>
                <span className="text-3xl font-extrabold text-white font-mono">{result.averageScore}</span>
                <span className="text-sm text-slate-500 font-mono"> / 3.0</span>
              </div>
              <Badge
                variant={
                  result.dreadCategory === 'TINGGI'
                    ? 'danger'
                    : result.dreadCategory === 'SEDANG'
                    ? 'warning'
                    : 'success'
                }
              >
                Kategori {result.dreadCategory}
              </Badge>
            </div>

            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  result.dreadCategory === 'TINGGI'
                    ? 'bg-rose-500'
                    : result.dreadCategory === 'SEDANG'
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, (result.averageScore / 3) * 100)}%` }}
              />
            </div>

            <div className="pt-2 text-xs text-slate-300 space-y-1">
              <span className="text-[11px] font-mono text-slate-400 uppercase">Rekomendasi Penanganan:</span>
              <ul className="list-disc list-inside space-y-1 text-slate-400 text-xs">
                {result.recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Submit / Record Activity Button */}
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
              <span>Assessment DREAD Tercatat</span>
            </span>
          ) : (
            <span className="flex items-center justify-center space-x-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>Record Assessment to Telemetry</span>
            </span>
          )}
        </Button>
      </div>
    </div>
  );
};

