import React, { useState, useEffect } from 'react';
import {
  KeyRound, Globe, UserCheck, Bot, Smartphone, Cloud,
  CheckCircle2, Clock, ShieldCheck, ArrowLeft, Trophy,
  Activity as ActivityIcon, LogOut
} from 'lucide-react';
import { PasswordCheckerTool } from '../components/tools/PasswordCheckerTool';
import { PhishingAnalyzerTool } from '../components/tools/PhishingAnalyzerTool';
import { DataLeakSimulatorTool } from '../components/tools/DataLeakSimulatorTool';
import { AiPrivacyCheckerTool } from '../components/tools/AiPrivacyCheckerTool';
import { TwoFactorSimulatorTool } from '../components/tools/TwoFactorSimulatorTool';
import { CloudSecuritySimulatorTool } from '../components/tools/CloudSecuritySimulatorTool';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { api } from '../services/api';
import { Activity, RiskTier } from '../types';

interface ParticipantDashboardProps {
  participantId: string;
  nickname: string;
  sessionCode: string;
  onExit: () => void;
}

export const ParticipantDashboard: React.FC<ParticipantDashboardProps> = ({
  participantId,
  nickname,
  sessionCode,
  onExit,
}) => {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [history, setHistory] = useState<Activity[]>([]);
  const [heartbeatActive, setHeartbeatActive] = useState(true);
  const [sessionEnded, setSessionEnded] = useState(false);

  // Tools list metadata
  const toolDefs = [
    {
      id: 'password_checker',
      name: 'Password Security Checker',
      category: 'Authentication',
      desc: 'Shannon entropy & GPU hash cracking rate estimation.',
      icon: KeyRound,
      color: 'text-cyan-400 border-cyan-800 bg-cyan-950/60',
    },
    {
      id: 'phishing_analyzer',
      name: 'Phishing URL Analyzer',
      category: 'Threat Intelligence',
      desc: 'Punycode spoofing, IP hostnames, and deceptive domain paths.',
      icon: Globe,
      color: 'text-blue-400 border-blue-800 bg-blue-950/60',
    },
    {
      id: 'data_leak',
      name: 'Personal Data Leak Simulator',
      category: 'Data Privacy',
      desc: 'Indonesian NIK, payment cards, phone & email regex with masking.',
      icon: UserCheck,
      color: 'text-emerald-400 border-emerald-800 bg-emerald-950/60',
    },
    {
      id: 'ai_privacy',
      name: 'AI Privacy Risk Checker',
      category: 'AI Security',
      desc: 'Scanning LLM prompts for leaked OpenAI, AWS, and SSH keys.',
      icon: Bot,
      color: 'text-purple-400 border-purple-800 bg-purple-950/60',
    },
    {
      id: 'two_factor',
      name: '2FA & Credential Stuffing',
      category: 'Access Control',
      desc: 'Brute-force simulation vs RFC 6238 TOTP lockout defense.',
      icon: Smartphone,
      color: 'text-amber-400 border-amber-800 bg-amber-950/60',
    },
    {
      id: 'cloud_security',
      name: 'Cloud Storage & IAM Simulator',
      category: 'Cloud Security',
      desc: 'AWS S3 public ACLs, unencrypted data, and wildcard IAM policies.',
      icon: Cloud,
      color: 'text-rose-400 border-rose-800 bg-rose-950/60',
    },
  ];

  // Load participant activity history
  const loadHistory = async () => {
    try {
      const res = await api.getParticipantHistory();
      if (res?.data) {
        setHistory(res.data);
      }
    } catch {
      // Fallback: check local storage if server is in offline/sandbox mode
      const localHist = localStorage.getItem(`history_${sessionCode}_${participantId}`);
      if (localHist) {
        setHistory(JSON.parse(localHist));
      }
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  // Periodic heartbeat loop (every 15s)
  useEffect(() => {
    const sendPing = async () => {
      try {
        await api.sendHeartbeat();
        setHeartbeatActive(true);
      } catch {
        // If error, mark status
        setHeartbeatActive(false);
      }
    };

    sendPing();
    const interval = setInterval(sendPing, 15000);
    return () => clearInterval(interval);
  }, []);

  // Handle tool completion
  const handleToolComplete = async (telemetry: {
    tool_name: string;
    risk_tier: RiskTier;
    score: number;
    duration_seconds: number;
    metadata: any;
  }) => {
    try {
      await api.submitActivity(telemetry);
    } catch {
      // Offline fallback: save locally
      const newActivity: Activity = {
        id: 'local-' + Date.now(),
        participant_id: participantId,
        participant_nickname: nickname,
        session_id: sessionCode,
        tool_name: telemetry.tool_name,
        risk_tier: telemetry.risk_tier,
        score: telemetry.score,
        duration_seconds: telemetry.duration_seconds,
        metadata: telemetry.metadata,
        created_at: new Date().toISOString(),
      };
      const updated = [newActivity, ...history];
      setHistory(updated);
      localStorage.setItem(`history_${sessionCode}_${participantId}`, JSON.stringify(updated));
    }

    // Refresh history
    loadHistory();
  };

  // Metrics computation
  const completedToolNames = new Set(history.map(h => h.tool_name));
  const completedCount = completedToolNames.size;
  const avgScore = history.length > 0
    ? Math.round(history.reduce((acc, h) => acc + h.score, 0) / history.length)
    : 100;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Session ended alert */}
      {sessionEnded && (
        <div className="p-4 rounded-xl bg-amber-950/80 border border-amber-700 text-amber-200 text-sm flex items-center justify-between">
          <span>This session has concluded by the instructor. You may still review your results below.</span>
          <Button onClick={onExit} variant="secondary" size="sm">Exit Room</Button>
        </div>
      )}

      {/* Top Banner / Hero */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <span className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${heartbeatActive ? 'bg-emerald-400' : 'bg-amber-400'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${heartbeatActive ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
            <span className="text-xs font-mono uppercase tracking-widest text-slate-400">
              Live Room: <strong className="text-cyan-400 font-bold">{sessionCode}</strong>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome, <span className="text-cyan-400">{nickname}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Work at your own pace across all 6 defense modules. Your answers and inputs stay entirely in your browser.
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="flex items-center gap-4 bg-slate-950/80 border border-slate-800/80 p-4 rounded-xl">
          <div className="text-center px-3 border-r border-slate-800">
            <span className="text-[11px] uppercase font-mono text-slate-400">Modules Completed</span>
            <div className="text-2xl font-black text-cyan-400 mt-0.5">
              {completedCount} <span className="text-slate-600 text-sm">/ 6</span>
            </div>
          </div>
          <div className="text-center px-3">
            <span className="text-[11px] uppercase font-mono text-slate-400">Average Score</span>
            <div className="text-2xl font-black text-emerald-400 mt-0.5">
              {avgScore} <span className="text-slate-600 text-sm">/ 100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Tool View vs All Tools Hub */}
      {activeTool ? (
        <div className="space-y-6">
          <button
            onClick={() => setActiveTool(null)}
            className="inline-flex items-center space-x-2 text-xs font-medium text-cyan-400 hover:text-cyan-300 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>&larr; Back to All Modules Hub</span>
          </button>

          {activeTool === 'password_checker' && (
            <PasswordCheckerTool onComplete={handleToolComplete} />
          )}
          {activeTool === 'phishing_analyzer' && (
            <PhishingAnalyzerTool onComplete={handleToolComplete} />
          )}
          {activeTool === 'data_leak' && (
            <DataLeakSimulatorTool onComplete={handleToolComplete} />
          )}
          {activeTool === 'ai_privacy' && (
            <AiPrivacyCheckerTool onComplete={handleToolComplete} />
          )}
          {activeTool === 'two_factor' && (
            <TwoFactorSimulatorTool onComplete={handleToolComplete} />
          )}
          {activeTool === 'cloud_security' && (
            <CloudSecuritySimulatorTool onComplete={handleToolComplete} />
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Modules Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Trophy className="h-5 w-5 text-cyan-400" />
                <span>Training Modules</span>
              </h2>
              <span className="text-xs text-slate-400 font-mono">Select any module to start</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {toolDefs.map((tool) => {
                const Icon = tool.icon;
                const isCompleted = completedToolNames.has(tool.id);

                return (
                  <div
                    key={tool.id}
                    onClick={() => setActiveTool(tool.id)}
                    className="group cursor-pointer bg-slate-900 border border-slate-800 hover:border-cyan-500/60 rounded-xl p-5 shadow-lg transition-all duration-200 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center border ${tool.color} group-hover:scale-105 transition-transform`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        {isCompleted ? (
                          <Badge variant="success" className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Completed
                          </Badge>
                        ) : (
                          <Badge variant="default">Pending</Badge>
                        )}
                      </div>

                      <span className="text-[11px] uppercase font-mono text-slate-500">{tool.category}</span>
                      <h3 className="font-bold text-white text-base mt-1 group-hover:text-cyan-400 transition-colors">
                        {tool.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                        {tool.desc}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between text-xs text-cyan-400 font-medium">
                      <span>{isCompleted ? 'Retry / Explore Again' : 'Start Module'}</span>
                      <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Personal Activity History */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ActivityIcon className="h-4 w-4 text-cyan-400" />
              <span>Your Activity Log (This Session)</span>
            </h2>

            {history.length === 0 ? (
              <p className="text-xs text-slate-500 py-3">
                No modules completed yet. Select any module above to begin your defense practice.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Module</th>
                      <th className="py-2.5 px-3">Risk Assessment</th>
                      <th className="py-2.5 px-3">Score</th>
                      <th className="py-2.5 px-3">Duration</th>
                      <th className="py-2.5 px-3">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {history.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-slate-950/50">
                        <td className="py-3 px-3 text-slate-200 font-sans font-medium">
                          {item.tool_name.replace('_', ' ').toUpperCase()}
                        </td>
                        <td className="py-3 px-3">
                          <Badge tier={item.risk_tier}>{item.risk_tier}</Badge>
                        </td>
                        <td className="py-3 px-3 font-bold text-cyan-400">
                          {item.score}/100
                        </td>
                        <td className="py-3 px-3 text-slate-400">
                          {item.duration_seconds}s
                        </td>
                        <td className="py-3 px-3 text-slate-500 text-[11px]">
                          {new Date(item.created_at).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
