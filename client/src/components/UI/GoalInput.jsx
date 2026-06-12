import React, { useState, useEffect, useRef } from 'react';

// Inject blink keyframe once
if (typeof document !== 'undefined' && !document.getElementById('goal-blink-style')) {
  const style = document.createElement('style');
  style.id = 'goal-blink-style';
  style.textContent = `
    @keyframes goalBorderBlink {
      0%   { border-bottom-color: #00f5ff; box-shadow: none; }
      50%  { border-bottom-color: #ffffff; box-shadow: 0 0 12px #00f5ff, 0 0 24px #00f5ff; }
      100% { border-bottom-color: #00f5ff; box-shadow: none; }
    }
  `;
  document.head.appendChild(style);
}

const IDLE_BLINK_DELAY = 2 * 60 * 1000; // 2 minutes

const GoalInput = ({ socket, isMeetingActive }) => {
  const [goal, setGoal] = useState('');
  const [isBlinking, setIsBlinking] = useState(false);
  const idleTimerRef = useRef(null);

  // Start the 2-minute idle blink timer
  const startIdleTimer = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      // Blink continuously until interacted with
      setIsBlinking(true);
    }, IDLE_BLINK_DELAY);
  };

  // Stop the timer
  const stopIdleTimer = () => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  };

  useEffect(() => {
    if (isMeetingActive) {
      stopIdleTimer(); // Pause timer while meeting is happening
    } else if (isMeetingActive === false) {
      startIdleTimer(); // Start 2-minute timer once meeting ends
    }
    return stopIdleTimer;
  }, [isMeetingActive]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!goal.trim()) return;
    const currentGoal = goal;
    setGoal('');
    stopIdleTimer(); // Stop timer when they submit a goal
    try {
      const response = await fetch('http://localhost:5000/api/goal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: currentGoal, socketId: socket?.id })
      });
      const data = await response.json();
      console.log('[GoalInput] Response:', data);
    } catch (err) {
      console.error('[GoalInput] Failed:', err);
    }
  };

  return (
    <>
      <div style={{
        position: 'absolute',
        bottom: '130px', // Position above the input bar
        left: '50%',
        transform: 'translateX(-50%)',
        color: '#00f5ff',
        fontFamily: 'monospace',
        fontSize: '0.8rem',
        letterSpacing: '2px',
        opacity: 0.8,
        zIndex: 100
      }}>
        DEPLOY A TASK TO WORKROOM
      </div>
      
      {/* Bottom Center Bar */}
      <div style={{
        position: 'absolute',
        bottom: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '600px',
        borderBottom: '1px solid #00f5ff', // Cyan bottom border only
        background: 'rgba(5, 5, 8, 0.9)',
        display: 'flex',
        alignItems: 'center',
        padding: '10px 20px',
        zIndex: 100,
        fontFamily: 'monospace',
        animation: isBlinking ? 'goalBorderBlink 2.0s ease-in-out infinite' : 'none'
      }}>
        <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex' }}>
          <input
            type="text"
            value={goal}
            onClick={() => { setIsBlinking(false); stopIdleTimer(); }}
            onChange={(e) => { setGoal(e.target.value); setIsBlinking(false); stopIdleTimer(); }}
            placeholder="e.g. Build an authentication system"
            spellCheck="false"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: '#fff',
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              letterSpacing: '1px',
              outline: 'none'
            }}
          />
          <button
            type="submit"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#00f5ff',
              fontSize: '1.2rem',
              cursor: 'pointer',
              padding: '0 10px',
              outline: 'none'
            }}
          >
            &gt;
          </button>
        </form>
        {/* Suggestion Chips */}
        <div style={{
          position: 'absolute',
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '10px',
          marginTop: '15px',
          width: 'max-content',
          zIndex: 100
        }}>
          {["say hello world", "Create a REST API", "Design a database schema", "Build a login page"].map((sug, i) => (
            <div
              key={i}
              onClick={() => { setGoal(sug); setIsBlinking(false); stopIdleTimer(); }}
              style={{
                padding: '4px 10px',
                background: 'rgba(0, 245, 255, 0.05)',
                border: '1px solid rgba(0, 245, 255, 0.3)',
                color: '#00f5ff',
                fontSize: '0.75rem',
                cursor: 'pointer',
                fontFamily: 'monospace',
                transition: 'all 0.2s',
              }}
              onPointerOver={(e) => { e.currentTarget.style.background = 'rgba(0, 245, 255, 0.15)'; e.currentTarget.style.borderColor = '#00f5ff'; }}
              onPointerOut={(e) => { e.currentTarget.style.background = 'rgba(0, 245, 255, 0.05)'; e.currentTarget.style.borderColor = 'rgba(0, 245, 255, 0.3)'; }}
            >
              {sug}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default GoalInput;