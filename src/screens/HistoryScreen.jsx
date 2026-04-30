import { useState, useEffect } from 'react';
import supabase from '../lib/supabase';

export default function HistoryScreen({ onBack, onReset }) {
  const [simulations, setSimulations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('simulations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error) setSimulations(data);
      setLoading(false);
    }
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#FF4B1F] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#E8E6E1] p-6 md:p-12">
      <nav className="flex items-center justify-between mb-12 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-[#6B6B70] hover:text-[#E8E6E1] transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          </button>
          <h1 className="font-display text-2xl md:text-3xl tracking-wider">NEURAL_ARCHIVE</h1>
        </div>
        <button onClick={onReset} className="text-[10px] font-mono uppercase tracking-[0.3em] px-5 py-2 rounded-full border border-[#1E1E22] hover:bg-[#FF4B1F] transition-all">Back to Home</button>
      </nav>

      <div className="max-w-6xl mx-auto w-full">
        {!simulations.length ? (
          <div className="text-center py-20 bg-[#111113] rounded-3xl border border-[#1E1E22]">
            <p className="font-mono text-[#3A3A3F] uppercase tracking-[0.4em]">No recorded simulations found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {simulations.map((sim) => (
              <div key={sim.id} className="bg-[#111113] border border-[#1E1E22] rounded-2xl p-6 hover:border-[#FF4B1F33] transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-mono text-[#FF4B1F] bg-[#FF4B1F10] px-2 py-0.5 rounded border border-[#FF4B1F20]">
                    {new Date(sim.created_at).toLocaleDateString()}
                  </span>
                  <span className="text-[10px] font-mono text-[#3A3A3F] uppercase tracking-widest">
                    ID_{sim.id.slice(0, 8)}
                  </span>
                </div>
                <h3 className="font-display text-xl mb-2">{sim.scenario}</h3>
                <p className="text-sm text-[#6B6B70] mb-6 line-clamp-2 italic">"{sim.report?.style || 'Analysis Recorded'}"</p>
                
                <div className="grid grid-cols-5 gap-1 mb-6">
                  {Object.entries(sim.scores || {}).map(([key, val]) => (
                    <div key={key} className="flex flex-col gap-1">
                      <div className="h-1 bg-[#1E1E22] rounded-full overflow-hidden">
                        <div className="h-full bg-[#FF4B1F]" style={{ width: `${val}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center justify-between text-[10px] font-mono text-[#3A3A3F]">
                  <span>{sim.conversation?.length || 0} MESSAGES</span>
                  <span className="text-[#6B6B70] group-hover:text-[#FF4B1F] transition-colors uppercase tracking-widest">View Details →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
