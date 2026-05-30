import React, { useState } from 'react';

const GoalInput = () => {
  const [goal, setGoal] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!goal.trim()) return;
    const currentGoal = goal;
    setGoal('');
    try {
      const response = await fetch('http://localhost:5000/api/goal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: currentGoal })
      });
      const data = await response.json();
      console.log('[GoalInput] Response:', data);
    } catch (err) {
      console.error('[GoalInput] Failed:', err);
    }
  };

  return (
    <>
      {/* Bottom Center Bar */}
      <div style={{
        position: 'absolute',
        bottom: '30px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '600px',
        borderBottom: '1px solid #00f5ff', // Cyan bottom border only
        background: 'rgba(5, 5, 8, 0.9)',
        display: 'flex',
        alignItems: 'center',
        padding: '10px 20px',
        zIndex: 100,
        fontFamily: 'monospace'
      }}>
        <div style={{
          color: '#00f5ff',
          fontSize: '0.9rem',
          letterSpacing: '2px',
          marginRight: '20px'
        }}>
          GOAL
        </div>

        <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex' }}>
          <input
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="ENTER OBJECTIVE..."
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
      </div>

      {/* Three tab buttons bottom left */}
      <div style={{
        position: 'absolute',
        bottom: '30px',
        left: '30px',
        zIndex: 100,
        display: 'flex',
        gap: '20px',
        fontFamily: 'monospace',
        fontSize: '0.75rem',
        color: '#555',
        letterSpacing: '2px'
      }}>
        <div style={{ color: '#fff', borderBottom: '1px solid #fff', paddingBottom: '2px', cursor: 'pointer' }}>MAP</div>
        <div style={{ cursor: 'pointer' }}>LOGS</div>
        <div style={{ cursor: 'pointer' }}>SYSTEM</div>
      </div>

      {/* Bottom right watermark */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '370px', // Avoid AgentPanel
        zIndex: 100,
        fontFamily: 'monospace',
        fontSize: '0.65rem',
        color: '#333',
        letterSpacing: '2px',
        pointerEvents: 'none'
      }}>
        // WORKROOM PROTOCOL INTERFACE
      </div>
    </>
  );
};

export default GoalInput;