import { useState, useCallback, useRef, useEffect } from 'react';
import { sendMessage, generateDebrief } from '../lib/ai';
import { getScenario } from '../data/scenarios';
import supabase, { saveSession } from '../lib/supabase';

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
  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [isDemo, setIsDemo] = useState(localStorage.getItem("demo_user") === "true");
  const [authError, setAuthError] = useState(null);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const streamingRef = useRef(false);

  const fetchSessions = useCallback(async (userId) => {
    if (!userId) return;
    setIsLoadingSessions(true);
    try {
      const { data, error } = await supabase
        .from('scenario_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false });
      
      if (error) throw error;
      setSessions(data || []);
    } catch (err) {
      console.error('Error fetching sessions:', err);
    } finally {
      setIsLoadingSessions(false);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user);
        setAuthError(null);
        fetchSessions(user.id);
      } else if (isDemo) {
        setUser({ email: 'demo@forge.ai', user_metadata: { avatar_url: null } });
        setAuthError(null);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        setIsDemo(false);
        setAuthError(null); // Clear errors on login
        localStorage.removeItem("demo_user");
        fetchSessions(session.user.id);
      }
    });
    return () => subscription.unsubscribe();
  }, [isDemo, fetchSessions]);

  const signIn = async (email, password) => {
    setAuthError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setAuthError("Invalid email or password");
        } else {
          setAuthError(error.message);
        }
        return false;
      }
      return true;
    } catch (err) {
      setAuthError("Connection failed. Try again.");
      return false;
    }
  };

  const signUp = async (email, password) => {
    setAuthError(null);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setAuthError(error.message);
        return false;
      }
      setAuthError("Account created! Logging in...");
      return true;
    } catch (err) {
      setAuthError("Sign up failed. Try again.");
      return false;
    }
  };

  const loginAsDemo = () => {
    localStorage.setItem("demo_user", "true");
    setIsDemo(true);
    setUser({ email: 'demo@forge.ai', user_metadata: { avatar_url: null } });
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.log("SIGNOUT_ERROR:", err);
    }
    
    // Clear all persistent storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Reset in-memory state
    setUser(null);
    setIsDemo(false);
    setAuthError(null); // Clear errors on logout
    
    // Redirect to home
    setScreen('home');
  };

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

  const startCustomScenario = useCallback((customData) => {
    const { title, description, stake, timeLimit } = customData;
    
    // Create a scenario object that matches the expected structure
    const customScenario = {
      id: `custom-${Date.now()}`,
      title,
      subtitle: `Stakes: ${stake}`,
      setup: description,
      intensity: stake,
      timeLimit: parseInt(timeLimit),
      characters: [
        { id: 'stakeholder', name: 'Stakeholder', role: 'Decision Maker', initial: 'S', color: '#FF4B1F' }
      ],
      systemPrompt: `You are a high-stakes decision simulator. 
        CONTEXT: ${description}
        STAKES: ${stake}
        Your goal is to pressure the user to make a choice. 
        Start with a direct challenge as a senior stakeholder.
        Always prefix your messages with [Stakeholder].`,
      openingMessage: {
        character: 'Stakeholder',
        characterId: 'stakeholder',
        content: `[Stakeholder] You’re facing the situation: ${description}. We need to decide now. What's your move?`
      }
    };

    setActiveScenario(customScenario);
    setError(null);
    setMessages([{
      role: 'assistant',
      content: customScenario.openingMessage.content,
      character: 'Stakeholder',
      characterId: 'stakeholder',
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
          `STRICT CHARACTER RULE: You may ONLY play the characters listed in THIS scenario. Do not use characters from any other scenario. The only valid characters right now are: [${activeScenario.characters.map(c => c.name).join(', ')}].\n\n${activeScenario.systemPrompt}`,
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

      // SAVE TO SUPABASE
      if (user && !isDemo) {
        try {
          await saveSession(
            result, 
            activeScenario.id, 
            activeScenario.title, 
            messages.length
          );
          // Refresh sessions list
          fetchSessions(user.id);
        } catch (err) {
          console.error('Failed to save session:', err);
          // Silently fail as requested
        }
      }
    } catch (err) {
      setDebriefError(err.message || 'Failed to generate your Growth Report. Please try again.');
    } finally {
      setIsGeneratingDebrief(false);
    }
  }, [messages, user, activeScenario, isDemo, fetchSessions]);

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
    user,
    sessions,
    authError,
    isLoadingSessions,
    // Actions
    signIn,
    signUp,
    loginAsDemo,
    logout,
    startScenario,
    startCustomScenario,
    sendUserMessage,
    endScenario,
    retryDebrief,
    retryLastMessage,
    resetApp,
    setScreen,
  };
}

// Helper to calculate average scores
export function calculateStats(sessions) {
  if (!sessions.length) return null;

  const traits = [
    { key: 'score_transparency', label: 'Transparency' },
    { key: 'score_decisiveness', label: 'Decisiveness' },
    { key: 'score_empathy', label: 'Empathy' },
    { key: 'score_risk_awareness', label: 'Risk Awareness' },
    { key: 'score_integrity', label: 'Integrity' },
  ];

  const averages = traits.reduce((acc, trait) => {
    const sum = sessions.reduce((s, sess) => s + (sess[trait.key] || 0), 0);
    acc[trait.label] = Math.round(sum / sessions.length);
    return acc;
  }, {});

  const strongestTrait = Object.entries(averages).reduce((a, b) => a[1] > b[1] ? a : b);

  return {
    averages,
    totalSessions: sessions.length,
    strongestTrait: strongestTrait[0],
    strongestScore: strongestTrait[1],
  };
}
