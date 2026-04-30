import { useState, useRef, useEffect, useCallback } from 'react';

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-5 py-4">
      <span className="typing-dot w-2 h-2" />
      <span className="typing-dot w-2 h-2" />
      <span className="typing-dot w-2 h-2" />
    </div>
  );
}

function CharacterAvatar({ character, characterId, scenario, large = false }) {
  const char = scenario?.characters?.find(c => c.id === characterId);
  const initial = char?.initial ?? (character ? character[0] : '?');
  const color = char?.color ?? '#6B6B70';

  return (
    <div
      className={`${large ? 'w-12 h-12 text-lg' : 'w-10 h-10 text-base'} rounded-full flex items-center justify-center font-mono font-bold shrink-0 shadow-lg`}
      style={{
        background: `${color}15`,
        color: color,
        border: `2px solid ${color}30`,
      }}
    >
      {initial}
    </div>
  );
}

function MessageBubble({ message, scenario }) {
  const isUser = message.role === 'user';
  const displayContent = message.content.replace(/^\[[^\]]+\]\s*/, '');
  const char = scenario?.characters?.find(c => c.id === message.characterId);

  return (
    <div className={`flex gap-5 mb-8 fade-up ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isUser && (
        <CharacterAvatar
          character={message.character}
          characterId={message.characterId}
          scenario={scenario}
        />
      )}

      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[75%]`}>
        {!isUser && message.character && (
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm font-mono font-bold tracking-widest uppercase" style={{ color: char?.color ?? '#6B6B70' }}>
              {message.character}
            </span>
            <div className="w-1 h-1 rounded-full bg-[#1E1E22]" />
            <span className="text-xs font-mono uppercase tracking-widest" style={{ color: '#3A3A3F' }}>
              {char?.role || 'Stakeholder'}
            </span>
          </div>
        )}

        <div
          className="px-6 py-4 text-base leading-relaxed shadow-xl"
          style={
            isUser
              ? {
                  background: '#FF4B1F',
                  color: '#fff',
                  borderRadius: '24px 24px 4px 24px',
                }
              : {
                  background: '#111113',
                  color: '#E8E6E1',
                  border: '1px solid #1E1E22',
                  borderRadius: '4px 24px 24px 24px',
                }
          }
        >
          {message.streaming && !displayContent ? (
            <TypingIndicator />
          ) : (
            <span className="whitespace-pre-wrap">{displayContent || <TypingIndicator />}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ScenarioScreen({ scenario, messages, isTyping, error, onSend, onEnd, onRetry }) {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [timeLeft, setTimeLeft] = useState(scenario?.timeLimit || 60);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (timeLeft <= 0) {
      onEnd();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onEnd]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Sync textarea height when input changes programmatically (like from voice)
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [input]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      // Keep track of the input before voice started to append correctly
      let baseText = '';

      recognition.onstart = () => {
        setIsListening(true);
        baseText = inputRef.current?.value || '';
      };

      recognition.onend = () => setIsListening(false);
      
      recognition.onerror = (event) => {
        setIsListening(false);
        console.error('Speech Recognition Error:', event.error);
        if (event.error === 'not-allowed') {
          alert('Microphone permission required');
        }
      };

      recognition.onresult = (event) => {
        let sessionTranscript = '';
        for (let i = 0; i < event.results.length; ++i) {
          sessionTranscript += event.results[i][0].transcript;
        }
        
        // Update the input with base text + what's been said in this session
        const newText = baseText ? `${baseText.trim()} ${sessionTranscript.trim()}` : sessionTranscript.trim();
        setInput(newText);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Voice input not supported in this browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || isTyping || timeLeft <= 0) return;

    // Stop listening if active
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }

    setInput('');
    onSend(text);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [input, isTyping, onSend, timeLeft, isListening]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e) => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setInput(e.target.value);
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#0A0A0B] overflow-hidden">
      {/* LEFT PANEL: CONTEXT & CAST */}
      <aside className="w-full lg:w-[450px] border-b lg:border-b-0 lg:border-r border-[#1E1E22] bg-[#0A0A0B] flex flex-col shrink-0 relative z-20 shadow-2xl overflow-y-auto lg:overflow-visible">
        <div className="p-6 md:p-10 flex flex-col h-full">
          {/* Header */}
          <div className="mb-8 lg:mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded bg-[#FF4B1F] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1C7 1 9 4 9 6.5C9 7.88 7.88 9 6.5 9C5.12 9 4 7.88 4 6.5C4 5.5 4.5 4.5 5 4C4 5 3 7 4.5 9.5C5.3 11 6.5 12 6.5 12C6.5 12 10 10 10 6.5C10 3.5 7 1 7 1Z" fill="white" />
                </svg>
              </div>
              <span className="font-display text-xl md:text-2xl tracking-[0.1em]" style={{ color: '#E8E6E1' }}>FORGE</span>
            </div>
            
            <h1 className="font-display text-2xl md:text-4xl mb-4 leading-tight" style={{ color: '#E8E6E1' }}>
              {scenario?.title}
            </h1>
            
            <div className="flex items-center gap-4">
              <div className="text-[10px] font-mono border border-orange-500/30 px-2 py-0.5 text-orange-500 rounded uppercase">
                {scenario?.intensity} Pressure
              </div>
              <div className="text-[10px] font-mono text-[#3A3A3F] uppercase tracking-widest">
                Real-time Simulation
              </div>
            </div>
          </div>

          <div className="hidden lg:flex flex-col flex-1 overflow-y-auto pr-4 space-y-12">
            {/* Situation */}
            <section>
              <h2 className="text-[10px] font-mono uppercase tracking-[0.3em] mb-4" style={{ color: '#3A3A3F' }}>
                Situation_Log
              </h2>
              <div className="rounded-2xl p-6 border border-[#1E1E22] bg-[#111113]/50 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#FF4B1F]" />
                <p className="text-sm leading-relaxed" style={{ color: '#6B6B70' }}>
                  {scenario?.setup}
                </p>
              </div>
            </section>

            {/* Cast */}
            <section>
              <h2 className="text-[10px] font-mono uppercase tracking-[0.3em] mb-6" style={{ color: '#3A3A3F' }}>
                Neural_Profiles
              </h2>
              <div className="space-y-6">
                {scenario?.characters?.map(char => (
                  <div key={char.id} className="flex items-center gap-4 group">
                    <CharacterAvatar character={char.name} characterId={char.id} scenario={scenario} />
                    <div>
                      <div className="text-sm font-bold tracking-wide" style={{ color: '#E8E6E1' }}>{char.name}</div>
                      <div className="text-xs font-mono uppercase tracking-widest" style={{ color: '#3A3A3F' }}>{char.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Action Footer */}
          <div className="pt-6 lg:pt-10 mt-auto border-t border-[#1E1E22]">
            {!showEndConfirm ? (
              <button
                onClick={() => setShowEndConfirm(true)}
                className="w-full py-4 rounded-xl font-mono text-sm uppercase tracking-widest transition-all border border-[#1E1E22] hover:bg-[#FF4B1F] hover:border-[#FF4B1F] hover:text-white"
                style={{ color: '#6B6B70' }}
              >
                Terminate Simulation
              </button>
            ) : (
              <div className="space-y-4">
                <p className="text-xs font-mono text-center mb-2" style={{ color: '#FF4B1F' }}>Generate growth report now?</p>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={onEnd}
                    className="py-4 rounded-xl font-mono text-sm bg-[#FF4B1F] text-white shadow-lg shadow-orange-900/20"
                  >
                    YES
                  </button>
                  <button
                    onClick={() => setShowEndConfirm(false)}
                    className="py-4 rounded-xl font-mono text-sm border border-[#1E1E22] text-[#6B6B70]"
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* RIGHT PANEL: LIVE CHAT */}
      <main className="flex-1 flex flex-col relative bg-[#0A0A0B] min-h-0">
        <div className="absolute inset-0 noise-overlay opacity-20 pointer-events-none" />
        
        {/* Timer UI */}
        <div className="absolute top-4 md:top-8 right-4 md:right-12 z-30">
          <div 
            className={`px-4 py-2 rounded-full border font-mono text-[10px] md:text-sm transition-all duration-300 flex items-center gap-2 ${
              timeLeft < 15 ? 'bg-red-500/10 border-red-500 text-red-500 animate-pulse' : 'bg-[#111113] border-[#1E1E22] text-[#6B6B70]'
            }`}
          >
            {timeLeft <= 10 && timeLeft > 0 && <span>⚠️</span>}
            <span className="hidden sm:inline uppercase tracking-widest">
              {timeLeft <= 10 && timeLeft > 0 ? "Final Seconds: " : "Time Remaining: "}
            </span>
            <span className="font-bold">{timeLeft}s</span>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto px-4 md:px-12 pt-16 md:pt-24 pb-6 relative z-10 scroll-smooth">
          <div className="max-w-4xl mx-auto">
            {messages.map((msg, i) => (
              <MessageBubble
                key={msg.id ?? i}
                message={msg}
                scenario={scenario}
              />
            ))}

            {isTyping && !messages.some(m => m.streaming) && (
              <div className="flex gap-4 md:gap-5 mb-8">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center bg-[#111113] border border-[#1E1E22] shadow-xl">
                  <TypingIndicator />
                </div>
              </div>
            )}

            {error && (
              <div className="flex flex-col items-center justify-center py-6 md:py-10 bg-[#FF4B1F08] border border-[#FF4B1F15] rounded-3xl mb-8">
                <p className="text-orange-500 font-mono text-xs md:text-sm mb-4 px-4 text-center">{error}</p>
                <button
                  onClick={onRetry}
                  className="px-6 py-2 bg-[#FF4B1F] text-white text-[10px] md:text-xs font-mono rounded-lg hover:brightness-110 transition-all"
                >
                  SYSTEM_RETRY
                </button>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="px-4 md:px-12 py-6 md:py-10 relative z-20">
          <div className="max-w-4xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-600/20 to-red-600/20 rounded-[32px] blur opacity-25 group-focus-within:opacity-100 transition-opacity duration-500" />
            <div className="relative flex items-end gap-3 md:gap-4 bg-[#111113] border border-[#1E1E22] rounded-[28px] p-3 md:p-4 shadow-2xl">
              {/* Mic Button */}
              <button
                onClick={toggleListening}
                disabled={isTyping || timeLeft <= 0}
                className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex flex-col items-center justify-center shrink-0 transition-all duration-300 shadow-lg group/mic relative overflow-hidden`}
                style={{
                  background: isListening ? '#FF4B1F' : '#1E1E22',
                  boxShadow: isListening ? '0 0 20px #FF4B1F60' : 'none',
                }}
              >
                {isListening && (
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                )}
                <svg className="w-5 h-5 md:w-6 md:h-6 relative z-10" viewBox="0 0 24 24" fill="none" stroke={isListening ? '#fff' : '#6B6B70'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" y1="19" x2="12" y2="23"></line>
                  <line x1="8" y1="23" x2="16" y2="23"></line>
                </svg>
                {isListening && (
                   <span className="text-[7px] md:text-[8px] font-mono absolute bottom-1 text-white uppercase tracking-tighter animate-pulse">REC</span>
                )}
              </button>

              <textarea
                ref={el => { inputRef.current = el; textareaRef.current = el; }}
                value={input}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder={timeLeft <= 0 ? "Simulation Terminated" : isListening ? "Listening..." : "Type response..."}
                disabled={isTyping || timeLeft <= 0}
                rows={1}
                className="flex-1 bg-transparent border-none outline-none resize-none text-base md:text-lg leading-relaxed py-2 px-1 md:px-2 placeholder:text-[#3A3A3F]"
                style={{
                  color: '#E8E6E1',
                  minHeight: '44px',
                  maxHeight: '150px',
                  fontFamily: 'DM Sans, sans-serif',
                }}
              />

              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping || timeLeft <= 0}
                className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 shadow-lg"
                style={{
                  background: input.trim() && !isTyping && timeLeft > 0 ? '#FF4B1F' : '#1E1E22',
                  transform: input.trim() && !isTyping && timeLeft > 0 ? 'scale(1)' : 'scale(0.95)',
                }}
              >
                <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" stroke={input.trim() && !isTyping && timeLeft > 0 ? '#fff' : '#3A3A3F'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </div>
          </div>
          <p className="text-center text-[8px] md:text-[10px] font-mono mt-3 md:mt-4 tracking-[0.2em]" style={{ color: '#1E1E22' }}>
            TERMINAL ENCRYPTED // END-TO-END NEURAL LINK ACTIVE
          </p>
        </div>
      </main>
    </div>
  );
}
