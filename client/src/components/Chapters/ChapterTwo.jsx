// ─────────────────────────────────────────────────────────────
// client/src/components/Chapters/ChapterTwo.jsx
// Chapter 2 Access Gate & Waitlist Polling
// ─────────────────────────────────────────────────────────────
// Displays live waitlist count from GET /api/chapter2/waitlist-count,
// polling every 30 seconds.
// Allows visitor to submit access request via POST /api/chapter2/request.
// Silently logs the request to the Doorkeeper tracking system.
// ─────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';

const ChapterTwo = () => {
  const [waitlistCount, setWaitlistCount] = useState(0);
  const [requested, setRequested] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // ── Poll waitlist count every 30 seconds ──
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/chapter2/waitlist-count');
        if (res.ok) {
          const data = await res.json();
          setWaitlistCount(data.count || 0);
        }
      } catch (err) {
        // Silent fail — polling must never disrupt the UI
      }
    };

    fetchCount(); // Initial fetch
    const interval = setInterval(fetchCount, 30000); // Every 30s
    return () => clearInterval(interval);
  }, []);

  // ── Handle Request Access ──
  const handleRequestAccess = async () => {
    if (loading || requested) return;
    setLoading(true);

    try {
      // Retrieve active session ID from Doorkeeper beacon or fallback
      const sessionId = window.__doorkeeper?.sessionId || 'sess_' + Math.random().toString(36).substr(2, 9);

      const res = await fetch('http://localhost:5000/api/chapter2/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });

      if (res.ok) {
        setRequested(true);
        setMessage('Your request has been logged. The Doorkeeper will decide.');
        // Log access request to Doorkeeper
        window.__doorkeeper?.logChapter2Request();
        // Optimistically increment local waitlist count
        setWaitlistCount(prev => prev + 1);
      } else {
        setMessage('Failed to submit request. The gate remains locked.');
      }
    } catch (err) {
      setMessage('Network error. The simulation is unresponsive.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#050508',
      color: '#f0f0f5',
      fontFamily: "'Inter', sans-serif",
      position: 'absolute',
      top: 0,
      left: 0,
      zIndex: 300,
      boxSizing: 'border-box',
      padding: '20px',
      textAlign: 'center',
      userSelect: 'none'
    }}>
      {/* Top Accent Line */}
      <div style={{
        width: '60px',
        height: '2px',
        background: '#00f5ff',
        marginBottom: '30px',
        boxShadow: '0 0 15px #00f5ff'
      }} />

      <h1 style={{
        fontSize: '2.2rem',
        fontWeight: 300,
        letterSpacing: '4px',
        margin: '0 0 15px 0',
        color: '#ffffff'
      }}>
        CHAPTER II // THE GATE
      </h1>

      <p style={{
        color: '#8888a0',
        fontSize: '1rem',
        maxWidth: '500px',
        lineHeight: '1.6',
        margin: '0 0 40px 0',
        fontWeight: 300
      }}>
        The simulation has concluded its initial phase. Access to the deeper architectural layers is currently restricted.
      </p>

      {/* Live Waitlist Display */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '15px 30px',
        borderRadius: '6px',
        marginBottom: '40px',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        gap: '15px'
      }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: '#00f5ff',
          boxShadow: '0 0 10px #00f5ff',
          animation: 'pulse 2s infinite'
        }} />
        <span style={{ fontSize: '0.9rem', color: '#aaa', letterSpacing: '1px', textTransform: 'uppercase' }}>
          Live Status: <strong style={{ color: '#00f5ff', fontFamily: 'monospace', fontSize: '1.1rem' }}>{waitlistCount}</strong> people are waiting
        </span>
      </div>

      {/* Access Request Button */}
      <button
        onClick={handleRequestAccess}
        disabled={loading || requested}
        style={{
          padding: '14px 40px',
          background: requested ? 'rgba(0, 255, 136, 0.1)' : 'transparent',
          border: `1px solid ${requested ? '#00ff88' : 'rgba(0, 245, 255, 0.3)'}`,
          color: requested ? '#00ff88' : '#00f5ff',
          fontSize: '0.85rem',
          fontFamily: 'monospace',
          letterSpacing: '3px',
          cursor: (loading || requested) ? 'default' : 'pointer',
          borderRadius: '4px',
          transition: 'all 0.3s ease',
          boxShadow: requested ? '0 0 20px rgba(0, 255, 136, 0.2)' : 'none'
        }}
        onMouseEnter={(e) => {
          if (!loading && !requested) {
            e.target.style.borderColor = '#00f5ff';
            e.target.style.background = 'rgba(0, 245, 255, 0.05)';
            e.target.style.boxShadow = '0 0 15px rgba(0, 245, 255, 0.2)';
          }
        }}
        onMouseLeave={(e) => {
          if (!loading && !requested) {
            e.target.style.borderColor = 'rgba(0, 245, 255, 0.3)';
            e.target.style.background = 'transparent';
            e.target.style.boxShadow = 'none';
          }
        }}
      >
        {loading ? 'TRANSMITTING...' : (requested ? 'REQUEST LOGGED ✓' : 'REQUEST ACCESS')}
      </button>

      {/* Feedback Message */}
      {message && (
        <p style={{
          marginTop: '25px',
          fontSize: '0.85rem',
          color: requested ? '#00ff88' : '#ffaa00',
          fontFamily: 'monospace',
          letterSpacing: '1px',
          animation: 'fadeIn 0.5s ease'
        }}>
          {message}
        </p>
      )}

      <style>{`
        @keyframes pulse {
          0% { opacity: 0.4; transform: scale(0.95); }
          50% { opacity: 1; transform: scale(1.05); }
          100% { opacity: 0.4; transform: scale(0.95); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ChapterTwo;
