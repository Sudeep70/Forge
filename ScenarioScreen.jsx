import { useState, useRef, useEffect, useCallback } from 'react';

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
    </div>
  );
}

function CharacterAvatar({ character, characterId, scenario }) {
  const char = scenario?.characters?.find(c => c.id === characterId);
  const initial = char?.initial ?? (character ? character[0] : '?');
  const color = char?.color ?? '#6B6B70';

  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-mono font-bold shrink-0"
      style={{
        background: `${color}20`,
        color: color,
        border: `1px solid ${color}40`,
      }}
    >
      {initial}
    </div>
  );
}

function MessageBubble({ message, scenario }) {
  const isUser = message.role === 'user';

  // Strip the [CharacterName] prefix from display
  const displayContent = message.content.replace(/^\[[^\]]+\]\s*/, '');
  const char = scenario?.characters?.find(c => c.id === message.characterId);

  return (
    <div className={`flex gap-3 mb-5 fade-up ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isUser && (
        <CharacterAvatar
          character={message.character}
          characterId={message.characterId}
          scenario={scenario}
        />
      )}

      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[82%]`}>
        {!isUser && message.character && (
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono font-medium" style={{ color: char?.color ?? '#6B6B70' }}>
              {message.character}
            </span>
            {char?.role && (
              <span className="text-xs font-mono" style={{ color: '#3A3A3F' }}>
                {char.role}
              </span>
            )}
          </div>
        )}

        <div
          className="rounded-2xl px-4 py-3 text-sm leading-relaxed"
          style={
            isUser
              ? {
                  background: '#FF4B1F',
                  color: '#fff',
                  borderRadius: '18px 18px 4px 18px',
                }
              : {
                  background: '#111113',
                  color: '#E8E6E1',
                  border: '1px solid #1E1E22',
                  borderRadius: '4px 18px 18px 18px',
                }
          }
        >
          {message.streaming && !displayContent ? (
            <TypingIndicator />
          ) : (
            <span>{displayContent || <TypingIndicator />}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function ErrorBanner({ message, onRetry, onDismiss }) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl mx-4 mb-3"
      style={{ background: '#FF4B1F18', border: '1px solid #FF4B1F33' }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="#FF4B1F">
        <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 3.5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 018 4.5zm0 7a.875.875 0 110-1.75.875.875 0 010 1.75z" />
      </svg>
      <span className="text-sm flex-1" style={{ color: '#FF8C42' }}>
        {message}
      </span>
      <button
        onClick={onRetry}
        className="text-xs font-mono px-3 py-1 rounded-lg transition-colors"
        style={{ background: '#FF4B1F', color: '#fff' }}
      >
        Retry
      </button>
    </div>
  );
}

export default function ScenarioScreen({ scenario, messages, isTyping, error, onSend, onEnd, onRetry }) {
  const [input, setInput] = useState('');
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || isTyping) return;
    setInput('');
    onSend(text);
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [input, isTyping, onSend]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e) => {
    setInput(e.target.value);
    // Auto-resize
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  const userMessageCount = messages.filter(m => m.role === 'user').length;

  return (
    <div
      className="flex flex-col h-screen"
      style={{ background: '#0A0A0B', maxWidth: '600px', margin: '0 auto', width: '100%' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 shrink-0"
        style={{ borderBottom: '1px solid #1E1E22', background: '#0A0A0B' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: '#FF4B1F', boxShadow: '0 0 8px #FF4B1F80' }}
          />
          <div>
            <div className="text-sm font-medium" style={{ color: '#E8E6E1' }}>
              {scenario?.title}
            </div>
            <div className="text-xs font-mono" style={{ color: '#3A3A3F' }}>
              LIVE SIMULATION
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Character avatars */}
          <div className="flex -space-x-1">
            {scenario?.characters?.map(char => (
              <div
                key={char.id}
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold"
                style={{
                  background: `${char.color}20`,
                  color: char.color,
                  border: `1px solid ${char.color}60`,
                }}
                title={`${char.name} — ${char.role}`}
              >
                {char.initial}
              </div>
            ))}
          </div>

          {!showEndConfirm ? (
            <button
              onClick={() => setShowEndConfirm(true)}
              className="text-xs font-mono px-3 py-1.5 rounded-lg transition-all"
              style={{
                color: '#6B6B70',
                border: '1px solid #1E1E22',
                background: 'transparent',
              }}
              onMouseEnter={e => {
                e.target.style.color = '#E8E6E1';
                e.target.style.borderColor = '#3A3A3F';
              }}
              onMouseLeave={e => {
                e.target.style.color = '#6B6B70';
                e.target.style.borderColor = '#1E1E22';
              }}
            >
              End
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: '#6B6B70' }}>Get report?</span>
              <button
                onClick={onEnd}
                className="text-xs font-mono px-3 py-1.5 rounded-lg transition-all"
                style={{ background: '#FF4B1F', color: '#fff' }}
              >
                Yes
              </button>
              <button
                onClick={() => setShowEndConfirm(false)}
                className="text-xs font-mono px-2 py-1.5 rounded-lg transition-all"
                style={{ color: '#6B6B70', border: '1px solid #1E1E22' }}
              >
                No
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Scenario setup banner */}
      {messages.length <= 1 && (
        <div
          className="mx-4 mt-4 rounded-xl px-4 py-3 shrink-0"
          style={{ background: '#111113', border: '1px solid #1E1E22' }}
        >
          <p className="text-xs font-mono mb-1" style={{ color: '#FF4B1F' }}>SITUATION</p>
          <p className="text-xs leading-relaxed" style={{ color: '#6B6B70' }}>
            {scenario?.setup}
          </p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2">
        {messages.map((msg, i) => (
          <MessageBubble
            key={msg.id ?? i}
            message={msg}
            scenario={scenario}
          />
        ))}

        {isTyping && !messages.some(m => m.streaming) && (
          <div className="flex gap-3 mb-5">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: '#1E1E22', border: '1px solid #3A3A3F' }}
            >
              <TypingIndicator />
            </div>
          </div>
        )}

        {error && (
          <ErrorBanner
            message={error}
            onRetry={onRetry}
            onDismiss={() => {}}
          />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        className="px-4 pb-4 pt-3 shrink-0"
        style={{ borderTop: '1px solid #1E1E22' }}
      >
        {userMessageCount === 0 && (
          <p className="text-xs text-center mb-3 font-mono" style={{ color: '#3A3A3F' }}>
            Respond naturally — there are no right answers
          </p>
        )}

        <div
          className="flex items-end gap-3 rounded-2xl px-4 py-3"
          style={{ background: '#111113', border: '1px solid #1E1E22' }}
        >
          <textarea
            ref={el => { inputRef.current = el; textareaRef.current = el; }}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="What do you say?"
            disabled={isTyping}
            rows={1}
            className="flex-1 bg-transparent outline-none resize-none text-sm leading-relaxed"
            style={{
              color: '#E8E6E1',
              minHeight: '24px',
              maxHeight: '120px',
              fontFamily: 'DM Sans, sans-serif',
            }}
          />

          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200"
            style={{
              background: input.trim() && !isTyping ? '#FF4B1F' : '#1E1E22',
              transform: input.trim() && !isTyping ? 'scale(1)' : 'scale(0.9)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 7l12 0M7 1l6 6-6 6" stroke={input.trim() && !isTyping ? '#fff' : '#3A3A3F'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <p className="text-center text-xs mt-2 font-mono" style={{ color: '#1E1E22' }}>
          Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
