import { useEffect, useState } from "react";
import supabase from "../lib/supabase";

export default function History({ onBack }) {
  const [history, setHistory] = useState([]);

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

      {history.map((item) => (
        <div key={item.id} className="border border-[#1E1E22] p-4 mb-4 rounded-xl bg-[#111113] hover:border-[#FF4B1F33] transition-colors">
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
  );
}
