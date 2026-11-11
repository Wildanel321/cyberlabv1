import React from 'react';
import { Lock, Cpu, EyeOff } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-800 bg-slate-950/60 py-6 mt-12 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2 text-slate-400">
          <Lock className="h-3.5 w-3.5 text-cyan-400" />
          <span className="font-semibold text-slate-300">CyberGuard Lab</span>
          <span>&copy; {new Date().getFullYear()} Defensive Security Sandbox</span>
        </div>

        <div className="flex items-center space-x-6 text-slate-400">
          <span className="flex items-center gap-1.5">
            <EyeOff className="h-3.5 w-3.5 text-emerald-400" />
            <span>Zero-PII Storage Guarantee</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Cpu className="h-3.5 w-3.5 text-cyan-400" />
            <span>Local Browser Inference</span>
          </span>
        </div>
      </div>
    </footer>
  );
};
