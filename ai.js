/**
 * src/lib/ai.js — All AI provider calls live here.
 *
 * TO SWITCH PROVIDERS:
 * ─────────────────────────────────────────────────────────────────
 * This file is the single point of change for swapping AI providers.
 *
 * Current: Anthropic Claude (via /api/chat and /api/debrief proxied through Express)
 *
 * To switch to OpenAI (gpt-4o):
 *   In server.js, change the fetch URL to: https://api.openai.com/v1/chat/completions
 *   Change model to: gpt-4o
 *   Change header: Authorization: Bearer <key> (instead of x-api-key)
 *   Adapt message format to OpenAI's (system message in messages array)
 *   Adapt stream parsing: choices[0].delta.content
 *
 * To switch to Groq (llama-3.3-70b):
 *   URL: https://api.groq.com/openai/v1/chat/completions
 *   Model: llama-3.3-70b-versatile
 *   Format: OpenAI-compatible (same as above)
 *
 * Frontend calls only these two functions — no changes needed there.
 * ─────────────────────────────────────────────────────────────────
 */

const API_BASE = ''; // Empty = same origin (proxied through Express in dev, served in prod)

/**
 * sendMessage — streams a character response into a callback
 * @param {Array} messages - [{role: 'user'|'assistant', content: string}]
 * @param {string} scenarioContext - the system prompt for the scenario
 * @param {function} onDelta - called with each text chunk as it streams
 * @param {function} onError - called with error message if something fails
 * @returns {Promise<string>} - resolves with the full response text
 */
export async function sendMessage(messages, scenarioContext, onDelta, onError) {
  try {
    const response = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, scenarioContext }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
      throw new Error(err.error || `Request failed with status ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? ''; // Keep incomplete line in buffer

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          if (parsed.error) throw new Error(parsed.error);
          if (parsed.delta) {
            fullText += parsed.delta;
            onDelta(parsed.delta);
          }
        } catch (parseErr) {
          // Skip malformed SSE frames
        }
      }
    }

    return fullText;
  } catch (err) {
    onError(err.message || 'Something went wrong. Please try again.');
    return '';
  }
}

/**
 * generateDebrief — analyzes full conversation and returns judgment map
 * @param {Array} conversationHistory - full message history
 * @returns {Promise<Object>} - the judgment map JSON
 */
export async function generateDebrief(conversationHistory) {
  const response = await fetch(`${API_BASE}/api/debrief`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conversationHistory }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
    throw new Error(err.error || `Debrief request failed with status ${response.status}`);
  }

  return response.json();
}
