import React, { useState, useEffect } from 'react';
import { QrCode, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { api, ApiError } from '../services/api';

interface ParticipantJoinProps {
  initialCode?: string;
  onJoinSuccess: (data: { participant_id: string; participant_token: string; nickname: string; session: any }) => void;
  onNavigateHome: () => void;
}

export const ParticipantJoin: React.FC<ParticipantJoinProps> = ({
  initialCode = '',
  onJoinSuccess,
  onNavigateHome,
}) => {
  const [code, setCode] = useState(initialCode.toUpperCase());
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If URL has ?session=XXXXXX, auto-populate code
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get('session');
    if (codeParam) {
      setCode(codeParam.toUpperCase().slice(0, 6));
    }
  }, []);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length !== 6) {
      setError('Session code must be exactly 6 characters.');
      return;
    }
    if (!nickname.trim()) {
      setError('Please provide a nickname for this session.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.joinSession({
        code: code.trim().toUpperCase(),
        nickname: nickname.trim(),
      });

      // Save participant credentials locally for reconnects
      localStorage.setItem('participant_token', response.data.participant_token);
      localStorage.setItem('participant_id', response.data.participant_id);
      localStorage.setItem('participant_nickname', response.data.nickname);
      localStorage.setItem('participant_session_id', response.data.session.id);
      localStorage.setItem('participant_session_code', response.data.session.code);

      onJoinSuccess(response.data);
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message || 'Unable to join session. Verify session code or room capacity.');
      } else {
        setError('Network error. Check server connectivity.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="h-12 w-12 rounded-xl bg-cyan-950/80 border border-cyan-800 mx-auto flex items-center justify-center text-cyan-400">
            <QrCode className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Join Session</h2>
          <p className="text-xs text-slate-400">
            Enter the 6-character room code or scan the instructor QR code.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block text-xs uppercase font-mono font-semibold text-slate-300 mb-1.5">
              Room Code (6 Characters)
            </label>
            <input
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. CYB890"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-center text-2xl font-mono font-bold tracking-widest text-cyan-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 placeholder-slate-700"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs uppercase font-mono font-semibold text-slate-300 mb-1.5">
              Your Nickname / Call-Sign
            </label>
            <input
              type="text"
              maxLength={24}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="e.g. CyberNinja, Alex, Budi"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={loading}
            className="w-full mt-2"
          >
            <span>Enter Training Room</span>
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </form>

        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <button
            type="button"
            onClick={onNavigateHome}
            className="hover:text-white transition"
          >
            &larr; Back to Home
          </button>
          <span className="flex items-center gap-1 text-[11px] text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            Zero Registration
          </span>
        </div>
      </div>
    </div>
  );
};
