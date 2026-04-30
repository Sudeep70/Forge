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
  const char = scenario?.characters?.find(c => c.id === characterId) || scenario?.characters?.find(c => c.name === character);
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
  const char = scenario?.characters?.find(c => c.id === message.characterId) || scenario?.characters?.find(c => c.name === message.character);

  return (
    <div className={`flex gap-5 mb-8 fade-up ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isUser && (
        <CharacterAvatar
          character={message.character}
          characterId={message.characterId}
          scenario={scenario}
        />
      )}

      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[85%]`}>
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

// Simple YouTube Iframe wrapper
function YouTubePlayer({ videoUrl, onTimeUpdate, onEnded, isPlaying }) {
  const iframeRef = useRef(null);
  const playerRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  // Extract video ID
  const videoIdMatch = videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
  const videoId = videoIdMatch ? videoIdMatch[1] : null;

  useEffect(() => {
    if (!videoId) return;

    // Load YT API if not loaded
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    const initPlayer = () => {
      if (!iframeRef.current) return;
      playerRef.current = new window.YT.Player(iframeRef.current, {
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
        },
        events: {
          onReady: () => setIsReady(true),
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              onEnded();
            }
          }
        }
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [videoId]);

  // Polling for time
  useEffect(() => {
    let interval;
    if (isReady && playerRef.current && isPlaying) {
      interval = setInterval(() => {
        if (playerRef.current.getCurrentTime) {
          onTimeUpdate(playerRef.current.getCurrentTime());
        }
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isReady, isPlaying, onTimeUpdate]);

  // Handle play/pause commands
  useEffect(() => {
    if (isReady && playerRef.current) {
      if (isPlaying) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    }
  }, [isPlaying, isReady]);

  if (!videoId) {
    return <div className="w-full h-full bg-black flex items-center justify-center text-red-500">Invalid Video URL</div>;
  }

  return (
    <div className="w-full h-full relative pointer-events-none">
      <div ref={iframeRef} className="w-full h-full" />
    </div>
  );
}

export default function VideoScenarioScreen({ scenario, messages, isTyping, error, onSend, onEnd, onRetry }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentDecisionIndex, setCurrentDecisionIndex] = useState(0);
  const [showOverlay, setShowOverlay] = useState(false);
  const [input, setInput] = useState('');
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const decisionPoints = scenario?.decisionPoints || [];
  const currentDecision = decisionPoints[currentDecisionIndex];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (showOverlay) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [showOverlay]);

  const handleTimeUpdate = useCallback((time) => {
    if (!currentDecision) return;
    
    // Auto-pause if we hit or pass the timestamp for the current decision point
    if (time >= currentDecision.timestamp && isPlaying && !showOverlay) {
      setIsPlaying(false);
      setShowOverlay(true);
    }
  }, [currentDecision, isPlaying, showOverlay]);

  const handleEnded = useCallback(() => {
    onEnd();
  }, [onEnd]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isTyping) return;
    
    setInput('');
    setShowOverlay(false);
    onSend(text);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleContinue = () => {
    setCurrentDecisionIndex(prev => prev + 1);
    setIsPlaying(true);
  };

  const isChatting = messages.length > 0 && !isPlaying && !showOverlay;

  return (
    <div className="flex flex-col h-screen bg-[#0A0A0B] overflow-hidden">
      {/* TOP HALF: VIDEO PLAYER */}
      <div className={`relative w-full bg-black flex-shrink-0 transition-all duration-500 ${isChatting ? 'h-[40vh]' : 'h-[60vh] md:h-[70vh]'}`}>
        
        <YouTubePlayer 
          videoUrl={scenario.videoUrl} 
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          isPlaying={isPlaying}
        />

        {/* Top Bar Overlay */}
        <div className="absolute top-0 left-0 w-full p-4 md:p-6 flex justify-between items-center z-10 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded bg-[#FF4B1F] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
                <path d="M7 1C7 1 9 4 9 6.5C9 7.88 7.88 9 6.5 9C5.12 9 4 7.88 4 6.5C4 5.5 4.5 4.5 5 4C4 5 3 7 4.5 9.5C5.3 11 6.5 12 6.5 12C6.5 12 10 10 10 6.5C10 3.5 7 1 7 1Z" fill="white" />
              </svg>
            </div>
            <div>
              <h1 className="font-display text-xl text-[#E8E6E1]">{scenario.title}</h1>
              <p className="font-mono text-[10px] text-[#FF4B1F] uppercase tracking-widest">
                {currentDecisionIndex < decisionPoints.length 
                  ? `Decision ${currentDecisionIndex + 1} of ${decisionPoints.length}` 
                  : 'Finalizing...'}
              </p>
            </div>
          </div>
          
          <button 
            onClick={onEnd}
            className="text-[10px] font-mono border border-[#1E1E22] bg-[#111113]/80 px-4 py-2 rounded-lg text-[#6B6B70] hover:text-[#E8E6E1] hover:border-[#6B6B70] transition-colors"
          >
            Skip to Debrief
          </button>
        </div>

        {/* DECISION OVERLAY */}
        {showOverlay && currentDecision && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md flex flex-col items-center justify-center z-20 p-6 fade-up">
            <div className="max-w-2xl w-full bg-[#111113] border border-[#FF4B1F50] rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FF4B1F] to-transparent animate-pulse" />
              
              <div className="text-center mb-10">
                <span className="inline-block px-3 py-1 rounded-full bg-[#FF4B1F15] text-[#FF4B1F] text-[10px] font-mono uppercase tracking-[0.2em] mb-4 border border-[#FF4B1F30]">
                  Critical Action Required
                </span>
                <h2 className="font-display text-2xl md:text-4xl text-[#E8E6E1] leading-tight">
                  {currentDecision.prompt}
                </h2>
              </div>

              <div className="relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="What is your immediate response?"
                  rows={3}
                  className="w-full bg-[#0A0A0B] border border-[#1E1E22] rounded-2xl p-5 text-[#E8E6E1] text-lg focus:border-[#FF4B1F] outline-none transition-colors resize-none placeholder:text-[#3A3A3F]"
                />
                
                <div className="flex justify-between items-center mt-6">
                  <p className="text-[10px] font-mono text-[#6B6B70] uppercase tracking-widest hidden sm:block">
                    Press Enter to submit
                  </p>
                  <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="px-8 py-3 bg-[#FF4B1F] text-white rounded-xl font-mono text-sm uppercase tracking-widest hover:brightness-110 disabled:opacity-50 transition-all ml-auto"
                  >
                    Commit Action
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM HALF: CHAT PANEL */}
      <div className="flex-1 flex flex-col relative min-h-0 bg-[#0A0A0B] border-t border-[#1E1E22]">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto px-4 md:px-12 pt-8 pb-6 relative z-10 scroll-smooth">
          <div className="max-w-4xl mx-auto">
            {messages.length === 0 && !showOverlay && isPlaying && (
              <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
                <div className="w-12 h-12 rounded-full border border-[#1E1E22] flex items-center justify-center mb-4">
                  <span className="w-2 h-2 bg-[#FF4B1F] rounded-full animate-pulse" />
                </div>
                <p className="font-mono text-xs uppercase tracking-widest text-[#6B6B70]">Monitoring Situation...</p>
              </div>
            )}

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

        {/* Follow-up Input Area (Only visible when chat is active) */}
        {isChatting && (
          <div className="px-4 md:px-12 py-4 bg-[#111113] border-t border-[#1E1E22] relative z-20">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-4 items-center">
              
              <div className="flex-1 w-full relative flex items-center bg-[#0A0A0B] border border-[#1E1E22] rounded-2xl px-4 py-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type follow-up response..."
                  disabled={isTyping}
                  className="flex-1 bg-transparent border-none outline-none text-[#E8E6E1] placeholder:text-[#3A3A3F]"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all disabled:opacity-50"
                  style={{ background: input.trim() ? '#FF4B1F' : 'transparent' }}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke={input.trim() ? '#fff' : '#6B6B70'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              </div>

              <button
                onClick={handleContinue}
                disabled={isTyping}
                className="w-full md:w-auto px-6 py-4 bg-[#1E1E22] hover:bg-[#FF4B1F] text-[#E8E6E1] hover:text-white rounded-2xl font-mono text-[10px] uppercase tracking-widest transition-all whitespace-nowrap flex items-center justify-center gap-2"
              >
                Resume Video
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
