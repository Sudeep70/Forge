# 🔥 Forge — AI-Powered Judgment Simulator

> Develop real-world judgment through high-stakes AI scenarios.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# 3. Build the frontend
npm run build

# 4. Run the server
ANTHROPIC_API_KEY=your_key node server.js
```

Then open http://localhost:3001

## Development (hot reload)

Run two terminals:

```bash
# Terminal 1: Backend
node server.js

# Terminal 2: Frontend (Vite dev server with proxy)
npm run dev
```

Frontend runs on http://localhost:5173 and proxies /api calls to the Express server.

## Demo Mode

To demo without a real API key:

```bash
DEMO_MODE=true node server.js
```

Or in your .env:
```
DEMO_MODE=true
```

Demo mode returns realistic hardcoded responses that feel pressure-filled and real.

## Switching AI Providers

All AI calls are isolated in `src/lib/ai.js`. See the comment block at the top of that file for instructions on switching to OpenAI or Groq — only `server.js` needs to change on the backend.

## Project Structure

```
forge/
├── server.js              # Express backend (two routes: /api/chat, /api/debrief)
├── src/
│   ├── App.jsx            # Root component, screen routing
│   ├── main.jsx           # React entry point
│   ├── data/
│   │   └── scenarios.js   # All scenario content (add new scenarios here)
│   ├── hooks/
│   │   └── useForge.js    # Central state + API orchestration
│   ├── lib/
│   │   └── ai.js          # All AI/API calls (change this to switch providers)
│   └── screens/
│       ├── HomeScreen.jsx    # Scenario selection
│       ├── ScenarioScreen.jsx # Live chat interface
│       └── DebriefScreen.jsx  # Growth Report visualization
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
- `systemPrompt` — the full system prompt sent to Claude
- `openingMessage` — the first AI message the user sees

## Assumptions Made

1. **Vite for frontend build** — The spec said "no router needed" so this is a single SPA with state-based screen switching.
2. **SSE streaming** — `/api/chat` streams Server-Sent Events. The frontend reads them with the Fetch Streams API (supported in all modern browsers).
3. **`claude-sonnet-4-5`** — Used for both chat and debrief. The spec said `claude-sonnet-4-6` which doesn't exist yet; `claude-sonnet-4-5` is the latest Sonnet.
4. **Opening message baked into scenario data** — Rather than having the backend "start" the conversation, the first character message is defined in `scenarios.js` and rendered immediately without an API call. This keeps the scenario feeling instant.
5. **No auth/sessions** — This is a single-user demo app with no persistence. Conversation state lives in React state only.
