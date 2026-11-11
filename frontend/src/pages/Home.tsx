import React from 'react';
import { Users, Radio, KeyRound, Globe, UserCheck, Bot, Smartphone, Cloud, Lock } from 'lucide-react';
import { Button } from '../components/ui/Button';

interface HomeProps {
  onNavigate: (view: string) => void;
  onSelectSandboxTool: (toolName: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate, onSelectSandboxTool }) => {
  const tools = [
    {
      id: 'password',
      name: 'Password Security Checker',
      category: 'Authentication',
      desc: 'Shannon entropy analysis, common dictionary checks, and GPU hash crack-time estimation.',
      icon: KeyRound,
      color: 'text-cyan-400 bg-cyan-950/60 border-cyan-800',
    },
    {
      id: 'phishing',
      name: 'Phishing URL Analyzer',
      category: 'Threat Intelligence',
      desc: 'RFC 3986 parser detecting punycode spoofing, raw IP hostnames, and abusive top-level domains.',
      icon: Globe,
      color: 'text-blue-400 bg-blue-950/60 border-blue-800',
    },
    {
      id: 'data-leak',
      name: 'Personal Data Leak Simulator',
      category: 'Data Privacy',
      desc: 'Local pattern recognition for Indonesian NIK, Luhn credit cards, emails, and phone numbers.',
      icon: UserCheck,
      color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800',
    },
    {
      id: 'ai-privacy',
      name: 'AI Privacy Risk Checker',
      category: 'AI Security',
      desc: 'Scans LLM prompts for leaked OpenAI, AWS, and GitHub secrets with instant sanitized export.',
      icon: Bot,
      color: 'text-purple-400 bg-purple-950/60 border-purple-800',
    },
    {
      id: 'two-factor',
      name: '2FA & Brute Force Simulator',
      category: 'Access Control',
      desc: 'Compares single-factor password breach vs RFC 6238 TOTP lockout defense in real time.',
      icon: Smartphone,
      color: 'text-amber-400 bg-amber-950/60 border-amber-800',
    },
    {
      id: 'cloud',
      name: 'Cloud Storage & IAM Simulator',
      category: 'Cloud Security',
      desc: 'Sandbox modeling AWS S3 / Azure Blob public ACLs, unencrypted data, and wildcard IAM policies.',
      icon: Cloud,
      color: 'text-rose-400 bg-rose-950/60 border-rose-800',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-4 sm:space-y-6 max-w-3xl mx-auto pt-4 sm:pt-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
          Defensive Cybersecurity Training <br />
          <span className="text-cyan-400">With Zero PII Ingestion</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
          Instructors create live session rooms with instant QR access. Participants explore 6 functional security tools independently. Telemetry updates in real time without ever logging sensitive inputs.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-2">
          <Button
            onClick={() => onNavigate('join')}
            variant="primary"
            size="lg"
            className="w-full sm:w-auto"
          >
            <Users className="h-4 w-4 mr-2" />
            <span>Join Live Session (No Signup)</span>
          </Button>

          <Button
            onClick={() => onNavigate('instructor-login')}
            variant="secondary"
            size="lg"
            className="w-full sm:w-auto"
          >
            <Radio className="h-4 w-4 mr-2 text-cyan-400" />
            <span>Instructor Console</span>
          </Button>
        </div>
      </div>

      {/* 6 Interactive Tools Grid */}
      <div className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Lock className="h-4 w-4 text-cyan-400" />
              <span>Independent Defense Modules</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Every tool executes client-side. Test any module directly in sandbox mode:
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded border border-emerald-800">
            6 / 6 Modules Active
          </span>
        </div>

        {/* Responsive 3-state grid: 1 col on mobile, 2 col on tablet, 3 col on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.id}
                onClick={() => onSelectSandboxTool(tool.id)}
                className="group cursor-pointer bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl p-5 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center border ${tool.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 uppercase">
                      {tool.category}
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-base group-hover:text-cyan-400 transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {tool.desc}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800 text-xs text-cyan-400 font-medium">
                  Launch Sandbox
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
