import React from 'react';
import { ShieldCheck, LogOut, Radio, User } from 'lucide-react';

interface NavbarProps {
  currentRole: 'guest' | 'participant' | 'instructor';
  participantNickname?: string;
  sessionCode?: string;
  onNavigate: (view: string) => void;
  onLeave?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  participantNickname,
  sessionCode,
  onNavigate,
  onLeave,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={() => onNavigate('home')}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="h-9 w-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:border-cyan-400 group-hover:scale-105 transition-all">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-base sm:text-lg tracking-tight text-white group-hover:text-cyan-400 transition-colors">
                CyberGuard<span className="text-cyan-400">Lab</span>
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800">
                Live
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Defensive Cybersecurity & AI Privacy Platform
            </p>
          </div>
        </div>

        {/* Status / Role Info */}
        <div className="flex items-center space-x-3">
          {currentRole === 'participant' && (
            <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-full px-3 py-1 text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-slate-400 font-mono">ROOM:</span>
              <span className="font-mono font-bold text-cyan-400">{sessionCode}</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-300 font-medium flex items-center gap-1">
                <User className="h-3 w-3 text-slate-400" />
                {participantNickname}
              </span>
            </div>
          )}

          {currentRole === 'instructor' && (
            <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-full px-3 py-1 text-xs">
              <Radio className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
              <span className="text-cyan-400 font-semibold uppercase tracking-wider">Instructor Console</span>
            </div>
          )}

          {/* Action buttons */}
          {currentRole === 'guest' ? (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onNavigate('instructor-login')}
                className="text-xs sm:text-sm text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-600 transition"
              >
                Instructor Login
              </button>
              <button
                onClick={() => onNavigate('join')}
                className="text-xs sm:text-sm bg-cyan-600 hover:bg-cyan-500 text-white font-medium px-3.5 py-1.5 rounded-lg shadow-sm shadow-cyan-900/50 transition"
              >
                Join Room
              </button>
            </div>
          ) : (
            <button
              onClick={onLeave}
              className="text-xs flex items-center space-x-1.5 text-slate-400 hover:text-rose-400 px-2.5 py-1.5 rounded-lg border border-slate-800 hover:border-rose-900/50 hover:bg-rose-950/20 transition"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Exit</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
