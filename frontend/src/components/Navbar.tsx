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
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={() => onNavigate('home')}
          className="flex items-center space-x-3 cursor-pointer group select-none"
        >
          <div className="h-9 w-9 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-base sm:text-lg tracking-tight text-white">
                CyberGuard<span className="text-cyan-400">Lab</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Defensive Cybersecurity & AI Privacy Platform
            </p>
          </div>
        </div>

        {/* Status / Role Info */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {currentRole === 'participant' && (
            <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0"></span>
              <span className="text-slate-400 font-mono hidden xs:inline">ROOM:</span>
              <span className="font-mono font-bold text-cyan-400">{sessionCode}</span>
              <span className="text-slate-700">|</span>
              <span className="text-slate-200 font-medium flex items-center gap-1 max-w-[100px] sm:max-w-[140px] truncate">
                <User className="h-3 w-3 text-slate-400 shrink-0" />
                <span className="truncate">{participantNickname}</span>
              </span>
            </div>
          )}

          {currentRole === 'instructor' && (
            <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs">
              <Radio className="h-3.5 w-3.5 text-cyan-400" />
              <span className="text-cyan-400 font-semibold uppercase tracking-wider">Instructor Console</span>
            </div>
          )}

          {/* Action buttons with minimum 44px touch targets on mobile */}
          {currentRole === 'guest' ? (
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => onNavigate('instructor-login')}
                className="min-h-[40px] sm:min-h-[36px] text-xs sm:text-sm text-slate-300 hover:text-white px-3 py-2 rounded-lg border border-slate-800 hover:bg-slate-900 transition"
              >
                Instructor
              </button>
              <button
                type="button"
                onClick={() => onNavigate('join')}
                className="min-h-[40px] sm:min-h-[36px] text-xs sm:text-sm bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold px-3.5 py-2 rounded-lg transition"
              >
                Join Room
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onLeave}
              className="min-h-[40px] sm:min-h-[36px] text-xs flex items-center space-x-1.5 text-slate-400 hover:text-rose-400 px-3 py-2 rounded-lg border border-slate-800 hover:bg-slate-900 transition"
              title="Exit Room"
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
