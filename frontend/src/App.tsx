import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { ParticipantJoin } from './pages/ParticipantJoin';
import { ParticipantDashboard } from './pages/ParticipantDashboard';
import { InstructorLogin } from './pages/InstructorLogin';
import { InstructorDashboard } from './pages/InstructorDashboard';
import { PasswordCheckerTool } from './components/tools/PasswordCheckerTool';
import { PhishingAnalyzerTool } from './components/tools/PhishingAnalyzerTool';
import { DataLeakSimulatorTool } from './components/tools/DataLeakSimulatorTool';
import { AiPrivacyCheckerTool } from './components/tools/AiPrivacyCheckerTool';
import { TwoFactorSimulatorTool } from './components/tools/TwoFactorSimulatorTool';
import { CloudSecuritySimulatorTool } from './components/tools/CloudSecuritySimulatorTool';
import { DreadSimulatorTool } from './components/tools/DreadSimulatorTool';
import { ArrowLeft } from 'lucide-react';
import { api } from './services/api';

export function App() {
  const [currentView, setCurrentView] = useState<string>('home');
  const [sandboxTool, setSandboxTool] = useState<string | null>(null);

  // Participant state
  const [participant, setParticipant] = useState<{
    id: string;
    token: string;
    nickname: string;
    sessionCode: string;
  } | null>(null);

  // Instructor state
  const [instructor, setInstructor] = useState<{
    user: any;
    token: string;
  } | null>(null);

  // Check saved state on initial load
  useEffect(() => {
    const savedPartToken = localStorage.getItem('participant_token');
    const savedPartId = localStorage.getItem('participant_id');
    const savedPartNick = localStorage.getItem('participant_nickname');
    const savedPartCode = localStorage.getItem('participant_session_code');

    if (savedPartToken && savedPartId && savedPartNick && savedPartCode) {
      setParticipant({
        id: savedPartId,
        token: savedPartToken,
        nickname: savedPartNick,
        sessionCode: savedPartCode,
      });
      setCurrentView('participant-dashboard');
      return;
    }

    const savedInstToken = localStorage.getItem('instructor_token');
    const savedInstUser = localStorage.getItem('instructor_user');

    if (savedInstToken && savedInstUser) {
      try {
        setInstructor({
          token: savedInstToken,
          user: JSON.parse(savedInstUser),
        });
        setCurrentView('instructor-dashboard');
      } catch {
        // Clear corrupted storage
        localStorage.removeItem('instructor_token');
        localStorage.removeItem('instructor_user');
      }
    }
  }, []);

  const handleParticipantJoinSuccess = (data: any) => {
    setParticipant({
      id: data.participant_id,
      token: data.participant_token,
      nickname: data.nickname,
      sessionCode: data.session.code,
    });
    setCurrentView('participant-dashboard');
  };

  const handleInstructorLoginSuccess = (user: any, token: string) => {
    setInstructor({ user, token });
    setCurrentView('instructor-dashboard');
  };

  const handleLeaveSession = async () => {
    try {
      await api.leaveSession();
    } catch {
      // Ignore
    }
    localStorage.removeItem('participant_token');
    localStorage.removeItem('participant_id');
    localStorage.removeItem('participant_nickname');
    localStorage.removeItem('participant_session_id');
    localStorage.removeItem('participant_session_code');
    setParticipant(null);
    setCurrentView('home');
  };

  const handleInstructorLogout = async () => {
    try {
      await api.logout();
    } catch {
      // Ignore
    }
    localStorage.removeItem('instructor_token');
    localStorage.removeItem('instructor_user');
    setInstructor(null);
    setCurrentView('home');
  };

  // Determine navbar role
  let navRole: 'guest' | 'participant' | 'instructor' = 'guest';
  if (participant && currentView === 'participant-dashboard') navRole = 'participant';
  else if (instructor && currentView === 'instructor-dashboard') navRole = 'instructor';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-black">
      <Navbar
        currentRole={navRole}
        participantNickname={participant?.nickname}
        sessionCode={participant?.sessionCode}
        onNavigate={(view) => {
          setSandboxTool(null);
          setCurrentView(view);
        }}
        onLeave={navRole === 'participant' ? handleLeaveSession : handleInstructorLogout}
      />

      <main className="flex-1">
        {currentView === 'home' && (
          <Home
            onNavigate={setCurrentView}
            onSelectSandboxTool={(t) => {
              setSandboxTool(t);
              setCurrentView('sandbox-tool');
            }}
          />
        )}

        {currentView === 'join' && (
          <ParticipantJoin
            onJoinSuccess={handleParticipantJoinSuccess}
            onNavigateHome={() => setCurrentView('home')}
          />
        )}

        {currentView === 'participant-dashboard' && participant && (
          <ParticipantDashboard
            participantId={participant.id}
            nickname={participant.nickname}
            sessionCode={participant.sessionCode}
            onExit={handleLeaveSession}
          />
        )}

        {currentView === 'instructor-login' && (
          <InstructorLogin
            onLoginSuccess={handleInstructorLoginSuccess}
            onNavigateHome={() => setCurrentView('home')}
          />
        )}

        {currentView === 'instructor-dashboard' && instructor && (
          <InstructorDashboard
            instructorUser={instructor.user}
            onLogout={handleInstructorLogout}
          />
        )}

        {currentView === 'sandbox-tool' && (
          <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
            <button
              onClick={() => {
                setSandboxTool(null);
                setCurrentView('home');
              }}
              className="inline-flex items-center space-x-2 text-xs font-medium text-cyan-400 hover:text-cyan-300 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </button>

            {sandboxTool === 'password' && (
              <PasswordCheckerTool onComplete={() => alert('Sandbox check complete! (Join a live room to submit to instructor)')} />
            )}
            {sandboxTool === 'phishing' && (
              <PhishingAnalyzerTool onComplete={() => alert('Sandbox check complete! (Join a live room to submit to instructor)')} />
            )}
            {sandboxTool === 'data-leak' && (
              <DataLeakSimulatorTool onComplete={() => alert('Sandbox check complete! (Join a live room to submit to instructor)')} />
            )}
            {sandboxTool === 'ai-privacy' && (
              <AiPrivacyCheckerTool onComplete={() => alert('Sandbox check complete! (Join a live room to submit to instructor)')} />
            )}
            {sandboxTool === 'two-factor' && (
              <TwoFactorSimulatorTool onComplete={() => alert('Sandbox check complete! (Join a live room to submit to instructor)')} />
            )}
            {sandboxTool === 'cloud' && (
              <CloudSecuritySimulatorTool onComplete={() => alert('Sandbox check complete! (Join a live room to submit to instructor)')} />
            )}
            {sandboxTool === 'dread' && (
              <DreadSimulatorTool onComplete={() => alert('Sandbox check complete! (Join a live room to submit to instructor)')} />
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
export default App;
