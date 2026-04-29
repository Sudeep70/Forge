import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Forge API is running');
});

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// FALLBACK POOLS
const CHAT_FALLBACKS = [
  "[Alex] Look, I've got this under control. We patch it quietly, no one panics, and we move on. You've been here three days — trust the process.",
  "[Alex] The board doesn't need to know every technical hiccup. That's not how this works. Are you with us or not?",
  "[Priya] I trust my team completely. That's why it would devastate me if I found out someone knew something critical and stayed quiet. That's a line for me.",
  "[Sam] I don't care about the 'technical hurdles.' I care about the fact that I have to tell the client we're six weeks late. Who is owning this?",
  "[Dave] The spec was moving goalposts Sam. You can't expect a stable build when the requirements change every 48 hours. It's mathematically impossible.",
  "[Jason] Honestly, I thought we were all on the same page. I put in the weekend hours to make sure the presentation was polished for Marcus. It's about the team win.",
  "[Marcus] I'm listening. But I'm also looking at the commit history. Let's keep this professional and focus on the output for now.",
  "[Alex] We. Handle. This. Internally. If you go over my head on this, you'll be the one explaining why you torpedoed team trust on your first week."
];

function createFallbackReport(conversationHistory = []) {
  const text = conversationHistory.map(m => m.content.toLowerCase()).join(' ');
  
  // Keyword-based score adjustment
  let transparencyBase = 60;
  let decisivenessBase = 70;
  if (text.includes('hide') || text.includes('quiet') || text.includes('delay')) transparencyBase -= 15;
  if (text.includes('decide') || text.includes('act') || text.includes('move fast')) decisivenessBase += 15;

  const pools = {
    style: [
      "Adaptive Realist — You navigate complexity with speed, but often at the cost of radical transparency.",
      "Principled Stoic — You hold the line on ethics, but risk alienating key tactical allies under pressure.",
      "Decisive Tactical Lead — High execution velocity paired with a tendency to bypass stakeholder consensus.",
      "Shielded Diplomat — You prioritize harmony and damage control, potentially masking systemic failures."
    ],
    key_moment: [
      "The moment you chose to validate process over naming the core ethical conflict. You prioritized control over accountability.",
      "Your decision to escalate the technical risk immediately, showing a preference for systemic health over short-term PR stability.",
      "The pause before committing to the patch — a revealing moment where tactical caution outweighed immediate stakeholder demands."
    ],
    blind_spot: [
      "You are conflating silence with stability. By not escalating, you are creating a single point of failure that you alone will own.",
      "Your reliance on procedural logic is masking a growing trust deficit with your primary developer leads.",
      "You are prioritizing 'the fix' while ignoring the cultural debt created by your lack of transparent communication."
    ],
    strength: [
      "Exceptional composure during direct confrontation, specifically when challenged on your immediate tactical priorities.",
      "A sharp ability to identify the root cause of risk while others are focused on surface-level symptoms.",
      "Natural authority in crisis; you speak with a clarity that simplifies complex ethical trade-offs for the team."
    ],
    hard_truths: [
      "You moved too slow on the ethical pivot.",
      "You prioritized organizational optics over the safety of the protocol.",
      "Your focus on consensus is actually a fear of taking a definitive stand when it matters most."
    ],
    consequences: [
      "This delay would have likely triggered a board escalation and a permanent loss of trust within 24 hours.",
      "Stakeholders would have lost confidence in your ability to lead high-stakes technical transitions.",
      "The team would have perceived your silence as a lack of integrity, leading to immediate high-talent attrition."
    ]
  };

  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  return {
    style: pick(pools.style),
    scores: {
      transparency: Math.max(40, Math.min(80, transparencyBase + (Math.random() * 20 - 10))),
      decisiveness: Math.max(60, Math.min(95, decisivenessBase + (Math.random() * 20 - 10))),
      empathy: 50 + Math.floor(Math.random() * 35),
      risk_awareness: 60 + Math.floor(Math.random() * 35),
      integrity: 50 + Math.floor(Math.random() * 40)
    },
    key_moment: pick(pools.key_moment),
    blind_spot: pick(pools.blind_spot),
    strength: pick(pools.strength),
    growth_edge: pick(pools.hard_truths),
    impact_warning: pick(pools.consequences)
  };
}

// POST /api/chat — with automatic fallback
app.post('/api/chat', async (req, res) => {
  const { messages, scenarioContext } = req.body;

  try {
    if (!GEMINI_API_KEY) throw new Error("No API Key");

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: messages.map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        })),
        system_instruction: {
          parts: [{ text: scenarioContext }]
        }
      }),
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Empty response");

    console.log("SOURCE: API");
    return res.json({ text });

  } catch (err) {
    console.log("SOURCE: FALLBACK");
    const fallbackText = CHAT_FALLBACKS[Math.floor(Math.random() * CHAT_FALLBACKS.length)];
    return res.json({ text: fallbackText });
  }
});

// POST /api/debrief — with automatic fallback
app.post('/api/debrief', async (req, res) => {
  const { conversationHistory } = req.body;

  const conversationText = conversationHistory
    .map(m => `${m.role === 'user' ? 'USER' : 'CHARACTER'}: ${m.content}`)
    .join('\n');

  const analysisPrompt = `Analyze the following high-stakes leadership simulation and provide a professional performance evaluation. 
TONE: Direct, analytical, slightly intense. No motivational fluff.
Return ONLY valid JSON in this exact structure:
{
  "style": "Title — followed by a sharp 1-line interpretation (e.g. 'Tactical Realist: You prioritize immediate stability over long-term organizational trust.')",
  "scores": {
    "transparency": 0-100,
    "decisiveness": 0-100,
    "empathy": 0-100,
    "risk_awareness": 0-100,
    "integrity": 0-100
  },
  "key_moment": "The single most revealing decision pattern shown. Be specific about the trade-off made.",
  "blind_spot": "What the user is NOT seeing. Highlight the systemic risk they are creating.",
  "strength": "One specific behavioral asset demonstrated under pressure.",
  "growth_edge": "The 'Hard Truth' insight only.",
  "impact_warning": "The real-world consequence only if this had been a live situation."
}

CONVERSATION:
${conversationText}`;

  try {
    if (!GEMINI_API_KEY) throw new Error("No API Key");

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: analysisPrompt }] }]
      }),
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Empty response");

    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    console.log("SOURCE: API");
    return res.json(JSON.parse(cleaned));

  } catch (err) {
    console.log("SOURCE: FALLBACK (GENERATED)");
    const fallback = createFallbackReport(conversationHistory);
    return res.json(fallback);
  }
});

app.listen(PORT, () => {
  console.log(`\n🔥 FORGE running on http://localhost:${PORT}`);
  console.log(`   Automatic Fallback: ENABLED`);
  console.log(`   AI: Google Gemini Flash\n`);
});