import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Auth and History will be disabled.');
}

const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

/**
 * saveSession — persists a completed simulation to Supabase
 */
export async function saveSession(debriefData, scenarioId, scenarioTitle, turnCount) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('scenario_sessions')
    .insert([{
      user_id: user.id,
      scenario_id: scenarioId,
      scenario_title: scenarioTitle,
      overall_style: debriefData.overallStyle,
      style_description: debriefData.styleDescription,
      score_transparency: debriefData.scores.transparency,
      score_decisiveness: debriefData.scores.decisiveness,
      score_empathy: debriefData.scores.empathy,
      score_risk_awareness: debriefData.scores.riskAwareness,
      score_integrity: debriefData.scores.integrity,
      key_moment: debriefData.keyMoment,
      blind_spot: debriefData.blindSpot,
      strength: debriefData.strength,
      growth_edge: debriefData.growthEdge,
      conversation_turns: turnCount
    }])
    .select();

  if (error) throw error;
  return data;
}

export default supabase;
