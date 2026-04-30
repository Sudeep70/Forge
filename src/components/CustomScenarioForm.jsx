import { useState } from 'react';

export default function CustomScenarioForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    stake: 'High',
    timeLimit: '60'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;
    onSubmit(formData);
  };

  const templates = [
    { title: 'Startup Crisis', description: 'Our lead investor just pulled out and we have 2 weeks of runway left. The team is starting to panic. How do you address them?' },
    { title: 'Team Conflict', description: 'Two of your top engineers are refusing to work together on a critical feature. The release is tomorrow. Fix it.' },
    { title: 'Security Issue', description: 'We just detected a massive data breach affecting 10k users. Do we disclose now or wait until we have a fix?' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onCancel} />
      
      <div className="relative w-full max-w-2xl bg-[#111113] border border-[#1E1E22] rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FF4B1F] to-transparent opacity-50" />
        
        <form onSubmit={handleSubmit} className="p-8 md:p-10">
          <h2 className="font-display text-3xl md:text-4xl mb-2 text-[#E8E6E1]">Create_Scenario</h2>
          <p className="text-sm font-mono text-[#3A3A3F] uppercase tracking-widest mb-8">Custom Neural Protocol Initialization</p>
          
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-mono text-[#6B6B70] uppercase tracking-widest mb-2">Scenario Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., The Midnight Crisis"
                className="w-full bg-[#0A0A0B] border border-[#1E1E22] rounded-xl px-4 py-3 text-[#E8E6E1] focus:border-[#FF4B1F] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-[#6B6B70] uppercase tracking-widest mb-2">Situation Description</label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the high-stakes situation..."
                className="w-full bg-[#0A0A0B] border border-[#1E1E22] rounded-xl px-4 py-3 text-[#E8E6E1] focus:border-[#FF4B1F] focus:outline-none transition-colors resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-mono text-[#6B6B70] uppercase tracking-widest mb-2">Stakes Level</label>
                <select
                  value={formData.stake}
                  onChange={e => setFormData({ ...formData, stake: e.target.value })}
                  className="w-full bg-[#0A0A0B] border border-[#1E1E22] rounded-xl px-4 py-3 text-[#E8E6E1] focus:border-[#FF4B1F] focus:outline-none transition-colors appearance-none"
                >
                  <option value="Low">Low Pressure</option>
                  <option value="Medium">Medium Pressure</option>
                  <option value="High">High Pressure</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-[#6B6B70] uppercase tracking-widest mb-2">Time Limit</label>
                <select
                  value={formData.timeLimit}
                  onChange={e => setFormData({ ...formData, timeLimit: e.target.value })}
                  className="w-full bg-[#0A0A0B] border border-[#1E1E22] rounded-xl px-4 py-3 text-[#E8E6E1] focus:border-[#FF4B1F] focus:outline-none transition-colors appearance-none"
                >
                  <option value="30">30 Seconds</option>
                  <option value="60">60 Seconds</option>
                  <option value="90">90 Seconds</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-[#6B6B70] uppercase tracking-widest mb-3">Quick Templates</label>
              <div className="flex flex-wrap gap-2">
                {templates.map(t => (
                  <button
                    key={t.title}
                    type="button"
                    onClick={() => setFormData({ ...formData, title: t.title, description: t.description })}
                    className="text-[10px] font-mono border border-[#1E1E22] px-3 py-1.5 rounded-full text-[#6B6B70] hover:border-[#FF4B1F] hover:text-[#FF4B1F] transition-all"
                  >
                    {t.title}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-10">
            <button
              type="submit"
              className="flex-1 bg-[#FF4B1F] text-white py-4 rounded-xl font-mono text-sm uppercase tracking-[0.2em] hover:brightness-110 transition-all shadow-xl shadow-orange-900/20"
            >
              Start_Simulation
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-8 py-4 border border-[#1E1E22] text-[#6B6B70] rounded-xl font-mono text-sm uppercase tracking-widest hover:bg-[#1E1E22] transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
