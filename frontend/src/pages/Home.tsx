import React from 'react';
import { ShieldCheck, Users, Radio, KeyRound, Globe, UserCheck, Bot, Smartphone, Cloud, ArrowRight, Lock } from 'lucide-react';
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
      desc: 'Entropy gauge, dictionary lookups, and GPU cluster crack time estimation.',
      icon: KeyRound,
      color: 'text-cyan-400 bg-cyan-950/50 border-cyan-800',
    },
    {
      id: 'phishing',
      name: 'Phishing URL Analyzer',
      desc: 'Deep structural analysis, punycode/IDN attacks, and abusive TLD heuristics.',
      icon: Globe,
      color: 'text-blue-400 bg-blue-950/50 border-blue-800',
    },
    {
      id: 'data-leak',
      name: 'Personal Data Leak Simulator',
      desc: 'Local Indonesian NIK regex, email, phone, and payment card detection & redaction.',
      icon: UserCheck,
      color: 'text-emerald-400 bg-emerald-950/50 border-emerald-800',
    },
    {
      id: 'ai-privacy',
      name: 'AI Privacy Risk Checker',
      desc: 'Scans LLM prompts for leaked OpenAI, AWS, and GitHub secrets with sanitized export.',
      icon: Bot,
      color: 'text-purple-400 bg-purple-950/50 border-purple-800',
    },
    {
      id: 'two-factor',
      name: '2FA & Brute Force Simulator',
      desc: 'Demonstrates single-factor breach vs RFC 6238 TOTP lockout defense.',
      icon: Smartphone,
      color: 'text-amber-400 bg-amber-950/50 border-amber-800',
    },
    {
      id: 'cloud',
      name: 'Cloud Storage & IAM Simulator',
      desc: 'Interactive AWS S3/Azure Blob sandbox with simulated attacker probing.',
      icon: Cloud,
      color: 'text-rose-400 bg-rose-950/50 border-rose-800',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-6 max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-400 text-xs font-mono">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Real-time Interactive Cybersecurity & AI Privacy Lab</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
          Defensive Security Training <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            With Zero PII Ingestion
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-400">
          Instructor creates a live session room. Participants scan the QR code and explore 6 cybersecurity tools independently. Instructor views live analytics in real time without ever seeing sensitive inputs.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button
            onClick={() => onNavigate('join')}
            variant="primary"
            size="lg"
            className="w-full sm:w-auto"
          >
            <Users className="h-4 w-4 mr-2" />
            <span>Join Live Session (No Signup)</span>
            <ArrowRight className="h-4 w-4 ml-2" />
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
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Lock className="h-5 w-5 text-cyan-400" />
              <span>Independent Security Tools</span>
            </h2>
            <p className="text-xs text-slate-400">
              Each module works fully client-side. Try them freely in sandbox mode:
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800">
            6 / 6 Functional Modules
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.id}
                onClick={() => onSelectSandboxTool(tool.id)}
                className="group cursor-pointer bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-xl p-5 shadow-lg transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center border ${tool.color} mb-4 group-hover:scale-105 transition-transform`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-white text-base group-hover:text-cyan-400 transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {tool.desc}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-cyan-400 font-medium">
                  <span>Launch Module</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
