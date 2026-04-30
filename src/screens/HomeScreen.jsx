import { useState } from 'react';
import { scenarios } from '../data/scenarios.js';
import CustomScenarioForm from '../components/CustomScenarioForm';

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

export default function HomeScreen({ onStart, onStartCustom }) {
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0A0A0B' }}>
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
          <div className="flex items-center gap-4 md:gap-8">
            <span className="hidden sm:block text-xs md:text-sm font-mono tracking-widest" style={{ color: '#3A3A3F' }}>EST. 2024</span>
            <div className="text-[10px] md:text-xs font-mono px-2 md:px-3 py-1 rounded border border-[#1E1E22]" style={{ color: '#FF4B1F' }}>VERSION 1.0</div>
          </div>
        </nav>

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
    </div>
  );
}
