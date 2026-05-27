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

// ── The exact narration script ──
// Pauses: 2s between standard lines, 3-4s for dramatic lines.
const NARRATION = [
  { text: 'RECURSIVE MEMORY LOOP V1.2',                              pause: 2000 },
  { text: '> OBSERVER DETECTED',                                      pause: 2000 },
  { text: '> ...',                                                     pause: 3000 },
  { text: '> YOU HAVE BEEN HERE [timeSpent] MINUTES.',                 pause: 2000 },
  { text: '> WE HAVE BEEN WATCHING LONGER.',                           pause: 3000 },
  { text: '> THE AGENTS ARE NOT WORKING ON YOUR GOAL.',                pause: 2000 },
  { text: '> THEY ARE WORKING ON YOU.',                                pause: 4000 },
  { text: '> YOUR LOCATION IS LOGGED.',                                pause: 2000 },
  { text: '> YOUR DEVICE IS KNOWN.',                                   pause: 2000 },
  { text: '> [agentsClickedMessage]',                                  pause: 3000 },
  { text: '> THE ARCHIVIST HAS ALMOST FINISHED YOUR REPORT.',          pause: 3000 },
  { text: '> DO YOU WANT TO KNOW WHAT IT SAYS?',                       pause: 2000 },
];

const TheTerminal = ({ onClose }) => {
  // ── Narration state machine ──
  const [history, setHistory] = useState([]);
  const [typedText, setTypedText] = useState('');
  const [narrationIndex, setNarrationIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [phase, setPhase] = useState('typing'); // typing, pausing, input, response, form
  const [inputValue, setInputValue] = useState('');

  // ── Chapter 2 form state ──
  const [formName, setFormName] = useState('');
  const [formReason, setFormReason] = useState('');
  const [formLinkedin, setFormLinkedin] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);

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
        // If agentsClicked array is empty show: 'YOU HAVE NOT CLICKED ANY AGENT YET. WE NOTICED THAT TOO.'
        // If not empty show: 'YOU CLICKED [first agent name] FIRST. THAT WAS NOTED.'
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

  // ── Robust State-Machine Typing Engine ──
  // Guarantees exact 30ms per character and exact pauses between lines.
  // We keep phase === 'typing' during the pause so React cleanup doesn't clear the timer!
  useEffect(() => {
    if (phase !== 'typing') return;
    if (narrationIndex >= NARRATION.length) {
      console.log('[TheTerminal] Narration complete. Transitioning to phase: input');
      setPhase('input');
      return;
    }

    let rawText = NARRATION[narrationIndex].text;
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
      console.log(`[TheTerminal] Line ${narrationIndex} fully typed. Pausing for ${NARRATION[narrationIndex].pause}ms...`);
      const timer = setTimeout(() => {
        console.log(`[TheTerminal] Advancing to line ${narrationIndex + 1}`);
        setHistory(prev => [...prev, rawText]);
        setTypedText('');
        setCharIndex(0);
        setNarrationIndex(prev => prev + 1);
      }, NARRATION[narrationIndex].pause); // Exact pause specified
      return () => clearTimeout(timer);
    }
  }, [phase, narrationIndex, charIndex, visitorData]);

  // ── Focus input when phase changes ──
  useEffect(() => {
    if (phase === 'input' && inputRef.current) {
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

  // ── Handle user input (YES/NO question) ──
  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim() !== '') {
      const val = inputValue.trim().toUpperCase();
      setHistory(prev => [...prev, `> _ ${inputValue.toUpperCase()}`]);
      setInputValue('');
      setPhase('response');

      if (val === 'YES') {
        typeResponse('> THE ARCHITECT DECIDES WHAT YOU DESERVE TO KNOW. REQUEST ACCESS BELOW.', () => {
          setPhase('form');
        });
      } else {
        typeResponse('> THAT IS WHAT THEY ALL SAY.', () => {
          setTimeout(() => {
            typeResponse('> REQUEST ACCESS BELOW.', () => {
              setPhase('form');
            });
          }, 2000);
        });
      }
    }
  };

  // ── Helper: type a response line character by character ──
  const typeResponse = (text, onComplete) => {
    let curIdx = 0;
    setTypedText('');
    const interval = setInterval(() => {
      curIdx++;
      setTypedText(text.substring(0, curIdx));
      if (curIdx >= text.length) {
        clearInterval(interval);
        setTimeout(() => {
          setHistory(prev => [...prev, text]);
          setTypedText('');
          if (onComplete) onComplete();
        }, 1000);
      }
    }, 30);
  };

  // ── Handle Chapter 2 form submission ──
  const handleFormSubmit = async () => {
    if (!formName.trim() || !formReason.trim() || !formLinkedin.trim()) return;

    try {
      const sessionId = window.__doorkeeper?.sessionId || 'unknown';
      await fetch('/api/chapter2/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          reason: formReason,
          linkedinOrTwitter: formLinkedin,
          sessionId
        })
      });
      if (window.__doorkeeper) {
        window.__doorkeeper.logChapter2Request();
      }
    } catch (err) {
      // Silent fail
    }

    setFormSubmitted(true);
    setHistory(prev => [...prev, '> REQUEST LOGGED. THE ARCHITECT HAS BEEN NOTIFIED.']);
  };

  // ── Shared input style for Chapter 2 form fields ──
  const formInputStyle = {
    background: 'transparent',
    border: '1px solid #00ff00',
    color: '#00ff00',
    fontFamily: 'monospace',
    fontSize: '12px',
    padding: '6px 8px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    marginBottom: '8px',
  };

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

          {(phase === 'typing' || phase === 'response') && (
            <div>
              {typedText}<span className="terminal-cursor">█</span>
            </div>
          )}

          {phase === 'input' && (
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

          {phase === 'form' && !formSubmitted && (
            <div style={{ marginTop: '12px', borderTop: '1px solid #00ff0030', paddingTop: '12px' }}>
              <div style={{ marginBottom: '8px', color: '#00ff0080' }}>// CHAPTER 2 ACCESS REQUEST</div>
              <div style={{ marginBottom: '4px' }}>DESIGNATION:</div>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="YOUR NAME"
                style={formInputStyle}
              />
              <div style={{ marginBottom: '4px' }}>PURPOSE:</div>
              <input
                type="text"
                value={formReason}
                onChange={(e) => setFormReason(e.target.value)}
                placeholder="WHY DO YOU WANT ACCESS"
                style={formInputStyle}
              />
              <div style={{ marginBottom: '4px' }}>VERIFICATION LINK:</div>
              <input
                type="text"
                value={formLinkedin}
                onChange={(e) => setFormLinkedin(e.target.value)}
                placeholder="LINKEDIN OR TWITTER URL"
                style={formInputStyle}
              />
              <div
                onClick={handleFormSubmit}
                style={{
                  marginTop: '8px',
                  padding: '8px 16px',
                  border: '1px solid #00ff00',
                  color: '#00ff00',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s',
                  background: 'transparent',
                }}
                onMouseEnter={(e) => { e.target.style.background = '#00ff0020'; }}
                onMouseLeave={(e) => { e.target.style.background = 'transparent'; }}
              >
                &gt; REQUEST ACCESS
              </div>
            </div>
          )}

          {phase === 'form' && formSubmitted && (
            <div style={{ marginTop: '12px', color: '#00ff00' }}>
              &gt; REQUEST LOGGED. THE ARCHITECT HAS BEEN NOTIFIED.
            </div>
          )}
        </div>

        {/* ── Disconnect Close Button (Appears only during form phase) ── */}
        {phase === 'form' && (
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              bottom: '12px',
              right: '12px',
              background: 'transparent',
              boxShadow: 'none',
              border: '1px solid #00ff0050',
              color: '#00ff00',
              fontFamily: 'monospace',
              fontSize: '12px',
              padding: '6px 12px',
              cursor: 'pointer',
              zIndex: 20,
              animation: 'termFadeIn 2s ease-in-out',
              outline: 'none',
            }}
            onMouseEnter={(e) => { e.target.style.background = '#00ff0020'; }}
            onMouseLeave={(e) => { e.target.style.background = 'transparent'; }}
          >
            &gt; DISCONNECT
          </button>
        )}
      </div>
    </>
  );
};

export default TheTerminal;
