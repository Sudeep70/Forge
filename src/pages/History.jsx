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
              <div>
                <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-[#FF4B1F] mb-3">Scores</h3>
                <pre className="text-green-400 text-xs font-mono bg-[#0A0A0B] p-4 rounded-xl border border-[#1E1E22] overflow-x-auto">
                  {JSON.stringify(selected.scores, null, 2)}
                </pre>
              </div>

              <div>
                <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-[#3b82f6] mb-3">Report</h3>
                <pre className="text-blue-300 text-xs font-mono bg-[#0A0A0B] p-4 rounded-xl border border-[#1E1E22] overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(selected.report, null, 2)}
                </pre>
              </div>
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
