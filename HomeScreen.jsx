import { scenarios } from '../data/scenarios';

const intensityColor = {
  High: '#FF4B1F',
  Medium: '#FF8C42',
  Low: '#10B981',
};

function ScenarioCard({ scenario, onStart }) {
  return (
    <div
      className="group relative cursor-pointer"
      onClick={() => onStart(scenario.id)}
    >
      {/* Glow on hover */}
      <div
        className="absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: 'linear-gradient(135deg, #FF4B1F22, #FF8C4211)' }}
      />

      <div
        className="relative rounded-xl p-6 border transition-all duration-300 group-hover:border-forge-accent/40"
        style={{
          background: '#111113',
          borderColor: '#1E1E22',
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div
            className="text-xs font-mono font-medium px-2 py-1 rounded"
            style={{
              color: intensityColor[scenario.intensity] || '#FF4B1F',
              background: `${intensityColor[scenario.intensity] || '#FF4B1F'}18`,
              border: `1px solid ${intensityColor[scenario.intensity] || '#FF4B1F'}33`,
            }}
          >
            {scenario.intensity} Pressure
          </div>
          <div className="text-xs font-mono text-forge-muted">
            {scenario.durationMin} min
          </div>
        </div>

        {/* Title */}
        <h3
          className="font-display text-2xl mb-2 group-hover:text-forge-ember transition-colors duration-200"
          style={{ color: '#E8E6E1', letterSpacing: '0.03em' }}
        >
          {scenario.title}
        </h3>

        {/* Subtitle */}
        <p className="text-sm mb-5 leading-relaxed" style={{ color: '#6B6B70' }}>
          {scenario.subtitle}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-5">
          {scenario.tags.map(tag => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded font-mono"
              style={{ background: '#1E1E22', color: '#6B6B70' }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Characters preview */}
        <div className="flex items-center gap-2 mb-5">
          <span className="text-xs text-forge-muted font-mono">Cast:</span>
          {scenario.characters.map(char => (
            <div key={char.id} className="flex items-center gap-1">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold"
                style={{ background: `${char.color}22`, color: char.color, border: `1px solid ${char.color}44` }}
              >
                {char.initial}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          className="flex items-center justify-between pt-4"
          style={{ borderTop: '1px solid #1E1E22' }}
        >
          <span className="text-xs text-forge-muted">Free exploration — no right answers</span>
          <div
            className="flex items-center gap-2 text-sm font-medium group-hover:text-forge-accent transition-colors duration-200"
            style={{ color: '#6B6B70' }}
          >
            Enter scenario
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomeScreen({ onStart }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0A0A0B' }}>
      {/* Noise overlay */}
      <div className="fixed inset-0 noise-overlay opacity-60 pointer-events-none" />

      {/* Subtle grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 flex flex-col min-h-screen max-w-xl mx-auto w-full px-5">
        {/* Nav */}
        <nav className="flex items-center justify-between py-5">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded flex items-center justify-center"
              style={{ background: '#FF4B1F' }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1C7 1 9 4 9 6.5C9 7.88 7.88 9 6.5 9C5.12 9 4 7.88 4 6.5C4 5.5 4.5 4.5 5 4C4 5 3 7 4.5 9.5C5.3 11 6.5 12 6.5 12C6.5 12 10 10 10 6.5C10 3.5 7 1 7 1Z" fill="white" />
              </svg>
            </div>
            <span className="font-display text-xl tracking-widest" style={{ color: '#E8E6E1' }}>FORGE</span>
          </div>
          <div className="text-xs font-mono" style={{ color: '#3A3A3F' }}>BETA</div>
        </nav>

        {/* Hero */}
        <div className="pt-10 pb-12">
          <div
            className="inline-block text-xs font-mono px-3 py-1 rounded-full mb-6"
            style={{ background: '#FF4B1F18', color: '#FF4B1F', border: '1px solid #FF4B1F33' }}
          >
            AI-Powered Judgment Training
          </div>

          <h1
            className="font-display leading-none mb-6"
            style={{
              fontSize: 'clamp(42px, 10vw, 64px)',
              color: '#E8E6E1',
              letterSpacing: '0.02em',
            }}
          >
            DEVELOP<br />
            JUDGMENT<br />
            <span style={{ color: '#FF4B1F' }}>SCHOOLS DON'T<br />TEACH.</span>
          </h1>

          <p className="text-base leading-relaxed" style={{ color: '#6B6B70', maxWidth: '340px' }}>
            Drop into high-stakes scenarios with AI characters that react to exactly what you say. 
            No guidance. No multiple choice. Just you, your instincts, and the situation.
          </p>
        </div>

        {/* Scenarios */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-mono uppercase tracking-widest" style={{ color: '#3A3A3F' }}>
              Learning Experiences
            </span>
            <div className="flex-1 h-px" style={{ background: '#1E1E22' }} />
            <span className="text-xs font-mono" style={{ color: '#3A3A3F' }}>
              {scenarios.length} available
            </span>
          </div>

          <div className="space-y-4">
            {scenarios.map(scenario => (
              <ScenarioCard key={scenario.id} scenario={scenario} onStart={onStart} />
            ))}
          </div>
        </div>

        {/* What to expect */}
        <div
          className="rounded-xl p-5 mb-10"
          style={{ background: '#111113', border: '1px solid #1E1E22' }}
        >
          <p className="text-xs font-mono uppercase tracking-widest mb-4" style={{ color: '#3A3A3F' }}>
            How it works
          </p>
          <div className="space-y-3">
            {[
              ['01', 'Enter the scenario with no instructions'],
              ['02', 'Speak freely — AI characters respond to exactly what you say'],
              ['03', 'End when you\'re ready for your Growth Report'],
            ].map(([num, text]) => (
              <div key={num} className="flex items-start gap-3">
                <span className="font-mono text-xs pt-0.5 shrink-0" style={{ color: '#FF4B1F' }}>{num}</span>
                <span className="text-sm" style={{ color: '#6B6B70' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
