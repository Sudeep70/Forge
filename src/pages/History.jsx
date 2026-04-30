import { useEffect, useState } from "react";
import supabase from "../lib/supabase";

export default function History({ onBack }) {
  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("simulations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error) setHistory(data);
    };

    fetchHistory();
  }, []);

  return (
    <div className="p-4 max-w-3xl mx-auto text-[#E8E6E1]">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-bold">My History</h1>
        <button 
          onClick={onBack}
          className="text-xs font-mono uppercase tracking-widest text-[#6B6B70] hover:text-[#FF4B1F]"
        >
          Close_Archive
        </button>
      </div>

      {history.length === 0 && (
        <p className="text-[#6B6B70]">No simulations yet</p>
      )}

      <div className="grid gap-4">
        {history.map((item) => (
          <div 
            key={item.id} 
            onClick={() => setSelected(item)}
            className="border border-[#1E1E22] p-4 rounded-xl bg-[#111113] hover:border-[#FF4B1F33] transition-colors cursor-pointer"
          >
            <p className="font-semibold text-lg">{item.scenario}</p>
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-[#6B6B70] font-mono uppercase tracking-wider">
                {new Date(item.created_at).toLocaleString()}
              </p>
              <span className="text-[10px] font-mono text-[#3A3A3F]">
                ID_{item.id.slice(0, 8)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-2xl bg-[#111113] border border-[#1E1E22] rounded-3xl p-8 max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-display mb-2">{selected.scenario}</h2>
            <p className="text-sm text-[#6B6B70] mb-6">
              {new Date(selected.created_at).toLocaleString()}
            </p>

            <div className="space-y-6">
              {/* Visual Scores */}
              <div className="bg-[#0A0A0B] p-6 rounded-2xl border border-[#1E1E22]">
                <h3 className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#3A3A3F] mb-6">Judgment_Metrics</h3>
                <div className="space-y-4">
                  {Object.entries(selected?.scores || {}).map(([key, val]) => (
                    <div key={key}>
                      <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest mb-2">
                        <span className="text-[#6B6B70]">{key.replace('_', ' ')}</span>
                        <span className="text-[#E8E6E1]">{val}%</span>
                      </div>
                      <div className="h-1 bg-[#1E1E22] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#FF4B1F] transition-all duration-1000" 
                          style={{ width: `${val}%` }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Analysis Sections */}
              {(() => {
                const debrief = selected?.report || {};
                return (
                  <div className="grid gap-4">
                    <div className="p-5 border border-[#1E1E22] rounded-2xl bg-[#0A0A0B] hover:border-orange-500/20 transition-colors">
                      <h3 className="text-orange-400 text-[10px] font-mono uppercase tracking-[0.2em] mb-3">Leadership Style</h3>
                      <p className="text-sm leading-relaxed text-[#E8E6E1]">{debrief.style || "No data"}</p>
                    </div>

                    <div className="p-5 border border-[#1E1E22] rounded-2xl bg-[#0A0A0B] hover:border-green-500/20 transition-colors">
                      <h3 className="text-green-400 text-[10px] font-mono uppercase tracking-[0.2em] mb-3">Core Strength</h3>
                      <p className="text-sm leading-relaxed text-[#E8E6E1]">{debrief.strength || "No data"}</p>
                    </div>

                    <div className="p-5 border border-[#1E1E22] rounded-2xl bg-[#0A0A0B] hover:border-red-500/20 transition-colors">
                      <h3 className="text-red-400 text-[10px] font-mono uppercase tracking-[0.2em] mb-3">Blind Spot</h3>
                      <p className="text-sm leading-relaxed text-[#E8E6E1]">{debrief.blind_spot || "No data"}</p>
                    </div>

                    <div className="p-5 border border-[#1E1E22] rounded-2xl bg-[#0A0A0B] hover:border-blue-500/20 transition-colors">
                      <h3 className="text-blue-400 text-[10px] font-mono uppercase tracking-[0.2em] mb-3">Key Moment</h3>
                      <p className="text-sm leading-relaxed text-[#E8E6E1]">{debrief.key_moment || "No data"}</p>
                    </div>

                    <div className="p-5 border border-[#1E1E22] rounded-2xl bg-[#0A0A0B] hover:border-purple-500/20 transition-colors">
                      <h3 className="text-purple-400 text-[10px] font-mono uppercase tracking-[0.2em] mb-3">Growth Edge</h3>
                      <p className="text-sm leading-relaxed text-[#E8E6E1]">{debrief.growth_edge || "No data"}</p>
                    </div>

                    <div className="p-5 border border-[#1E1E22] rounded-2xl bg-[#0A0A0B] hover:border-yellow-500/20 transition-colors">
                      <h3 className="text-yellow-400 text-[10px] font-mono uppercase tracking-[0.2em] mb-3">Impact Warning</h3>
                      <p className="text-sm leading-relaxed text-[#E8E6E1] font-medium">{debrief.impact_warning || "No data"}</p>
                    </div>
                  </div>
                );
              })()}
            </div>

            <button
              onClick={() => setSelected(null)}
              className="mt-8 w-full py-3 bg-[#FF4B1F10] text-[#FF4B1F] border border-[#FF4B1F20] rounded-xl font-mono text-xs uppercase tracking-widest hover:bg-[#FF4B1F] hover:text-white transition-all"
            >
              Close_Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
