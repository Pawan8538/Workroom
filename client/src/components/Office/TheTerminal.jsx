// ─────────────────────────────────────────────────────────────
// client/src/components/Office/TheTerminal.jsx
// Hidden Narrative Node — The Observer's Terminal
// ─────────────────────────────────────────────────────────────
// Pure React overlay component. No Three.js, no drei, no portal.
// Renders as a position:fixed div directly in the React tree.
// Small centered popup (600x400), green CRT aesthetic.
// Fetches real visitor data from Doorkeeper.
// Character-by-character typing engine via robust state machine.
// Chapter 2 access form appears inside terminal after narration.
// ─────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef } from 'react';
import { NARRATION, NARRATION_YES, NARRATION_NO, NARRATION_CONTINUATION } from '../../constants/TERMINAL_SCRIPT.js';

const TheTerminal = ({ onClose }) => {
  // ── Narration state machine ──
  const [currentScript, setCurrentScript] = useState(NARRATION);
  const [history, setHistory] = useState([]);
  const [typedText, setTypedText] = useState('');
  const [narrationIndex, setNarrationIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [phase, setPhase] = useState('typing'); // typing, input, form
  const [inputValue, setInputValue] = useState('');

  // ── Chapter 2 form state removed ──

  // ── Visitor data from Doorkeeper ──
  const [visitorData, setVisitorData] = useState({ 
    timeSpent: '??', 
    agentsClickedMessage: 'YOU HAVE NOT CLICKED ANY AGENT YET. WE NOTICED THAT TOO.' 
  });

  // ── Glitch effect state ──
  const [glitchLine, setGlitchLine] = useState(-1);

  // ── Refs ──
  const inputRef = useRef();
  const scrollRef = useRef();

  // ── Fetch real visitor data on mount ──
  useEffect(() => {
    try {
      const dk = window.__doorkeeper;
      if (dk) {
        const timeSpent = Math.floor((Date.now() - dk.startTime) / 60000);
        const msg = dk.agentsClicked.size > 0
          ? `YOU CLICKED ${Array.from(dk.agentsClicked)[0].toUpperCase()} FIRST. THAT WAS NOTED.`
          : 'YOU HAVE NOT CLICKED ANY AGENT YET. WE NOTICED THAT TOO.';
        setVisitorData({ timeSpent: timeSpent || '<1', agentsClickedMessage: msg });
      }
    } catch (err) {
      // Silent fail — use defaults
    }
  }, []);

  // ── Close via ESC ──
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // ── Typing Engine State-Machine ──
  useEffect(() => {
    if (phase !== 'typing') return;
    if (narrationIndex >= currentScript.length) return;

    const currentItem = currentScript[narrationIndex];

    if (currentItem.type === 'input') {
      setPhase('input');
      return;
    }

    if (currentItem.type === 'input_final') {
      setPhase('input_final');
      return;
    }

    if (currentItem.type === 'end') {
      setTimeout(() => {
        onClose();
      }, 1000);
      return;
    }

    if (currentItem.type === 'line') {
      let rawText = currentItem.text;
      rawText = rawText.replace('[timeSpent]', visitorData.timeSpent);
      rawText = rawText.replace('[agentsClickedMessage]', visitorData.agentsClickedMessage);

      if (charIndex < rawText.length) {
        const timer = setTimeout(() => {
          setTypedText(rawText.substring(0, charIndex + 1));
          setCharIndex(prev => prev + 1);
        }, 30); // Exactly 30ms per character
        return () => clearTimeout(timer);
      } else {
        // Line fully typed. Pause before advancing to next line.
        const timer = setTimeout(() => {
          setHistory(prev => [...prev, rawText]);
          setTypedText('');
          setCharIndex(0);
          setNarrationIndex(prev => prev + 1);
        }, currentItem.pause);
        return () => clearTimeout(timer);
      }
    }
  }, [phase, currentScript, narrationIndex, charIndex, visitorData]);

  useEffect(() => {
    if ((phase === 'input' || phase === 'input_final') && inputRef.current) {
      inputRef.current.focus();
    }
  }, [phase]);

  // ── Auto-scroll terminal content ──
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, typedText, phase]);

  // ── Glitch effect — every 3-4 seconds one line flickers ──
  useEffect(() => {
    const interval = setInterval(() => {
      if (history.length > 0) {
        const randomIdx = Math.floor(Math.random() * history.length);
        setGlitchLine(randomIdx);
        setTimeout(() => setGlitchLine(-1), 200);
      }
    }, 3000 + Math.random() * 1000);
    return () => clearInterval(interval);
  }, [history.length]);

  // ── Handle user input (YES/NO question and subsequent questions) ──
  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim() !== '') {
      const val = inputValue.trim().toUpperCase();
      setHistory(prev => [...prev, `> _ ${inputValue.toUpperCase()}`]);
      setInputValue('');

      if (phase === 'input_final') {
        // Send answer to admin panel silently
        fetch('/api/goal', { // Just sending it as a goal for now or we can use doorkeeper
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ goal: `[TERMINAL ANSWER] ${val}` })
        }).catch(() => {});
        
        setNarrationIndex(prev => prev + 1);
        setCharIndex(0);
        setPhase('typing');
      } else if (currentScript === NARRATION) {
        if (val === 'YES') {
          setCurrentScript([...NARRATION_YES, ...NARRATION_CONTINUATION]);
        } else {
          setCurrentScript([...NARRATION_NO, ...NARRATION_CONTINUATION]);
        }
        setNarrationIndex(0);
        setCharIndex(0);
        setPhase('typing');
      }
    }
  };

  // ── Chapter 2 form submission removed ──

  return (
    <>
      {/* ── Terminal CSS Animations ── */}
      <style>{`
        @keyframes terminalScan {
          0%   { top: -2px; }
          100% { top: 100%; }
        }
        .terminal-cursor {
          animation: termBlink 1s step-end infinite;
        }
        @keyframes termBlink {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0; }
        }
        @keyframes termFadeIn {
          0%   { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>

      {/* ── Terminal Window ── */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '580px',
        height: '380px',
        background: '#000000',
        border: '2px solid #00ff00',
        borderRadius: '4px',
        zIndex: 9999,
        boxShadow: '0 0 30px #00ff0040',
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#00ff00',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>

        {/* ── Title Bar ── */}
        <div style={{
          background: '#0a0a0a',
          padding: '6px 12px',
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid #00ff0040',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', gap: '4px', marginRight: '12px' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#333' }} />
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#333' }} />
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#333' }} />
          </div>
          <span style={{ flex: 1, textAlign: 'center', color: '#00ff0080', fontSize: '10px', letterSpacing: '2px' }}>
            TERMINAL_03
          </span>
        </div>

        {/* ── Static Noise Overlay ── */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22 opacity=%220.03%22/%3E%3C/svg%3E")',
          pointerEvents: 'none', zIndex: 5, mixBlendMode: 'screen',
        }} />

        {/* ── Horizontal Scan Line ── */}
        <div style={{
          position: 'absolute', left: 0, width: '100%', height: '2px',
          background: 'rgba(0, 255, 0, 0.08)',
          animation: 'terminalScan 8s linear infinite',
          pointerEvents: 'none', zIndex: 6,
        }} />

        {/* ── Terminal Content ── */}
        <div ref={scrollRef} style={{
          flex: 1, overflow: 'auto', padding: '12px 12px 48px 12px',
          position: 'relative', zIndex: 10,
          lineHeight: '1.6',
        }}>
          {history.map((line, i) => (
            <div key={i} style={{
              marginBottom: '2px',
              transform: glitchLine === i ? 'translateX(2px)' : 'none',
              opacity: glitchLine === i ? 0.6 : 1,
              transition: 'transform 0.1s, opacity 0.1s',
            }}>
              {line}
            </div>
          ))}

          {(phase === 'typing') && (
            <div>
              {typedText}<span className="terminal-cursor">█</span>
            </div>
          )}

          {(phase === 'input' || phase === 'input_final') && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span>&gt; _&nbsp;</span>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleInputKeyDown}
                spellCheck="false"
                autoFocus
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#00ff00',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  outline: 'none',
                  width: '100%',
                  textTransform: 'uppercase',
                }}
              />
            </div>
          )}

        {/* Form elements removed */}
        </div>
      </div>
    </>
  );
};

export default TheTerminal;
