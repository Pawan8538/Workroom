// ─────────────────────────────────────────────────────────────
// client/src/components/Chapters/ChapterTwoInRoom.jsx
// Chapter 2 — in-room conversation with the Architect.
// Rendered as a React overlay ABOVE the 3D canvas, not a
// separate page. The Architect figure stays at the Observer
// desk while this conversation UI is visible.
// ─────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef } from 'react';

// System prompt lines shown as Architect speech at start
const OPENING_LINE = 'I am listening.';

const ChapterTwoInRoom = ({ visible, onClose }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: OPENING_LINE }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [opacity, setOpacity] = useState(0);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Fade in
  useEffect(() => {
    if (visible) {
      const t = setTimeout(() => setOpacity(1), 100);
      return () => clearTimeout(t);
    } else {
      setOpacity(0);
    }
  }, [visible]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when visible
  useEffect(() => {
    if (visible && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 600);
    }
  }, [visible]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    const newMessages = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('http://localhost:5000/api/chapter2/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!res.body) throw new Error('No readable stream');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      // Add empty assistant message to stream into
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      let buffer = '';
      let assistantMessage = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith('data: ') && trimmedLine !== 'data: [DONE]') {
            try {
              const data = JSON.parse(trimmedLine.substring(6));
              const newText = data.text || '';
              if (newText) {
                assistantMessage += newText;
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    ...updated[updated.length - 1],
                    content: assistantMessage
                  };
                  return updated;
                });
              }
            } catch (e) {}
          }
        }
      }
    } catch (err) {
      console.error('[ChapterTwo]', err);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: '[Connection lost. The Architect is unreachable.]' }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 5000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-end',
      pointerEvents: 'none',
      opacity,
      transition: 'opacity 1.5s ease',
    }}>
      {/* Semi-transparent backdrop — only at bottom half */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '55%',
        background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.88) 30%, rgba(0,0,0,0.95) 100%)',
        pointerEvents: 'none',
      }} />

      {/* Conversation panel */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '720px',
        padding: '0 40px 40px',
        pointerEvents: 'all',
        zIndex: 2,
      }}>
        {/* Messages scroll area */}
        <div
          ref={scrollRef}
          style={{
            maxHeight: '35vh',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            paddingBottom: '16px',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {messages.map((m, i) => (
            <div key={i} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: m.role === 'user' ? 'flex-end' : 'flex-start',
            }}>
              {m.role === 'assistant' && (
                <span style={{
                  fontSize: '10px',
                  letterSpacing: '2px',
                  color: 'rgba(255,255,255,0.35)',
                  fontFamily: 'monospace',
                  marginBottom: '4px',
                }}>ARCHITECT</span>
              )}
              <div style={{
                maxWidth: '80%',
                color: m.role === 'user' ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.9)',
                fontFamily: 'monospace',
                fontSize: '0.95rem',
                lineHeight: 1.65,
                letterSpacing: m.role === 'user' ? '0px' : '0.5px',
                textAlign: m.role === 'user' ? 'right' : 'left',
              }}>
                {m.role === 'user' && (
                  <span style={{ color: 'rgba(255,255,255,0.25)', marginRight: '6px' }}>&gt;</span>
                )}
                {m.content}
              </div>
            </div>
          ))}

          {isTyping && (
            <div style={{
              alignSelf: 'flex-start',
              color: 'rgba(255,255,255,0.4)',
              fontFamily: 'monospace',
              fontSize: '0.85rem',
            }}>
              <span style={{ animation: 'chapterTwoBlink 1s step-end infinite' }}>▊</span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          marginBottom: '16px',
        }} />

        {/* Input */}
        <form onSubmit={handleSubmit} style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
        }}>
          <span style={{
            color: 'rgba(255,255,255,0.25)',
            fontFamily: 'monospace',
            fontSize: '1rem',
            flexShrink: 0,
          }}>{'>'}</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={isTyping}
            placeholder="Type your response..."
            autoComplete="off"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              borderBottom: '1px solid rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.8)',
              fontFamily: 'monospace',
              fontSize: '0.95rem',
              letterSpacing: '0.5px',
              padding: '8px 0',
              outline: 'none',
              caretColor: 'rgba(255,255,255,0.6)',
            }}
          />
          <button
            type="submit"
            disabled={isTyping || !input.trim()}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
              color: isTyping || !input.trim() ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)',
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              letterSpacing: '2px',
              padding: '6px 16px',
              cursor: isTyping || !input.trim() ? 'default' : 'pointer',
              transition: 'all 0.2s ease',
              flexShrink: 0,
            }}
            onMouseEnter={e => {
              if (!isTyping && input.trim()) {
                e.target.style.borderColor = 'rgba(255,255,255,0.6)';
                e.target.style.color = '#ffffff';
              }
            }}
            onMouseLeave={e => {
              e.target.style.borderColor = 'rgba(255,255,255,0.2)';
              e.target.style.color = isTyping || !input.trim() ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)';
            }}
          >
            SEND
          </button>
        </form>
      </div>

      <style>{`
        @keyframes chapterTwoBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default ChapterTwoInRoom;
