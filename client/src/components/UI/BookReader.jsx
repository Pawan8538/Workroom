import React, { useState } from 'react';
import { BOOK_PAGES } from '../../constants/BOOK_SCRIPT';

export default function BookReader({ onClose }) {
  const [spreadIndex, setSpreadIndex] = useState(0);
  const [turning, setTurning] = useState(false);

  const canPrev = spreadIndex > 0;
  const canNext = spreadIndex < BOOK_PAGES.length - 1;
  const spread = BOOK_PAGES[spreadIndex];

  const turn = (dir) => {
    if (turning) return;
    setTurning(true);
    setTimeout(() => {
      setSpreadIndex((i) => i + dir);
      setTurning(false);
    }, 280);
  };

  const leftPage = spreadIndex * 2 + 1;
  const rightPage = spreadIndex * 2 + 2;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'radial-gradient(ellipse at 50% 40%, rgba(20,14,5,0.92) 0%, rgba(0,0,0,0.97) 100%)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
        }}
      >
        {/* Book spread */}
        <div style={{
          display: 'flex',
          boxShadow: '0 30px 80px rgba(0,0,0,0.9), 0 0 0 1px rgba(101,75,36,0.4)',
          opacity: turning ? 0.7 : 1,
          transform: turning ? 'scale(0.99)' : 'scale(1)',
          transition: 'opacity 0.28s ease, transform 0.28s ease',
        }}>
          {/* LEFT PAGE */}
          <div style={{
            width: '320px',
            minHeight: '420px',
            background: 'linear-gradient(98deg, #faf6ec 0%, #f4ede0 100%)',
            borderRight: '2px solid rgba(101,75,36,0.3)',
            padding: '44px 36px 50px 44px',
            position: 'relative',
            boxShadow: 'inset -6px 0 20px rgba(0,0,0,0.08)',
            borderRadius: '3px 0 0 3px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(101,75,36,0.2)' }} />
              <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'rgba(101,75,36,0.3)' }} />
              <div style={{ flex: 1, height: '1px', background: 'rgba(101,75,36,0.2)' }} />
            </div>
            {spread.left.title && (
              <div style={{ fontSize: '11px', letterSpacing: '3px', color: 'rgba(101,75,36,0.7)', textTransform: 'uppercase', fontFamily: 'Georgia, serif', marginBottom: '18px' }}>
                {spread.left.title}
              </div>
            )}
            <p style={{ margin: 0, fontSize: '13.5px', lineHeight: '2.1', color: '#2a1f14', fontFamily: 'Georgia, serif', whiteSpace: 'pre-line', letterSpacing: '0.2px' }}>
              {spread.left.body}
            </p>
            <div style={{ position: 'absolute', bottom: '22px', left: 0, right: 0, textAlign: 'center', fontSize: '10px', color: 'rgba(101,75,36,0.4)', fontFamily: 'Georgia, serif', letterSpacing: '2px' }}>
              — {leftPage} —
            </div>
          </div>

          {/* Spine shadow */}
          <div style={{ width: '12px', background: 'linear-gradient(90deg, rgba(0,0,0,0.18), rgba(0,0,0,0.06), rgba(0,0,0,0.18))', flexShrink: 0 }} />

          {/* RIGHT PAGE */}
          <div style={{
            width: '320px',
            minHeight: '420px',
            background: 'linear-gradient(100deg, #f4ede0 0%, #faf6ec 100%)',
            padding: '44px 44px 50px 36px',
            position: 'relative',
            boxShadow: 'inset 6px 0 20px rgba(0,0,0,0.06)',
            borderRadius: '0 3px 3px 0',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(101,75,36,0.2)' }} />
              <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'rgba(101,75,36,0.3)' }} />
              <div style={{ flex: 1, height: '1px', background: 'rgba(101,75,36,0.2)' }} />
            </div>
            {spread.right.title && (
              <div style={{ fontSize: '11px', letterSpacing: '3px', color: 'rgba(101,75,36,0.7)', textTransform: 'uppercase', fontFamily: 'Georgia, serif', marginBottom: '18px' }}>
                {spread.right.title}
              </div>
            )}
            <p style={{ margin: 0, fontSize: '13.5px', lineHeight: '2.1', color: '#2a1f14', fontFamily: 'Georgia, serif', whiteSpace: 'pre-line', letterSpacing: '0.2px' }}>
              {spread.right.body}
            </p>
            <div style={{ position: 'absolute', bottom: '22px', left: 0, right: 0, textAlign: 'center', fontSize: '10px', color: 'rgba(101,75,36,0.4)', fontFamily: 'Georgia, serif', letterSpacing: '2px' }}>
              — {rightPage} —
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <button
            onClick={() => canPrev && turn(-1)}
            disabled={!canPrev}
            style={{
              background: 'none', border: '1px solid rgba(212,175,55,0.3)',
              color: canPrev ? 'rgba(212,175,55,0.8)' : 'rgba(212,175,55,0.2)',
              padding: '8px 20px', cursor: canPrev ? 'pointer' : 'default',
              fontFamily: 'monospace', fontSize: '12px', letterSpacing: '2px',
              borderRadius: '2px', transition: 'all 0.2s',
            }}
            onMouseOver={(e) => { if (canPrev) e.currentTarget.style.background = 'rgba(212,175,55,0.1)'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'none'; }}
          >
            ← PREV
          </button>

          <span style={{ color: 'rgba(212,175,55,0.35)', fontFamily: 'monospace', fontSize: '10px', letterSpacing: '3px' }}>
            {spreadIndex + 1} / {BOOK_PAGES.length}
          </span>

          <button
            onClick={() => canNext && turn(1)}
            disabled={!canNext}
            style={{
              background: 'none', border: '1px solid rgba(212,175,55,0.3)',
              color: canNext ? 'rgba(212,175,55,0.8)' : 'rgba(212,175,55,0.2)',
              padding: '8px 20px', cursor: canNext ? 'pointer' : 'default',
              fontFamily: 'monospace', fontSize: '12px', letterSpacing: '2px',
              borderRadius: '2px', transition: 'all 0.2s',
            }}
            onMouseOver={(e) => { if (canNext) e.currentTarget.style.background = 'rgba(212,175,55,0.1)'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'none'; }}
          >
            NEXT →
          </button>
        </div>

        <div
          onClick={onClose}
          style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace', fontSize: '10px', letterSpacing: '2px', cursor: 'pointer', transition: 'color 0.2s' }}
          onMouseOver={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
          onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.2)'}
        >
          [ click outside or here to close ]
        </div>
      </div>
    </div>
  );
}
