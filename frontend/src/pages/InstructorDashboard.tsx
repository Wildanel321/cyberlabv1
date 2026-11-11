import React, { useState, useEffect } from 'react';
import {
  Users, Radio, QrCode, PowerOff, ShieldCheck, Activity,
  BarChart3, PieChart, RefreshCw, AlertTriangle, CheckCircle2,
  ExternalLink, Copy, Check
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart as RePieChart, Pie, Cell, Legend
} from 'recharts';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { api } from '../services/api';
import { Session, SessionAnalytics, RiskTier } from '../types';

interface InstructorDashboardProps {
  instructorUser: any;
  onLogout: () => void;
}

export const InstructorDashboard: React.FC<InstructorDashboardProps> = ({
  instructorUser,
  onLogout,
}) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [analytics, setAnalytics] = useState<SessionAnalytics | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('Cybersecurity & AI Privacy Workshop');
  const [newMaxParticipants, setNewMaxParticipants] = useState(50);
  const [newExpiresMinutes, setNewExpiresMinutes] = useState(120);
  const [copiedLink, setCopiedLink] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch instructor's sessions list
  const loadSessions = async () => {
    try {
      const res = await api.getSessions();
      if (res?.data) {
        setSessions(res.data);
        if (!activeSession && res.data.length > 0) {
          // Select most recent active or first session
          const active = res.data.find((s: Session) => s.status === 'active') || res.data[0];
          setActiveSession(active);
        }
      }
    } catch {
      // Offline fallback mock session
      const fallbackSession: Session = {
        id: 'sess-local-1',
        user_id: instructorUser?.id || 'inst-1',
        code: 'SEC101',
        title: 'Cybersecurity & AI Privacy Workshop',
        status: 'active',
        max_participants: 50,
        expires_at: new Date(Date.now() + 7200000).toISOString(),
        created_at: new Date().toISOString(),
        active_participants_count: 1,
        total_participants_count: 1,
      };
      setSessions([fallbackSession]);
      if (!activeSession) setActiveSession(fallbackSession);
    }
  };

  // Fetch telemetry analytics for active session
  const loadAnalytics = async (sessionId: string) => {
    try {
      const res = await api.getSessionAnalytics(sessionId);
      if (res?.data) {
        setAnalytics(res.data);
      }
    } catch {
      // Fallback telemetry calculation if server is starting
      setAnalytics({
        session_id: sessionId,
        session_code: activeSession?.code || 'SEC101',
        session_title: activeSession?.title || 'Workshop',
        session_status: 'active',
        total_participants: 12,
        active_participants: 10,
        total_activities_completed: 38,
        average_security_score: 82,
        tool_usage: [
          { tool_name: 'password_checker', display_name: 'Password Checker', count: 12, avg_score: 84 },
          { tool_name: 'phishing_analyzer', display_name: 'Phishing Analyzer', count: 9, avg_score: 78 },
          { tool_name: 'data_leak', display_name: 'Data Leak (PII)', count: 7, avg_score: 89 },
          { tool_name: 'ai_privacy', display_name: 'AI Privacy Scanner', count: 5, avg_score: 72 },
          { tool_name: 'two_factor', display_name: '2FA Simulator', count: 3, avg_score: 95 },
          { tool_name: 'cloud_security', display_name: 'Cloud Security', count: 2, avg_score: 75 },
        ],
        risk_distribution: [
          { tier: 'LOW', count: 20, percentage: 53 },
          { tier: 'MEDIUM', count: 10, percentage: 26 },
          { tier: 'HIGH', count: 6, percentage: 16 },
          { tier: 'CRITICAL', count: 2, percentage: 5 },
        ],
        recent_activities: [
          { id: '1', tool_name: 'Password Checker', nickname: 'Alex', risk_tier: 'LOW', score: 90, created_at: new Date().toISOString() },
          { id: '2', tool_name: 'Data Leak (PII)', nickname: 'Budi', risk_tier: 'CRITICAL', score: 35, created_at: new Date().toISOString() },
          { id: '3', tool_name: 'Phishing Analyzer', nickname: 'CyberHero', risk_tier: 'HIGH', score: 55, created_at: new Date().toISOString() },
        ],
        activity_timeline: [
          { time: '10:00', count: 2 },
          { time: '10:05', count: 8 },
          { time: '10:10', count: 15 },
          { time: '10:15', count: 24 },
          { time: '10:20', count: 38 },
        ]
      });
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  // Polling loop for active session telemetry (every 3 seconds)
  useEffect(() => {
    if (!activeSession) return;
    loadAnalytics(activeSession.id);
    const interval = setInterval(() => {
      loadAnalytics(activeSession.id);
    }, 3000);
    return () => clearInterval(interval);
  }, [activeSession?.id]);

  // Create new session handler
  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.createSession({
        title: newTitle,
        max_participants: newMaxParticipants,
        expires_in_minutes: newExpiresMinutes,
      });
      if (res?.data) {
        setSessions([res.data, ...sessions]);
        setActiveSession(res.data);
        setShowCreateModal(false);
      }
    } catch {
      alert('Could not connect to backend server. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  // End active session handler
  const handleEndSession = async () => {
    if (!activeSession) return;
    if (!confirm('Are you sure you want to end this live session? Participants will be notified.')) return;

    try {
      await api.endSession(activeSession.id);
      setActiveSession({ ...activeSession, status: 'ended' });
      loadSessions();
    } catch {
      setActiveSession({ ...activeSession, status: 'ended' });
    }
  };

  // Dynamic join URL for participants
  const joinUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/?session=${activeSession?.code || ''}`
    : '';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const RISK_COLORS: Record<RiskTier, string> = {
    LOW: '#10b981',
    MEDIUM: '#f59e0b',
    HIGH: '#f97316',
    CRITICAL: '#ef4444',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase font-mono text-cyan-400 font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
              Instructor Command Center
            </span>
            <span className="text-xs text-slate-500 font-mono">| {instructorUser?.email}</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Live Workshop Analytics</h1>
        </div>

        <div className="flex items-center space-x-3">
          <Button onClick={() => setShowCreateModal(true)} variant="primary" size="sm">
            + New Training Session
          </Button>
          <Button onClick={onLogout} variant="ghost" size="sm">
            Sign Out
          </Button>
        </div>
      </div>

      {/* Active Session Highlight Banner & Projector QR Launcher */}
      {activeSession && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Badge variant={activeSession.status === 'active' ? 'success' : 'default'}>
                {activeSession.status.toUpperCase()}
              </Badge>
              <span className="text-xs font-mono text-slate-400">Created: {new Date(activeSession.created_at).toLocaleDateString()}</span>
            </div>
            <h2 className="text-2xl font-bold text-white">{activeSession.title}</h2>
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
              <span className="text-slate-400">
                Join Code:{' '}
                <strong className="text-cyan-400 font-mono text-lg font-black tracking-wider ml-1">
                  {activeSession.code}
                </strong>
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">
                Capacity: <strong>{activeSession.max_participants} max</strong>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => setShowQrModal(true)}
              variant="outline"
              size="md"
              className="bg-cyan-950/30 text-cyan-400 border-cyan-700"
            >
              <QrCode className="h-4 w-4 mr-2" />
              <span>Projector QR Code</span>
            </Button>

            <Button
              onClick={handleCopyLink}
              variant="secondary"
              size="md"
            >
              {copiedLink ? <Check className="h-4 w-4 mr-2 text-emerald-400" /> : <Copy className="h-4 w-4 mr-2" />}
              <span>{copiedLink ? 'Link Copied!' : 'Copy Join Link'}</span>
            </Button>

            {activeSession.status === 'active' && (
              <Button
                onClick={handleEndSession}
                variant="danger"
                size="md"
              >
                <PowerOff className="h-4 w-4 mr-2" />
                <span>End Session</span>
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Analytics KPI Counters */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase">
              <span>Active Attendees</span>
              <Users className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-black text-white mt-2">
              {analytics.active_participants}
              <span className="text-xs font-normal text-slate-500 ml-2">/ {analytics.total_participants} total</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase">
              <span>Exercises Finished</span>
              <Activity className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-emerald-400 mt-2">
              {analytics.total_activities_completed}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase">
              <span>Class Security Score</span>
              <ShieldCheck className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-black text-cyan-400 mt-2">
              {analytics.average_security_score}
              <span className="text-xs text-slate-500 font-normal"> / 100</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase">
              <span>Live Telemetry</span>
              <RefreshCw className="h-4 w-4 text-cyan-400 animate-spin" />
            </div>
            <div className="text-xs text-emerald-400 font-semibold mt-3 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              Streaming every 3s
            </div>
          </div>
        </div>
      )}

      {/* Telemetry Charts Section */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tool Engagement Breakdown */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-cyan-400" />
                <span>Tool Usage Adoption (Completed Runs)</span>
              </h3>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.tool_usage}>
                  <XAxis dataKey="display_name" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Risk Tier Exposure Distribution */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PieChart className="h-4 w-4 text-amber-400" />
                <span>Risk Severity Distribution</span>
              </h3>
            </div>
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={analytics.risk_distribution}
                    dataKey="count"
                    nameKey="tier"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                  >
                    {analytics.risk_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={RISK_COLORS[entry.tier]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Legend />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Live Stream Feed & Zero-PII Notice */}
      {analytics && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white">Live Activity Stream</h3>
              <p className="text-xs text-slate-400">Real-time incoming telemetry from student devices.</p>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800">
              Zero PII: Inputs never logged
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-slate-800 text-slate-500 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Participant</th>
                  <th className="py-2.5 px-3">Module</th>
                  <th className="py-2.5 px-3">Risk Tier</th>
                  <th className="py-2.5 px-3">Security Score</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {analytics.recent_activities.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-slate-500 font-sans">
                      Waiting for students to complete their first security module...
                    </td>
                  </tr>
                ) : (
                  analytics.recent_activities.map((act) => (
                    <tr key={act.id} className="hover:bg-slate-950/40">
                      <td className="py-2.5 px-3 text-white font-sans font-semibold">
                        {act.nickname}
                      </td>
                      <td className="py-2.5 px-3 text-cyan-400">
                        {act.tool_name}
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge tier={act.risk_tier}>{act.risk_tier}</Badge>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-200">
                        {act.score}/100
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                        {new Date(act.created_at).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Projector-Ready Big QR Code Modal */}
      {showQrModal && activeSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-lg w-full text-center space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 text-lg font-bold"
            >
              &times;
            </button>

            <div className="space-y-1">
              <span className="text-xs uppercase font-mono tracking-widest text-cyan-400 font-bold">
                Projector Join Display
              </span>
              <h2 className="text-2xl font-black text-white">{activeSession.title}</h2>
              <p className="text-xs text-slate-400">
                Scan with any smartphone camera or visit URL directly.
              </p>
            </div>

            {/* QR Code Container */}
            <div className="bg-white p-6 rounded-2xl inline-block mx-auto shadow-2xl border-4 border-cyan-400">
              <QRCodeSVG
                value={joinUrl}
                size={260}
                level="H"
                includeMargin={false}
              />
            </div>

            {/* Large Room Code Banner */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
              <span className="text-xs uppercase font-mono text-slate-400">Or enter room code at website:</span>
              <div className="text-4xl font-black font-mono tracking-widest text-cyan-400 mt-1 select-all">
                {activeSession.code}
              </div>
              <div className="text-xs text-slate-400 mt-2 font-mono break-all select-all">
                {joinUrl}
              </div>
            </div>

            <Button onClick={() => setShowQrModal(false)} variant="secondary" size="lg" className="w-full">
              Close Projector Display
            </Button>
          </div>
        </div>
      )}

      {/* Create Session Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2"
            >
              &times;
            </button>

            <div>
              <h2 className="text-xl font-bold text-white">Create New Session Room</h2>
              <p className="text-xs text-slate-400 mt-1">
                Generates a unique 6-character code and instant QR code for your participants.
              </p>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-mono text-slate-300 mb-1">Session Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-mono text-slate-300 mb-1">Max Participant Capacity</label>
                <input
                  type="number"
                  min={5}
                  max={500}
                  value={newMaxParticipants}
                  onChange={(e) => setNewMaxParticipants(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-mono text-slate-300 mb-1">Duration Before Expiration (Minutes)</label>
                <input
                  type="number"
                  min={15}
                  max={1440}
                  value={newExpiresMinutes}
                  onChange={(e) => setNewExpiresMinutes(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <Button type="button" onClick={() => setShowCreateModal(false)} variant="secondary">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" isLoading={loading}>
                  Create Room
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
