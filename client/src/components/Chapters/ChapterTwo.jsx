import React, { useState, useEffect, useRef } from 'react';

const ChapterTwo = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'You found the door. I am the Architect.' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const newMessages = [...messages, { role: 'user', content: input.trim() }];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('http://localhost:5000/api/chapter2/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages.map(m => ({ role: m.role, content: m.content })) })
      });

      if (!res.body) throw new Error('No readable stream');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunkStr = decoder.decode(value);
        const lines = chunkStr.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.substring(6));
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1].content += data.text;
                return updated;
              });
            } catch(e) {}
          }
        }
      }
    } catch(err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: '[Connection lost. Cannot reach the Architect.]' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#1a1208',
      color: '#f5f0e8',
      fontFamily: "'Courier New', Courier, monospace",
      position: 'absolute',
      top: 0, left: 0, zIndex: 300,
      boxSizing: 'border-box'
    }}>
      <div 
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '40px 20%',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}
      >
        {messages.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '60%',
            opacity: 0.9,
            lineHeight: 1.5,
            fontSize: '1rem',
          }}>
            {m.role === 'user' ? (
              <span style={{ color: 'rgba(245,240,232,0.5)' }}>&gt; </span>
            ) : null}
            {m.content}
          </div>
        ))}
        {isTyping && (
          <div style={{ alignSelf: 'flex-start', opacity: 0.5 }}>
            <span style={{ animation: 'blink 1s infinite' }}>▊</span>
          </div>
        )}
      </div>

      <div style={{ padding: '20px 20%', borderTop: '1px solid rgba(245,240,232,0.1)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={isTyping}
            placeholder="Type your response..."
            style={{
              flex: 1,
              background: 'transparent',
              border: '1px solid rgba(245,240,232,0.2)',
              color: '#f5f0e8',
              padding: '15px',
              fontFamily: 'inherit',
              fontSize: '1rem',
              outline: 'none'
            }}
          />
          <button 
            type="submit" 
            disabled={isTyping || !input.trim()}
            style={{
              background: 'rgba(245,240,232,0.1)',
              border: '1px solid rgba(245,240,232,0.3)',
              color: '#f5f0e8',
              padding: '0 30px',
              cursor: isTyping || !input.trim() ? 'default' : 'pointer',
              fontFamily: 'inherit',
              transition: 'background 0.2s'
            }}
          >
            SEND
          </button>
        </form>
      </div>
      <style>{`
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
      `}</style>
    </div>
  );
};

export default ChapterTwo;
