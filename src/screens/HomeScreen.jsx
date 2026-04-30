import { useState, useMemo } from 'react';
import { scenarios } from '../data/scenarios.js';
import CustomScenarioForm from '../components/CustomScenarioForm';
import { calculateStats } from '../hooks/useForge';

const intensityColor = {
  High: '#FF4B1F',
  Medium: '#FF8C42',
  Low: '#10B981',
};

function ScenarioCard({ scenario, onStart }) {
  return (
    <div className="group relative cursor-pointer" onClick={() => onStart(scenario.id)}>
      <div
        className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: 'linear-gradient(135deg, #FF4B1F22, #FF8C4211)' }}
      />
      <div
        className="relative rounded-2xl p-8 border transition-all duration-300 h-full flex flex-col"
        style={{ background: '#111113', borderColor: '#1E1E22' }}
      >
        <div className="flex items-start justify-between mb-6">
          <div className="flex gap-2">
            <div
              className="text-xs font-mono font-medium px-3 py-1 rounded-full"
              style={{
                color: intensityColor[scenario.intensity] || '#FF4B1F',
                background: `${intensityColor[scenario.intensity] || '#FF4B1F'}18`,
                border: `1px solid ${intensityColor[scenario.intensity] || '#FF4B1F'}33`,
              }}
            >
              {scenario.intensity} Pressure
            </div>
            {scenario.type === 'video' && (
              <div
                className="text-xs font-mono font-bold px-3 py-1 rounded-full flex items-center gap-1.5"
                style={{
                  color: '#fff',
                  background: '#FF4B1F',
                  boxShadow: '0 0 10px rgba(255, 75, 31, 0.4)'
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                VIDEO
              </div>
            )}
          </div>
          <div className="text-sm font-mono text-forge-muted" style={{ color: '#6B6B70' }}>
            {scenario.durationMin} min
          </div>
        </div>

        <h3
          className="font-display text-3xl mb-3 group-hover:text-forge-accent transition-colors"
          style={{ color: '#E8E6E1', letterSpacing: '0.03em' }}
        >
          {scenario.title}
        </h3>

        <p className="text-base mb-6 leading-relaxed flex-1" style={{ color: '#6B6B70' }}>
          {scenario.subtitle}
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {scenario.tags.map(tag => (
            <span key={tag} className="text-xs px-2.5 py-1 rounded font-mono"
              style={{ background: '#1E1E22', color: '#6B6B70' }}>
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-3 mb-8">
          <span className="text-xs font-mono uppercase tracking-widest" style={{ color: '#3A3A3F' }}>Cast:</span>
          <div className="flex -space-x-2">
            {scenario.characters.map(char => (
              <div key={char.id}
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold border-2"
                style={{ background: '#0A0A0B', color: char.color, borderColor: '#1E1E22' }}
                title={`${char.name} — ${char.role}`}
              >
                {char.initial}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-6 mt-auto" style={{ borderTop: '1px solid #1E1E22' }}>
          <span className="text-xs font-mono" style={{ color: '#3A3A3F' }}>Judgment Training</span>
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-forge-accent" style={{ color: '#FF4B1F' }}>
            Enter
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginModal({ isOpen, onClose, signIn, signUp, loginAsDemo, error }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const success = isSignUp 
      ? await signUp(email, password)
      : await signIn(email, password);
    
    setIsLoading(false);
    if (success && !isSignUp) onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-[#111113] border border-[#1E1E22] rounded-[32px] p-8 md:p-10 shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FF4B1F] to-transparent opacity-50" />
        
        <div className="flex justify-between items-center mb-8">
          <h2 className="font-display text-3xl text-[#E8E6E1] tracking-tight">
            {isSignUp ? 'CREATE_ACCOUNT' : 'SECURE_LOGIN'}
          </h2>
          <button onClick={onClose} className="text-[#3A3A3F] hover:text-[#FF4B1F] transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#3A3A3F]">Neural_ID (Email)</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0A0A0B] border border-[#1E1E22] rounded-xl px-5 py-4 text-[#E8E6E1] focus:border-[#FF4B1F33] focus:ring-1 focus:ring-[#FF4B1F33] transition-all outline-none"
              placeholder="name@example.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#3A3A3F]">Passkey</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0A0A0B] border border-[#1E1E22] rounded-xl px-5 py-4 text-[#E8E6E1] focus:border-[#FF4B1F33] focus:ring-1 focus:ring-[#FF4B1F33] transition-all outline-none"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-[10px] font-mono uppercase text-orange-500 tracking-wider">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-[#FF4B1F] text-white rounded-xl font-mono text-sm uppercase tracking-[0.2em] hover:brightness-110 transition-all shadow-xl shadow-orange-900/20 disabled:opacity-50"
          >
            {isLoading ? 'SYNCING...' : isSignUp ? 'INITIALIZE_ACCOUNT' : 'DECRYPT_ACCESS'}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-[#1E1E22] flex flex-col gap-4">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[10px] font-mono text-[#6B6B70] hover:text-[#E8E6E1] transition-colors uppercase tracking-widest text-center"
          >
            {isSignUp ? 'Already have access? Login' : 'Need a neural link? Sign up'}
          </button>
          
          <button
            onClick={() => {
              loginAsDemo();
              onClose();
            }}
            className="text-[10px] font-mono text-[#3A3A3F] hover:text-[#FF4B1F] transition-colors uppercase tracking-widest text-center"
          >
            Bypass with Demo_Mode
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HomeScreen({ onStart, onStartCustom, user, sessions, signIn, signUp, loginAsDemo, logout, authError, setScreen }) {
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const stats = useMemo(() => calculateStats(sessions), [sessions]);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0A0A0B' }}>
      <div className="fixed inset-0 noise-overlay opacity-60 pointer-events-none" />
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      <div className="relative z-10 flex flex-col min-h-screen max-w-7xl mx-auto w-full px-6 md:px-12">
        {/* Nav */}
        <nav className="flex items-center justify-between py-6 md:py-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center shadow-lg shadow-orange-900/20" style={{ background: '#FF4B1F' }}>
              <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 14 14" fill="none">
                <path d="M7 1C7 1 9 4 9 6.5C9 7.88 7.88 9 6.5 9C5.12 9 4 7.88 4 6.5C4 5.5 4.5 4.5 5 4C4 5 3 7 4.5 9.5C5.3 11 6.5 12 6.5 12C6.5 12 10 10 10 6.5C10 3.5 7 1 7 1Z" fill="white" />
              </svg>
            </div>
            <span className="font-display text-xl md:text-3xl tracking-[0.2em]" style={{ color: '#E8E6E1' }}>FORGE</span>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-4 md:gap-8">
              {user ? (
                <div className="flex items-center gap-4 md:gap-6">
                  <button 
                    onClick={() => setScreen('dashboard')}
                    className="flex items-center gap-2 group"
                  >
                    <span className="text-[10px] md:text-xs font-mono uppercase tracking-[0.2em] text-[#6B6B70] group-hover:text-[#FF4B1F] transition-colors">
                      Profile
                    </span>
                    {sessions.length > 0 && (
                      <span className="w-5 h-5 rounded-full bg-[#1E1E22] border border-[#3A3A3F] flex items-center justify-center text-[10px] font-mono text-[#FF4B1F] group-hover:border-[#FF4B1F33] transition-colors">
                        {sessions.length}
                      </span>
                    )}
                  </button>
                  <div className="flex items-center gap-3 pl-4 md:pl-6 border-l border-[#1E1E22]">
                    <div className="hidden sm:block text-right">
                      <p className="text-[10px] font-mono text-[#E8E6E1] leading-none mb-1 capitalize">{user.email.split('@')[0]}</p>
                      <button onClick={logout} className="text-[9px] font-mono text-[#3A3A3F] hover:text-[#FF4B1F] uppercase tracking-widest transition-colors">Logout</button>
                    </div>
                    <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#111113] border border-[#1E1E22] flex items-center justify-center overflow-hidden">
                      {user.user_metadata?.avatar_url ? (
                        <img src={user.user_metadata.avatar_url} alt="profile" className="w-full h-full object-cover opacity-80" />
                      ) : (
                        <span className="text-xs font-mono text-[#FF4B1F]">{user.email[0].toUpperCase()}</span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setIsLoginModalOpen(true)}
                  className="text-[10px] md:text-xs font-mono uppercase tracking-[0.3em] px-5 py-2 rounded-full border border-[#1E1E22] hover:border-[#FF4B1F33] hover:bg-[#FF4B1F10] transition-all flex items-center gap-2 group"
                  style={{ color: '#E8E6E1' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3A3A3F] group-hover:bg-[#FF4B1F] animate-pulse" />
                  Auth_Login
                </button>
              )}
            </div>
            {authError && (
              <span className={`text-[9px] font-mono uppercase tracking-widest ${authError.includes('SUCCESS') ? 'text-green-500' : 'text-orange-500'}`}>
                {authError}
              </span>
            )}
          </div>
        </nav>

        {/* Welcome Banner */}
        {user && stats && (
          <div className="mb-10 fade-up">
            <div className="bg-[#111113] border border-[#1E1E22] rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#FF4B1F]" />
              <div className="relative z-10">
                <p className="text-[10px] font-mono text-[#3A3A3F] uppercase tracking-[0.3em] mb-2">Neural_Link_Established</p>
                <h2 className="text-xl md:text-2xl font-display text-[#E8E6E1] tracking-wide">
                  WELCOME BACK — YOU'VE COMPLETED <span className="text-[#FF4B1F]">{stats.totalSessions}</span> SCENARIOS.
                </h2>
                <p className="text-sm text-[#6B6B70] mt-1">
                  Your judgment profile is evolving. Current strongest trait: <span className="text-[#E8E6E1] font-mono uppercase tracking-tighter">{stats.strongestTrait} ({stats.strongestScore}%)</span>
                </p>
              </div>
              <button 
                onClick={() => setScreen('dashboard')}
                className="relative z-10 px-6 py-3 bg-[#1E1E22] border border-[#3A3A3F] rounded-xl text-[10px] font-mono text-[#E8E6E1] uppercase tracking-widest hover:bg-[#FF4B1F] hover:border-[#FF4B1F] transition-all"
              >
                View_Full_Profile
              </button>
            </div>
          </div>
        )}

        {/* Hero */}
        <div className="pt-10 md:pt-20 pb-16 md:pb-24 grid lg:grid-cols-2 items-center gap-12 lg:gap-20">
          <div>
            <div
              className="inline-block text-[10px] md:text-xs font-mono px-3 md:px-4 py-1.5 rounded-full mb-6 md:mb-8 uppercase tracking-[0.2em]"
              style={{ background: '#FF4B1F18', color: '#FF4B1F', border: '1px solid #FF4B1F33' }}
            >
              The Simulator for High-Stakes Leadership
            </div>

            <h1
              className="font-display leading-[0.9] mb-8 md:mb-10 text-5xl md:text-7xl lg:text-[110px]"
              style={{ color: '#E8E6E1', letterSpacing: '-0.02em' }}
            >
              TRAIN YOUR<br />
              JUDGMENT<br />
              <span style={{ color: '#FF4B1F' }}>UNDER PRESSURE.</span>
            </h1>

            <p className="text-base md:text-xl leading-relaxed max-w-lg mb-10" style={{ color: '#6B6B70' }}>
              Drop into pressure-cooker scenarios with AI characters that react to every word you say. 
              No guidance. No multiple choice. Just you, your instincts, and the fallout.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => document.getElementById('scenarios-section').scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 bg-[#FF4B1F] text-white rounded-xl font-mono text-sm uppercase tracking-widest hover:brightness-110 transition-all shadow-xl shadow-orange-900/20"
              >
                Browse Scenarios
              </button>
              <button
                onClick={() => setIsCustomModalOpen(true)}
                className="px-8 py-4 border border-[#1E1E22] text-[#E8E6E1] rounded-xl font-mono text-sm uppercase tracking-widest hover:bg-[#1E1E22] transition-all"
              >
                Create Custom Scenario
              </button>
            </div>
          </div>

          <div className="hidden lg:block relative">
            <div className="absolute -inset-20 bg-orange-600/5 blur-[120px] rounded-full" />
            <div className="relative border border-[#1E1E22] rounded-3xl p-12 overflow-hidden" style={{ background: '#111113' }}>
              <div className="font-mono text-xs mb-8" style={{ color: '#3A3A3F' }}>TERMINAL_OUTPUT.LOG</div>
              <div className="space-y-4 font-mono text-sm leading-relaxed">
                <p style={{ color: '#FF4B1F' }}>[SYSTEM] Initializing judgment simulation...</p>
                <p style={{ color: '#6B6B70' }}>[AGENT] Character "Alex" loaded.</p>
                <p style={{ color: '#6B6B70' }}>[AGENT] Emotional volatility set to 85%.</p>
                <p style={{ color: '#E8E6E1' }}>"We have a problem — and I need to know you're with me before I tell you."</p>
                <div className="h-4 w-2 bg-[#FF4B1F] animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Scenarios Header */}
        <div id="scenarios-section" className="flex items-center gap-4 md:gap-6 mb-8 md:mb-12">
          <span className="text-xs md:text-sm font-mono uppercase tracking-[0.3em]" style={{ color: '#3A3A3F' }}>
            Available Scenarios
          </span>
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, #1E1E22, transparent)' }} />
          <span className="text-xs md:text-sm font-mono" style={{ color: '#3A3A3F' }}>
            {scenarios.length} TOTAL
          </span>
        </div>

        {/* Scenarios Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-16 md:mb-24">
          {scenarios.map(scenario => (
            <ScenarioCard key={scenario.id} scenario={scenario} onStart={onStart} />
          ))}
        </div>

        {/* How it works - Horizontal */}
        <div
          className="rounded-3xl p-8 md:p-12 mb-16 md:mb-20 border"
          style={{ background: '#111113', borderColor: '#1E1E22' }}
        >
          <p className="text-xs md:text-sm font-mono uppercase tracking-[0.3em] mb-10 md:mb-12 text-center" style={{ color: '#3A3A3F' }}>
            The Protocol
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
            {[
              ['01', 'THE DROP', 'Enter the scenario cold. No context besides the immediate fire drill.'],
              ['02', 'THE ENGAGEMENT', 'Speak naturally. Characters react to your tone, timing, and transparency.'],
              ['03', 'THE DEBRIEF', 'End when the dust settles. Get a deep-dive analysis of your leadership blind spots.'],
            ].map(([num, title, text]) => (
              <div key={num} className="relative">
                <span className="font-display text-6xl md:text-8xl absolute -top-8 md:-top-10 -left-2 md:-left-4 opacity-5 pointer-events-none" style={{ color: '#FF4B1F' }}>{num}</span>
                <div className="relative z-10">
                  <span className="font-mono text-xs md:text-sm block mb-4" style={{ color: '#FF4B1F' }}>Phase_{num}</span>
                  <h4 className="font-display text-xl md:text-2xl mb-4 tracking-wider" style={{ color: '#E8E6E1' }}>{title}</h4>
                  <p className="text-sm md:text-base leading-relaxed" style={{ color: '#6B6B70' }}>{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="py-8 md:py-12 border-t border-[#1E1E22] flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] md:text-xs font-mono uppercase tracking-widest text-center md:text-left" style={{ color: '#3A3A3F' }}>
          <div>© 2024 Forge judgment systems</div>
          <div className="flex gap-6 md:gap-8">
            <a href="#" className="hover:text-forge-accent transition-colors">Privacy_Protocol</a>
            <a href="#" className="hover:text-forge-accent transition-colors">Neural_Terms</a>
          </div>
        </footer>
      </div>

      {isCustomModalOpen && (
        <CustomScenarioForm 
          onSubmit={(data) => {
            setIsCustomModalOpen(false);
            onStartCustom(data);
          }}
          onCancel={() => setIsCustomModalOpen(false)}
        />
      )}

      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        signIn={signIn}
        signUp={signUp}
        loginAsDemo={loginAsDemo}
        error={authError}
      />
    </div>
  );
}
