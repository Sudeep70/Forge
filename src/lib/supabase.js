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

  // debriefData comes straight from POST /api/debrief, which returns
  // snake_case fields (see server.js): style, key_moment, blind_spot,
  // strength, growth_edge, scores.{transparency,decisiveness,empathy,
  // risk_awareness,integrity}. "style" is "Name — one-line description".
  const [overallStyle, styleDescription] = (debriefData.style || '').split(' — ');
  const scores = debriefData.scores || {};

  const { data, error } = await supabase
    .from('scenario_sessions')
    .insert([{
      user_id: user.id,
      scenario_id: scenarioId,
      scenario_title: scenarioTitle,
      overall_style: overallStyle || null,
      style_description: styleDescription || null,
      score_transparency: scores.transparency,
      score_decisiveness: scores.decisiveness,
      score_empathy: scores.empathy,
      score_risk_awareness: scores.risk_awareness,
      score_integrity: scores.integrity,
      key_moment: debriefData.key_moment,
      blind_spot: debriefData.blind_spot,
      strength: debriefData.strength,
      growth_edge: debriefData.growth_edge,
      conversation_turns: turnCount
    }])
    .select();

  if (error) throw error;
  return data;
}

export default supabase;
