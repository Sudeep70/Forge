import { useEffect, useState } from 'react';

const scoreLabels = {
  transparency: 'Transparency',
  decisiveness: 'Decisiveness',
  empathy: 'Empathy',
  risk_awareness: 'Risk Awareness',
  integrity: 'Integrity',
};

const scoreColors = {
  transparency: '#3B82F6',
  decisiveness: '#FF4B1F',
  empathy: '#8B5CF6',
  risk_awareness: '#FF8C42',
  integrity: '#10B981',
};

function ScoreBar({ label, value, color, delay }) {
  const [filled, setFilled] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setFilled(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: '#3A3A3F' }}>{label}</span>
        <span className="text-xs font-mono font-bold" style={{ color }}>{Math.round(value || 0)}%</span>
      </div>
      <div className="relative h-1 rounded-full overflow-hidden bg-[#1E1E22]">
        <div
          className="absolute left-0 top-0 h-full rounded-full"
          style={{
            width: filled ? `${value || 0}%` : '0%',
            background: color,
            transition: `width 1.2s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
          }}
        />
      </div>
    </div>
  );
}

function InsightCard({ label, icon, content, delay }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      className="rounded-2xl p-6 border border-[#1E1E22] bg-[#111113] relative overflow-hidden transition-all duration-700 h-full"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(10px)',
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="text-xl">{icon}</span>
        <span className="text-[10px] font-mono uppercase tracking-[0.3em]" style={{ color: '#3A3A3F' }}>{label}</span>
      </div>
      <p className="text-sm leading-relaxed" style={{ color: '#6B6B70' }}>
        {content || 'Analysis pending...'}
      </p>
    </div>
  );
}

function LoadingDebrief() {
  const [step, setStep] = useState(0);
  const steps = ['Parsing neural pathways...', 'Deconstructing tactical decisions...', 'Evaluating ethical alignment...', 'Synthesizing growth report...'];
  useEffect(() => {
    const interval = setInterval(() => setStep(s => (s + 1) % steps.length), 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="mb-8 relative">
        <div className="w-16 h-16 rounded-full border-4 border-transparent" style={{ borderTopColor: '#FF4B1F', borderRightColor: '#FF4B1F20', animation: 'spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite' }} />
      </div>
      <h2 className="font-display text-4xl mb-4 tracking-widest text-center" style={{ color: '#E8E6E1' }}>ANALYZING...</h2>
      <p key={step} className="text-sm font-mono text-[#3A3A3F] fade-up uppercase tracking-[0.4em]">{steps[step]}</p>
    </div>
  );
}

export default function DebriefScreen({ debrief, isLoading, error, onRetry, onReset, scenario }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (debrief) {
      console.log("DEBRIEF DATA:", debrief);
      const t = setTimeout(() => setReady(true), 100);
      return () => clearTimeout(t);
    }
  }, [debrief]);

  if (isLoading) return <LoadingDebrief />;
  if (error && !debrief) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <p className="text-orange-500 font-mono text-sm mb-4">{error}</p>
      <button onClick={onRetry} className="px-6 py-2 bg-[#FF4B1F] text-white text-xs font-mono rounded-lg hover:brightness-110 transition-all">RETRY_COLLECTION</button>
    </div>
  );
  if (!debrief) return <LoadingDebrief />;

  const debriefData = debrief || {};
  const styleParts = debriefData?.style?.split(' — ') || [];
  const styleName = styleParts[0] || 'ANALYSIS_COMPLETE';
  const styleSubtitle = styleParts[1] || 'Decision patterns have been successfully deconstructed.';

  return (
    <div className="min-h-screen bg-[#0A0A0B] flex flex-col text-[#E8E6E1] overflow-x-hidden">
      <div className="fixed inset-0 noise-overlay opacity-30 pointer-events-none" />
      
      <nav className="relative z-20 flex items-center justify-between px-6 md:px-12 py-6 md:py-8 border-b border-[#1E1E22]">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-5 h-5 md:w-6 md:h-6 rounded bg-[#FF4B1F] flex items-center justify-center">
            <svg className="w-3 h-3 md:w-4 md:h-4" viewBox="0 0 14 14" fill="none"><path d="M7 1C7 1 9 4 9 6.5C9 7.88 7.88 9 6.5 9C5.12 9 4 7.88 4 6.5C4 5.5 4.5 4.5 5 4C4 5 3 7 4.5 9.5C5.3 11 6.5 12 6.5 12C6.5 12 10 10 10 6.5C10 3.5 7 1 7 1Z" fill="white" /></svg>
          </div>
          <span className="font-display text-sm md:text-lg tracking-[0.2em]">VERDICT_ENGINE</span>
        </div>
        <button onClick={onReset} className="text-[8px] md:text-[10px] font-mono uppercase tracking-[0.3em] px-3 md:px-5 py-2 rounded-full border border-[#1E1E22] hover:bg-[#FF4B1F] transition-all">Reset Simulator</button>
      </nav>

      <div className="relative z-10 flex-1 flex flex-col max-w-6xl mx-auto w-full px-6 md:px-12 py-10 md:py-16">
        <div className={`transition-all duration-1000 ${ready ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <header className="mb-12 md:mb-20 text-center max-w-3xl mx-auto">
            <span className="text-[8px] md:text-[10px] font-mono uppercase tracking-[0.6em] text-orange-500/60 mb-4 md:mb-6 block">Final Assessment</span>
            <h1 className="font-display text-4xl md:text-6xl lg:text-8xl leading-none mb-4 tracking-tight">{styleName.toUpperCase()}</h1>
            <p className="text-base md:text-xl font-body text-[#6B6B70] italic mb-6 leading-relaxed">"{styleSubtitle}"</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8 md:gap-16 items-start">
            <section className="bg-[#111113]/50 rounded-3xl p-6 md:p-8 border border-[#1E1E22]">
              <h3 className="text-[10px] font-mono uppercase tracking-[0.4em] mb-8 md:mb-10 text-[#3A3A3F]">Judgment_Neural_Map</h3>
              <div className="space-y-2">
                {Object.entries(debriefData?.scores || {}).map(([key, value], i) => (
                  <ScoreBar key={key} label={scoreLabels[key] ?? key} value={value} color={scoreColors[key] ?? '#FF4B1F'} delay={200 + i * 100} />
                ))}
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 h-full">
              <InsightCard label="Critical Moment" icon="⚡" content={debriefData?.key_moment} delay={600} />
              <InsightCard label="Primary Strength" icon="✦" content={debriefData?.strength} delay={700} />
              <InsightCard label="Blind Spot" icon="◎" content={debriefData?.blind_spot} delay={800} />
              <InsightCard label="Growth Horizon" icon="→" content={debriefData?.growth_edge} delay={900} />
              <button onClick={onReset} className="md:col-span-2 mt-4 py-5 md:py-6 rounded-2xl bg-[#FF4B1F] text-white font-mono text-[10px] md:text-xs uppercase tracking-[0.4em] hover:brightness-110 transition-all shadow-xl shadow-orange-900/20">Restart Neural Protocol</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
