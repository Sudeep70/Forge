import { useState } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { calculateStats } from '../hooks/useForge';

const scoreLabels = {
  score_transparency: 'Transparency',
  score_decisiveness: 'Decisiveness',
  score_empathy: 'Empathy',
  score_risk_awareness: 'Risk Awareness',
  score_integrity: 'Integrity',
};

const scoreColors = {
  score_transparency: '#FF4B1F',
  score_decisiveness: '#FF8C42',
  score_empathy: '#10B981',
  score_risk_awareness: '#3B82F6',
  score_integrity: '#8B5CF6',
};

function SessionCard({ session }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const date = new Date(session.completed_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const scores = [
    { key: 'score_transparency', label: 'TRA' },
    { key: 'score_decisiveness', label: 'DEC' },
    { key: 'score_empathy', label: 'EMP' },
    { key: 'score_risk_awareness', label: 'RSK' },
    { key: 'score_integrity', label: 'INT' },
  ];

  return (
    <div 
      className="group bg-[#111113] border border-[#1E1E22] rounded-2xl p-6 transition-all duration-300 cursor-pointer hover:border-[#FF4B1F33]"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[10px] font-mono text-[#3A3A3F] uppercase tracking-widest">{date}</span>
            <div className="w-1 h-1 rounded-full bg-[#1E1E22]" />
            <span className="text-[10px] font-mono text-[#FF4B1F] uppercase tracking-widest">{session.scenario_id}</span>
          </div>
          <h3 className="font-display text-2xl text-[#E8E6E1] group-hover:text-[#FF4B1F] transition-colors">
            {session.scenario_title}
          </h3>
        </div>
        
        <div className="flex flex-col items-end">
          <span className="text-xs font-mono text-[#E8E6E1] mb-1 uppercase tracking-tighter">{session.overall_style}</span>
          <div className="flex gap-1.5">
            {scores.map(s => (
              <div key={s.key} className="w-8 flex flex-col items-center">
                <div className="w-full h-1 bg-[#1E1E22] rounded-full overflow-hidden mb-1">
                  <div 
                    className="h-full rounded-full transition-all duration-1000" 
                    style={{ 
                      width: `${session[s.key]}%`,
                      backgroundColor: scoreColors[s.key]
                    }} 
                  />
                </div>
                <span className="text-[8px] font-mono text-[#3A3A3F]">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="pt-6 border-t border-[#1E1E22] grid grid-cols-1 md:grid-cols-2 gap-8 fade-up">
          <div className="space-y-6">
            <section>
              <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#FF4B1F] mb-2">Key_Moment</h4>
              <p className="text-sm leading-relaxed text-[#6B6B70]">{session.key_moment}</p>
            </section>
            <section>
              <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#FF4B1F] mb-2">Strength_Observed</h4>
              <p className="text-sm leading-relaxed text-[#6B6B70]">{session.strength}</p>
            </section>
          </div>
          <div className="space-y-6">
            <section>
              <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#FF4B1F] mb-2">Blind_Spot</h4>
              <p className="text-sm leading-relaxed text-[#6B6B70]">{session.blind_spot}</p>
            </section>
            <section>
              <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#FF4B1F] mb-2">Growth_Edge</h4>
              <p className="text-sm leading-relaxed text-[#6B6B70]">{session.growth_edge}</p>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardScreen({ sessions, onBack }) {
  const stats = calculateStats(sessions);
  
  // Transform data for recharts
  const chartData = [...sessions].reverse().map(s => ({
    date: new Date(s.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    Transparency: s.score_transparency,
    Decisiveness: s.score_decisiveness,
    Empathy: s.score_empathy,
    Risk: s.score_risk_awareness,
    Integrity: s.score_integrity,
  }));

  if (!sessions.length) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex flex-col items-center justify-center p-6">
        <button onClick={onBack} className="absolute top-10 left-10 text-[10px] font-mono text-[#3A3A3F] hover:text-[#FF4B1F] uppercase tracking-[0.3em] transition-colors flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back_to_Forge
        </button>
        <div className="text-center max-w-md">
          <h2 className="font-display text-5xl text-[#E8E6E1] mb-6">EMPTY_CHAMBER</h2>
          <p className="text-[#6B6B70] font-mono text-sm leading-relaxed mb-10">
            Complete your first scenario to start tracking your judgment metrics.
          </p>
          <button 
            onClick={onBack}
            className="px-8 py-4 bg-[#FF4B1F] text-white rounded-xl font-mono text-sm uppercase tracking-widest shadow-xl shadow-orange-900/20"
          >
            Enter Simulation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] p-6 md:p-12 pb-24 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <button onClick={onBack} className="text-[10px] font-mono text-[#3A3A3F] hover:text-[#FF4B1F] uppercase tracking-[0.3em] transition-colors flex items-center gap-2 mb-8">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              Back_to_Base
            </button>
            <h1 className="font-display text-6xl md:text-8xl text-[#E8E6E1] leading-none mb-4">JUDGMENT_PROFILE</h1>
            <p className="font-mono text-xs text-[#3A3A3F] uppercase tracking-[0.3em]">Aggregate analysis of {stats.totalSessions} active sessions</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#111113] border border-[#1E1E22] p-6 rounded-2xl">
              <span className="block text-[10px] font-mono text-[#3A3A3F] uppercase tracking-widest mb-2">Strongest_Trait</span>
              <span className="block text-2xl font-display text-[#FF4B1F] tracking-wide uppercase">{stats.strongestTrait}</span>
            </div>
            <div className="bg-[#111113] border border-[#1E1E22] p-6 rounded-2xl">
              <span className="block text-[10px] font-mono text-[#3A3A3F] uppercase tracking-widest mb-2">Avg_Integrity</span>
              <span className="block text-2xl font-display text-[#E8E6E1] tracking-wide uppercase">{stats.averages.Integrity}%</span>
            </div>
          </div>
        </header>

        {/* Chart Section */}
        <div className="bg-[#111113] border border-[#1E1E22] rounded-3xl p-8 mb-16 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FF4B1F33] to-transparent" />
          <h2 className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#3A3A3F] mb-10">Metric_Evolution_Log</h2>
          
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E1E22" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#3A3A3F" 
                  fontSize={10} 
                  fontFamily="DM Mono" 
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  stroke="#3A3A3F" 
                  fontSize={10} 
                  fontFamily="DM Mono" 
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{ 
                    background: '#0A0A0B', 
                    border: '1px solid #1E1E22', 
                    borderRadius: '12px',
                    fontFamily: 'DM Mono',
                    fontSize: '10px'
                  }} 
                />
                <Legend 
                  verticalAlign="top" 
                  align="right" 
                  iconType="circle"
                  wrapperStyle={{ 
                    paddingBottom: '40px',
                    fontFamily: 'DM Mono',
                    fontSize: '10px',
                    textTransform: 'uppercase'
                  }}
                />
                <Line type="monotone" dataKey="Transparency" stroke="#FF4B1F" strokeWidth={2} dot={{ r: 4, fill: '#FF4B1F', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Decisiveness" stroke="#FF8C42" strokeWidth={2} dot={{ r: 4, fill: '#FF8C42', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Empathy" stroke="#10B981" strokeWidth={2} dot={{ r: 4, fill: '#10B981', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Risk" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4, fill: '#3B82F6', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Integrity" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 4, fill: '#8B5CF6', strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* History List */}
        <div className="space-y-6">
          <div className="flex items-center gap-4 mb-10">
            <h2 className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#3A3A3F] whitespace-nowrap">Neural_History</h2>
            <div className="flex-1 h-px bg-[#1E1E22]" />
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            {sessions.map(session => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
