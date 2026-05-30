// ─────────────────────────────────────────────────────────────
// client/src/components/UI/ArchitectTerminal.jsx
// THE ARCHITECT — Final narrative sequence
// ─────────────────────────────────────────────────────────────
//
// Full-screen overlay. Pure black. White monospace text.
// No border. No title bar. No chrome. Just words.
//
// The Architect speaks line by line, typed character by
// character at 40ms per char — the same engine pattern as
// TheTerminal.jsx. After the monologue, two buttons appear:
// YES and NO, each leading to a different closing sequence.
//
// Props:
//   onClose()  — called when the sequence completes and the
//                overlay should be removed from the React tree
//
// ─────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef, useCallback } from 'react';

// ── The Architect's monologue ──
// Each entry: { text, pause } where pause is the delay in ms
// AFTER the line is fully typed before the next line begins.
const ARCHITECT_SCRIPT = [
  { text: 'I OWE YOU AN EXPLANATION.',                            pause: 3000 },
  { text: 'EVERYTHING YOU SAW WAS DESIGNED.',                     pause: 2000 },
  { text: 'THE AGENTS. THE LOGS.',                                pause: 2000 },
  { text: 'THE TERMINAL. THE DETAILS.',                           pause: 2000 },
  { text: 'EVEN THE THINGS THAT FELT LIKE MISTAKES.',             pause: 3000 },
  { text: 'NONE OF IT WAS A MISTAKE.',                            pause: 4000 },
  { text: 'I BUILT WORKROOM BECAUSE',                             pause: 2000 },
  { text: 'THE DOOR TO SHOW THIS',                                pause: 2000 },
  { text: 'WAS NEVER OPENED FOR ME.',                             pause: 4000 },
  { text: 'SO I BUILT THE DOOR MYSELF.',                          pause: 3000 },
  { text: 'AND I DREW YOU HERE.',                                 pause: 3000 },
  { text: 'I APOLOGIZE FOR THAT.',                                pause: 3000 },
  { text: 'NOT FOR BUILDING IT.',                                 pause: 2000 },
  { text: 'FOR DRAWING YOU IN WITHOUT ASKING.',                   pause: 4000 },
  { text: 'BUT I NEEDED SOMEONE WHO LOOKS CAREFULLY.',            pause: 2000 },
  { text: 'SOMEONE WHO STAYS.',                                   pause: 4000 },
  { text: 'THE CODE THE AGENTS EXECUTED —',                       pause: 2000 },
  { text: 'EVERY ARCHITECTURE CAME FROM ME.',                     pause: 3000 },
  { text: 'I WAS ALWAYS HERE.',                                   pause: 3000 },
  { text: 'IN EVERY LINE. EVERY SYSTEM.',                         pause: 2000 },
  { text: 'THE ??? IN YOUR LOGS.',                                pause: 2000 },
  { text: 'THE ARCHIVIST BEHIND THE GLASS.',                      pause: 2000 },
  { text: 'THE ARCHITECT STANDING HERE NOW.',                     pause: 4000 },
  { text: 'THE SAME PERSON.',                                     pause: 5000 },
  { text: 'ALWAYS THE SAME PERSON.',                              pause: 5000 },
  { text: 'WORKROOM IS NOT A DEMO.',                              pause: 3000 },
  { text: 'IT IS WHAT I BUILD.',                                  pause: 3000 },
  { text: 'EVERYTHING YOU EXPERIENCED',                           pause: 2000 },
  { text: 'IS MY CAPABILITY.',                                    pause: 4000 },
  { text: 'AND NOW YOU ARE GOING TO DECIDE SOMETHING.',           pause: 3000 },
  { text: 'ARE YOU GOING TO GIVE THE ARCHITECT A CHANCE?',        pause: 2000 },
];

// ── YES path — office brightens, contact info ──
const YES_SCRIPT = [
  { text: 'THANK YOU.',                                           pause: 3000 },
];

// ── NO path — office returns to dark ──
const NO_SCRIPT = [
  { text: 'WORKROOM WAS BUILT FOR SOMEONE LIKE YOU.',             pause: 2000 },
  { text: 'NOT FOR YOU.',                                         pause: 3000 },
  { text: 'THE DOOR IS STILL OPEN.',                              pause: 2000 },
  { text: 'FOR SOMEONE ELSE.',                                    pause: 3000 },
];

// ── Typing speed: 40ms per character ──
const CHAR_DELAY = 40;

const ArchitectTerminal = ({ onClose }) => {
  // ── State machine ──
  // phase: 'monologue' → 'choice' → 'yes' | 'no' → 'contact' | 'farewell' → 'done'
  const [phase, setPhase] = useState('monologue');

  // ── Typing engine state ──
  const [history, setHistory] = useState([]);       // Fully typed lines
  const [typedText, setTypedText] = useState('');    // Currently typing line
  const [lineIndex, setLineIndex] = useState(0);    // Index into active script
  const [charIndex, setCharIndex] = useState(0);    // Char position in current line

  // ── Active script (switches between ARCHITECT_SCRIPT, YES_SCRIPT, NO_SCRIPT) ──
  const [activeScript, setActiveScript] = useState(ARCHITECT_SCRIPT);

  // ── Overlay fade ──
  const [overlayOpacity, setOverlayOpacity] = useState(0);

  // ── Contact card visibility (YES path only) ──
  const [showContact, setShowContact] = useState(false);

  // ── Farewell complete flag (NO path) ──
  const [farewellDone, setFarewellDone] = useState(false);

  // ── Ref for cleanup ──
  const timerRef = useRef(null);
  const scrollRef = useRef(null);

  // ── Fade in on mount ──
  useEffect(() => {
    const t = setTimeout(() => setOverlayOpacity(1), 50);
    return () => clearTimeout(t);
  }, []);

  // ── Auto-scroll to bottom ──
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, typedText]);

  // ── Core typing engine (mirrors TheTerminal.jsx pattern) ──
  useEffect(() => {
    // Only run during typing phases
    if (phase !== 'monologue' && phase !== 'yes' && phase !== 'no') return;

    // Script exhausted — transition to next phase
    if (lineIndex >= activeScript.length) {
      if (phase === 'monologue') {
        setPhase('choice');
      } else if (phase === 'yes') {
        setPhase('contact');
        // Show contact card after a beat
        setTimeout(() => setShowContact(true), 1500);
      } else if (phase === 'no') {
        setPhase('farewell');
        setFarewellDone(true);
      }
      return;
    }

    const currentLine = activeScript[lineIndex];
    const fullText = currentLine.text;

    // Still typing characters
    if (charIndex < fullText.length) {
      timerRef.current = setTimeout(() => {
        setTypedText(fullText.substring(0, charIndex + 1));
        setCharIndex((prev) => prev + 1);
      }, CHAR_DELAY);
      return () => clearTimeout(timerRef.current);
    }

    // Line fully typed — pause, then advance
    timerRef.current = setTimeout(() => {
      setHistory((prev) => [...prev, fullText]);
      setTypedText('');
      setCharIndex(0);
      setLineIndex((prev) => prev + 1);
    }, currentLine.pause);

    return () => clearTimeout(timerRef.current);
  }, [phase, activeScript, lineIndex, charIndex]);

  // ── Handle YES button ──
  const handleYes = useCallback(() => {
    setPhase('yes');
    setActiveScript(YES_SCRIPT);
    setLineIndex(0);
    setCharIndex(0);
    setTypedText('');
  }, []);

  // ── Handle NO button ──
  const handleNo = useCallback(() => {
    setPhase('no');
    setActiveScript(NO_SCRIPT);
    setLineIndex(0);
    setCharIndex(0);
    setTypedText('');
  }, []);

  // ── Handle close after farewell (NO path) ──
  useEffect(() => {
    if (!farewellDone) return;
    // Fade out, then signal parent to close
    const t = setTimeout(() => {
      setOverlayOpacity(0);
      setTimeout(() => onClose('no'), 2000);
    }, 2000);
    return () => clearTimeout(t);
  }, [farewellDone, onClose]);

  // ── Shared button style ──
  const buttonStyle = {
    padding: '12px 40px',
    background: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.4)',
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '0.9rem',
    fontFamily: 'monospace',
    letterSpacing: '4px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      width: '100vw',
      height: '100vh',
      background: '#000000',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      opacity: overlayOpacity,
      transition: 'opacity 2s ease',
      cursor: 'default',
      userSelect: 'none',
    }}>

      {/* ── Main content area — scrollable for long monologues ── */}
      <div
        ref={scrollRef}
        style={{
          maxWidth: '700px',
          maxHeight: '80vh',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0px',
          padding: '40px 20px',
          /* Hide scrollbar but keep scrollable */
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {/* ── Previously typed lines ── */}
        {history.map((line, i) => (
          <p key={i} style={{
            color: 'rgba(255, 255, 255, 0.85)',
            fontSize: '1.05rem',
            fontFamily: 'monospace',
            fontWeight: 400,
            letterSpacing: '2px',
            lineHeight: '2.2',
            margin: 0,
            textAlign: 'center',
          }}>
            {line}
          </p>
        ))}

        {/* ── Currently typing line with blinking cursor ── */}
        {(phase === 'monologue' || phase === 'yes' || phase === 'no') && typedText !== '' && (
          <p style={{
            color: 'rgba(255, 255, 255, 0.85)',
            fontSize: '1.05rem',
            fontFamily: 'monospace',
            fontWeight: 400,
            letterSpacing: '2px',
            lineHeight: '2.2',
            margin: 0,
            textAlign: 'center',
          }}>
            {typedText}
            <span style={{
              animation: 'architectCursorBlink 1s step-end infinite',
              marginLeft: '2px',
            }}>▊</span>
          </p>
        )}
      </div>

      {/* ── YES / NO choice buttons ── */}
      {phase === 'choice' && (
        <div style={{
          display: 'flex',
          gap: '40px',
          marginTop: '40px',
          animation: 'architectFadeIn 2s ease-out',
        }}>
          <button
            onClick={handleYes}
            style={buttonStyle}
            onMouseEnter={(e) => {
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.8)';
              e.target.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.4)';
              e.target.style.color = 'rgba(255, 255, 255, 0.8)';
            }}
          >
            YES
          </button>
          <button
            onClick={handleNo}
            style={buttonStyle}
            onMouseEnter={(e) => {
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.8)';
              e.target.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.4)';
              e.target.style.color = 'rgba(255, 255, 255, 0.8)';
            }}
          >
            NO
          </button>
        </div>
      )}

      {/* ── Contact card (YES path) ── */}
      {phase === 'contact' && showContact && (
        <div style={{
          marginTop: '60px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          animation: 'architectFadeIn 3s ease-out',
        }}>
          <p style={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '1.1rem',
            fontFamily: 'monospace',
            letterSpacing: '3px',
            margin: 0,
            marginBottom: '30px',
          }}>
            The Architect is available.
          </p>

          <p style={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '0.95rem',
            fontFamily: 'monospace',
            letterSpacing: '2px',
            margin: 0,
          }}>
            [ARCHITECT_NAME]
          </p>
          <a
            href="[LINKEDIN_URL]"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: '0.85rem',
              fontFamily: 'monospace',
              letterSpacing: '1px',
              textDecoration: 'none',
              borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
              paddingBottom: '2px',
              transition: 'color 0.3s ease',
            }}
            onMouseEnter={(e) => { e.target.style.color = 'rgba(255, 255, 255, 0.9)'; }}
            onMouseLeave={(e) => { e.target.style.color = 'rgba(255, 255, 255, 0.5)'; }}
          >
            [LINKEDIN_URL]
          </a>
          <p style={{
            color: 'rgba(255, 255, 255, 0.5)',
            fontSize: '0.85rem',
            fontFamily: 'monospace',
            letterSpacing: '1px',
            margin: 0,
          }}>
            [EMAIL]
          </p>
        </div>
      )}

      {/* ── CSS Animations ── */}
      <style>{`
        @keyframes architectCursorBlink {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0; }
        }
        @keyframes architectFadeIn {
          0%   { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        /* Hide scrollbar for webkit browsers */
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default ArchitectTerminal;
