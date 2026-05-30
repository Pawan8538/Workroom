// ─────────────────────────────────────────────────────────────
// client/src/components/UI/FourthWall.jsx
// THE FOURTH WALL BREAK — "The Simulation Speaks to the User"
// ─────────────────────────────────────────────────────────────
//
// This overlay descends after all tasks complete. The office
// goes dark. Text appears line by line — slowly, deliberately.
// The spacing is designed to create discomfort. You read the
// first line and wait. The silence is the point.
//
// After the final line, a single button materializes:
// "CHAPTER II →" — which triggers the Architect emergence
// sequence inside the existing office scene via the
// onArchitectSummon callback. No navigation occurs.
//
// The timing is:
//   0.0s  — Overlay fades in (pure black)
//   3.0s  — "THE SIMULATION ALWAYS KNEW YOU WERE HERE."
//   7.0s  — "EVERY DETAIL YOU NOTICED"
//  11.0s  — "WAS PLACED FOR YOU."
//  16.0s  — "SOMEONE BUILT ALL OF THIS."
//  25.0s  — "HE IS STILL WAITING FOR HIS CHANCE."
//  30.0s  — CHAPTER II button fades in
//
// ─────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef } from 'react';

// ── The lines and their reveal delays (in milliseconds) ──
const LINES = [
  { text: 'THE SIMULATION ALWAYS KNEW YOU WERE HERE.', delay: 3000 },
  { text: 'EVERY DETAIL YOU NOTICED', delay: 7000 },
  { text: 'WAS PLACED FOR YOU.', delay: 11000 },
  { text: 'SOMEONE BUILT ALL OF THIS.', delay: 16000 },
  { text: 'HE IS STILL WAITING FOR HIS CHANCE.', delay: 25000 },
];

const BUTTON_DELAY = 30000;

const FourthWall = ({ onArchitectSummon }) => {
  // ── Track which lines have been revealed ──
  const [visibleLines, setVisibleLines] = useState([]);
  const [showButton, setShowButton] = useState(false);
  const [overlayOpacity, setOverlayOpacity] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const timersRef = useRef([]);

  useEffect(() => {
    // Log reaching fourth wall to Doorkeeper
    window.__doorkeeper?.logFourthWall();

    // ── Fade in the overlay ──
    // Slight delay before darkness descends — feels organic
    const fadeTimer = setTimeout(() => setOverlayOpacity(1), 100);
    timersRef.current.push(fadeTimer);

    // ── Schedule each line to appear ──
    LINES.forEach((line, index) => {
      const timer = setTimeout(() => {
        setVisibleLines((prev) => [...prev, index]);
      }, line.delay);
      timersRef.current.push(timer);
    });

    // ── Schedule the button ──
    const buttonTimer = setTimeout(() => {
      setShowButton(true);
    }, BUTTON_DELAY);
    timersRef.current.push(buttonTimer);

    // ── Cleanup all timers on unmount ──
    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  // ── Trigger the Architect emergence sequence ──
  // No navigation — stays in the same scene
  const handleArchitectSummon = () => {
    setTransitioning(true);
    // Fade the fourth wall overlay out, then notify parent
    setOverlayOpacity(0);
    setTimeout(() => {
      if (onArchitectSummon) {
        onArchitectSummon();
      }
    }, 1500);
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
      zIndex: 200,
      opacity: overlayOpacity,
      transition: 'opacity 2s ease-in',
      cursor: 'default',
      userSelect: 'none',
    }}>

      {/* ── The lines ──────────────────────────────────── */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '28px',
        maxWidth: '600px',
        textAlign: 'center',
      }}>
        {LINES.map((line, index) => {
          const isVisible = visibleLines.includes(index);
          const isLastLine = index === LINES.length - 1;

          return (
            <p key={index} style={{
              // ── Each line fades and slides up ──
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(12px)',
              transition: 'opacity 1.5s ease-out, transform 1.5s ease-out',

              // ── Typography ──
              color: isLastLine ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.85)',
              fontSize: '1.1rem',
              fontFamily: 'monospace',
              fontWeight: 300,
              letterSpacing: '3px',
              lineHeight: '1.8',
              margin: 0,
              marginTop: isLastLine ? '24px' : 0,
            }}>
              {line.text}
            </p>
          );
        })}
      </div>

      {/* ── CHAPTER II Button ──────────────────────────── */}
      {/* Appears 30 seconds in. Triggers the Architect, not navigation. */}
      <button
        onClick={handleArchitectSummon}
        disabled={transitioning}
        style={{
          // ── Fade in ──
          opacity: showButton ? 1 : 0,
          transform: showButton ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 2s ease-out 0.5s, transform 2s ease-out 0.5s',
          pointerEvents: showButton ? 'auto' : 'none',

          // ── Styling ──
          marginTop: '80px',
          padding: '14px 40px',
          background: 'transparent',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '0.85rem',
          fontFamily: 'monospace',
          letterSpacing: '3px',
          cursor: transitioning ? 'default' : 'pointer',
        }}
        onMouseEnter={(e) => {
          if (!transitioning) {
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.4)';
            e.target.style.color = 'rgba(255, 255, 255, 0.9)';
          }
        }}
        onMouseLeave={(e) => {
          e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
          e.target.style.color = 'rgba(255, 255, 255, 0.6)';
        }}
      >
        {transitioning ? '...' : 'CHAPTER II →'}
      </button>

      {/* ── Ambient scan line effect ────────────────────── */}
      {/* A faint horizontal line that drifts down the screen */}
      {/* once, slowly — like a CRT monitor dying.            */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '2px',
        background: 'rgba(255, 255, 255, 0.03)',
        animation: 'scanDrift 8s linear forwards',
        pointerEvents: 'none',
      }} />

      <style>{`
        @keyframes scanDrift {
          0% { transform: translateY(0); }
          100% { transform: translateY(100vh); }
        }
      `}</style>
    </div>
  );
};

export default FourthWall;
