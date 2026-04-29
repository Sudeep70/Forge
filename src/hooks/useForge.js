import { useState, useCallback, useRef } from 'react';
import { sendMessage, generateDebrief } from '../lib/ai';
import { getScenario } from '../data/scenarios';

/**
 * useForge — central state machine for the Forge app
 * Manages: screen transitions, conversation state, API calls, errors
 */
export function useForge() {
  const [screen, setScreen] = useState('home'); // 'home' | 'scenario' | 'debrief'
  const [activeScenario, setActiveScenario] = useState(null);
  const [messages, setMessages] = useState([]); // [{role, content, character, characterId}]
  const [isTyping, setIsTyping] = useState(false);
  const [isGeneratingDebrief, setIsGeneratingDebrief] = useState(false);
  const [debrief, setDebrief] = useState(null);
  const [error, setError] = useState(null);
  const [debriefError, setDebriefError] = useState(null);
  const streamingRef = useRef(false);

  // Parse character name from response like "[Alex] Some message..."
  const parseCharacter = useCallback((text, scenario) => {
    const match = text.match(/^\[([^\]]+)\]/);
    if (!match) return { character: null, characterId: null };
    const name = match[1];
    const char = scenario?.characters?.find(
      c => c.name.toLowerCase() === name.toLowerCase()
    );
    return {
      character: name,
      characterId: char?.id ?? null,
    };
  }, []);

  const startScenario = useCallback((scenarioId) => {
    const scenario = getScenario(scenarioId);
    if (!scenario) return;

    setActiveScenario(scenario);
    setError(null);

    // Load the opening message from scenario data
    const opening = scenario.openingMessage;
    setMessages([{
      role: 'assistant',
      content: opening.content,
      character: opening.character,
      characterId: opening.characterId,
    }]);

    setScreen('scenario');
  }, []);

  const sendUserMessage = useCallback(async (userText) => {
    if (!userText.trim() || isTyping || streamingRef.current) return;
    if (!activeScenario) return;

    setError(null);
    const userMsg = { role: 'user', content: userText };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);
    streamingRef.current = true;

    // Build API messages array (only role + content, no UI metadata)
    const apiMessages = [...messages, userMsg].map(m => ({
      role: m.role,
      content: m.content,
    }));

    // Placeholder for streaming response
    const placeholderId = Date.now();
    let streamedText = '';
    let parsedOnce = false;
    let characterInfo = { character: null, characterId: null };

    setMessages(prev => [...prev, {
      role: 'assistant',
      content: '',
      character: null,
      characterId: null,
      streaming: true,
      id: placeholderId,
    }]);

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('AI response timed out. Please try again.')), 15000)
    );

    try {
      await Promise.race([
        sendMessage(
          apiMessages,
          activeScenario.systemPrompt,
          (delta) => {
            streamedText += delta;
            // Parse character on first chunk that contains the bracket
            if (!parsedOnce && streamedText.includes(']')) {
              characterInfo = parseCharacter(streamedText, activeScenario);
              parsedOnce = true;
            }
            setMessages(prev => prev.map(m =>
              m.id === placeholderId
                ? { ...m, content: streamedText, ...characterInfo }
                : m
            ));
          },
          (errMsg) => {
            setError(errMsg);
            setMessages(prev => prev.filter(m => m.id !== placeholderId));
          }
        ),
        timeoutPromise
      ]);
    } catch (err) {
      setError(err.message);
      setMessages(prev => prev.filter(m => m.id !== placeholderId));
    }

    // Finalize: remove streaming flag
    setMessages(prev => prev.map(m =>
      m.id === placeholderId
        ? { ...m, streaming: false }
        : m
    ));

    setIsTyping(false);
    streamingRef.current = false;
  }, [messages, activeScenario, isTyping, parseCharacter]);

  const endScenario = useCallback(async () => {
    setIsGeneratingDebrief(true);
    setDebriefError(null);
    setScreen('debrief');

    const apiMessages = messages.map(m => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const result = await generateDebrief(apiMessages);
      setDebrief(result);
    } catch (err) {
      setDebriefError(err.message || 'Failed to generate your Growth Report. Please try again.');
    } finally {
      setIsGeneratingDebrief(false);
    }
  }, [messages]);

  const retryDebrief = useCallback(async () => {
    if (!messages.length) return;
    setIsGeneratingDebrief(true);
    setDebriefError(null);

    const apiMessages = messages.map(m => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const result = await generateDebrief(apiMessages);
      setDebrief(result);
    } catch (err) {
      setDebriefError(err.message || 'Failed to generate your Growth Report. Please try again.');
    } finally {
      setIsGeneratingDebrief(false);
    }
  }, [messages]);

  const resetApp = useCallback(() => {
    setScreen('home');
    setActiveScenario(null);
    setMessages([]);
    setDebrief(null);
    setError(null);
    setDebriefError(null);
    setIsTyping(false);
    setIsGeneratingDebrief(false);
    streamingRef.current = false;
  }, []);

  const retryLastMessage = useCallback(() => {
    setError(null);
    // Remove the last user message so they can resend
    setMessages(prev => {
      const lastUserIdx = [...prev].reverse().findIndex(m => m.role === 'user');
      if (lastUserIdx === -1) return prev;
      const idx = prev.length - 1 - lastUserIdx;
      return prev.slice(0, idx);
    });
  }, []);

  return {
    // State
    screen,
    activeScenario,
    messages,
    isTyping,
    isGeneratingDebrief,
    debrief,
    error,
    debriefError,
    // Actions
    startScenario,
    sendUserMessage,
    endScenario,
    retryDebrief,
    retryLastMessage,
    resetApp,
  };
}
