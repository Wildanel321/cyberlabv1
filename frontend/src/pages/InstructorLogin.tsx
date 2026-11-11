import React, { useState } from 'react';
import { Lock, ArrowRight, ShieldCheck, AlertCircle, UserPlus, LogIn } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { api, ApiError } from '../services/api';

interface InstructorLoginProps {
  onLoginSuccess: (user: any, token: string) => void;
  onNavigateHome: () => void;
}

export const InstructorLogin: React.FC<InstructorLoginProps> = ({
  onLoginSuccess,
  onNavigateHome,
}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isRegister) {
        if (password !== passwordConfirmation) {
          setError('Passwords do not match.');
          setLoading(false);
          return;
        }
        const res = await api.register({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          password_confirmation: passwordConfirmation,
        });
        localStorage.setItem('instructor_token', res.token);
        localStorage.setItem('instructor_user', JSON.stringify(res.user));
        onLoginSuccess(res.user, res.token);
      } else {
        const res = await api.login({
          email: email.trim().toLowerCase(),
          password,
        });
        localStorage.setItem('instructor_token', res.token);
        localStorage.setItem('instructor_user', JSON.stringify(res.user));
        onLoginSuccess(res.user, res.token);
      }
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message || 'Authentication failed. Please check credentials.');
      } else {
        setError('Network error or server unreachable.');
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
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {isRegister ? 'Instructor Registration' : 'Instructor Sign In'}
          </h2>
          <p className="text-xs text-slate-400">
            {isRegister
              ? 'Create an account to host real-time security workshops and view analytics.'
              : 'Enter your credentials to manage active session rooms.'}
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs uppercase font-mono font-semibold text-slate-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. Cybersecurity / Instructor Name"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm"
              />
            </div>
          )}

          <div>
            <label className="block text-xs uppercase font-mono font-semibold text-slate-300 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="instructor@cyberlab.edu"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs uppercase font-mono font-semibold text-slate-300 mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm"
            />
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs uppercase font-mono font-semibold text-slate-300 mb-1.5">
                Confirm Password
              </label>
              <input
                type="password"
                required
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm"
              />
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={loading}
            className="w-full mt-2"
          >
            {isRegister ? (
              <span className="flex items-center space-x-2">
                <UserPlus className="h-4 w-4" />
                <span>Create Instructor Account</span>
              </span>
            ) : (
              <span className="flex items-center space-x-2">
                <LogIn className="h-4 w-4" />
                <span>Sign In to Console</span>
              </span>
            )}
          </Button>
        </form>

        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
            }}
            className="text-xs text-cyan-400 hover:underline"
          >
            {isRegister
              ? 'Already have an account? Sign in here'
              : "Don't have an instructor account? Register here"}
          </button>
        </div>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <button
            type="button"
            onClick={onNavigateHome}
            className="hover:text-white transition"
          >
            &larr; Back to Home
          </button>
          <span className="flex items-center gap-1 text-[11px] text-cyan-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            Sanctum Bearer Tokens
          </span>
        </div>
      </div>
    </div>
  );
};

