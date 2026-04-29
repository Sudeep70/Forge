/**
 * src/lib/ai.js — Google Gemini integration with simulated streaming.
 */

const BASE_URL = import.meta.env.VITE_API_URL;

/**
 * sendMessage — calls Gemini and simulates streaming for the UI
 * @param {Array} messages - [{role: 'user'|'assistant', content: string}]
 * @param {string} scenarioContext - the system prompt for the scenario
 * @param {function} onDelta - called with each text chunk as it "streams"
 * @param {function} onError - called with error message if something fails
 */
export async function sendMessage(messages, scenarioContext, onDelta, onError) {
  try {
    const response = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, scenarioContext }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
      throw new Error(err.error || `Request failed with status ${response.status}`);
    }

    const data = await response.json();
    const fullText = data.text || '';

    // Simulate streaming by breaking text into chunks with delays
    const chunks = fullText.split(/(\s+)/); // Split by words but keep whitespace
    let currentText = '';

    for (const chunk of chunks) {
      currentText += chunk;
      onDelta(chunk);
      // Slight variable delay for realism (20-50ms)
      await new Promise(r => setTimeout(r, 20 + Math.random() * 30));
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
  const response = await fetch(`${BASE_URL}/api/debrief`, {
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
