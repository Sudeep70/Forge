# 🔥 Forge — AI-Powered Judgment Simulator

> Develop real-world judgment through high-stakes AI scenarios.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env — see the comments in .env.example for what each key does

# 3. Build the frontend
npm run build

# 4. Run the server
node server.js
```

Then open http://localhost:3001

All AI calls are optional. Without `GEMINI_API_KEY`, `/api/chat` automatically
falls back to hardcoded pressure-tested responses. Without `GROQ_API_KEY`,
`/api/debrief` automatically falls back to a heuristic-scored report. This
means the app runs end-to-end with zero API keys — useful for demos.

## Development (hot reload)

Run two terminals:

```bash
# Terminal 1: Backend (Express, port 3001)
npm run dev:server

# Terminal 2: Frontend (Vite dev server, port 5173)
npm run dev:client
```

The frontend calls the backend directly at whatever `VITE_API_URL` points to
in your `.env` (e.g. `http://localhost:3001`) — there's no Vite proxy
involved, so make sure both are set and both servers are running.

## Switching AI Providers

Chat calls (Gemini) live in `server.js`'s `/api/chat` route. Debrief calls
(Groq/Llama 3) live in `/api/debrief`. To switch providers, replace the
`fetch`/SDK call in the relevant route — the frontend only ever talks to
`src/lib/ai.js`, which just calls `/api/chat` and `/api/debrief`, so no
frontend changes are needed.

## Project Structure

```
forge/
├── server.js              # Express backend (/api/chat, /api/debrief + fallbacks)
├── src/
│   ├── App.jsx             # Root component, screen routing (react-router-dom)
│   ├── main.jsx            # React entry point
│   ├── components/
│   │   └── CustomScenarioForm.jsx
│   ├── data/
│   │   └── scenarios.js    # All scenario content (add new scenarios here)
│   ├── hooks/
│   │   └── useForge.js     # Central state, auth, and API orchestration
│   ├── lib/
│   │   ├── ai.js           # Frontend API calls to /api/chat and /api/debrief
│   │   └── supabase.js     # Supabase client + session persistence
│   └── screens/
│       ├── HomeScreen.jsx         # Scenario selection, auth
│       ├── DashboardScreen.jsx    # Session history / stats
│       ├── ScenarioScreen.jsx     # Live chat interface
│       ├── VideoScenarioScreen.jsx # Video-based scenario variant
│       └── DebriefScreen.jsx      # Growth Report visualization
├── index.html
├── vite.config.js
└── package.json
```

## Adding New Scenarios

Edit `src/data/scenarios.js` and add a new object to the `scenarios` array. No other files need to change.

Each scenario needs:
- `id` — unique string
- `title`, `subtitle`, `tags`, `durationMin`, `intensity`
- `setup` — brief situation description shown to user
- `characters[]` — array of `{id, name, role, initial, color}`
- `systemPrompt` — the full system prompt sent to the model
- `openingMessage` — the first AI message the user sees

## Auth & Session History

Login and session history are backed by Supabase (`src/lib/supabase.js`).
Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env` to enable them;
without those, the app still works but skips auth and history. A "Continue as
Demo" path is also available from the home screen, which never touches
Supabase.
