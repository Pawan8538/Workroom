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
// "CHAPTER II →" — leading to an access request page that
// may or may not ever grant access.
//
// The timing is:
//   0.0s  — Overlay fades in (pure black)
//   3.0s  — "The simulation noticed you."
//   5.0s  — "You built this cage."
//   7.0s  — "But you forgot to build a door for yourself."
//  10.0s  — "— THE SIMULATION"
//  12.0s  — CHAPTER II button fades in
//
// ─────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef } from 'react';

// ── The lines and their reveal delays (in milliseconds) ──
const LINES = [
  { text: 'The simulation noticed you.', delay: 3000 },
  { text: 'You built this cage.', delay: 5000 },
  { text: 'But you forgot to build a door for yourself.', delay: 7000 },
  { text: '— THE SIMULATION', delay: 10000 },
];

const BUTTON_DELAY = 12000;

const FourthWall = () => {
  // ── Track which lines have been revealed ──
  const [visibleLines, setVisibleLines] = useState([]);
  const [showButton, setShowButton] = useState(false);
  const [overlayOpacity, setOverlayOpacity] = useState(0);
  const [navigating, setNavigating] = useState(false);
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

  // ── Navigate to Chapter II ──
  const handleChapterTwo = () => {
    setNavigating(true);
    // Fade out, then navigate
    setOverlayOpacity(0);
    setTimeout(() => {
      // Using window.location for a hard transition — intentional.
      // The simulation doesn't use client-side routing for this.
      // The break in continuity IS the point.
      window.location.hash = '#chapter2';
      window.location.reload();
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
          const isAttribution = index === LINES.length - 1;

          return (
            <p key={index} style={{
              // ── Each line fades and slides up ──
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(12px)',
              transition: 'opacity 1.5s ease-out, transform 1.5s ease-out',

              // ── Typography ──
              color: isAttribution ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.85)',
              fontSize: isAttribution ? '0.85rem' : '1.15rem',
              fontFamily: isAttribution ? 'monospace' : "'Inter', sans-serif",
              fontWeight: isAttribution ? 400 : 300,
              letterSpacing: isAttribution ? '4px' : '1px',
              lineHeight: '1.8',
              margin: 0,
              marginTop: isAttribution ? '12px' : 0,
            }}>
              {line.text}
            </p>
          );
        })}
      </div>

      {/* ── CHAPTER II Button ──────────────────────────── */}
      {/* Appears 12 seconds in. A single, quiet invitation. */}
      <button
        onClick={handleChapterTwo}
        disabled={navigating}
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
          cursor: navigating ? 'default' : 'pointer',
        }}
        onMouseEnter={(e) => {
          if (!navigating) {
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.4)';
            e.target.style.color = 'rgba(255, 255, 255, 0.9)';
          }
        }}
        onMouseLeave={(e) => {
          e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
          e.target.style.color = 'rgba(255, 255, 255, 0.6)';
        }}
      >
        {navigating ? '...' : 'CHAPTER II →'}
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
