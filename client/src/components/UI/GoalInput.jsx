import React, { useState } from 'react';
import { setGoal as submitGoal } from '../../lib/api';

const GoalInput = () => {
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
  if (!goal.trim() || loading) return;
  const currentGoal = goal;
  setGoal(''); // clear immediately
  setLoading(true);
  try {
    const response = await submitGoal(currentGoal);
    console.log('Tasks received:', response.data);
  } catch (err) {
    console.error('Goal submission failed:', err);
  } finally {
    setLoading(false);
  }
};

  return (
    <div style={{
      position: 'absolute',
      bottom: '30px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '600px',
      maxWidth: '90%',
      zIndex: 20,
      display: 'flex',
      gap: '10px'
    }}>
      <input
        type="text"
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        placeholder={loading ? 'Deploying...' : 'Enter a corporate goal...'}
        disabled={loading}
        style={{
          flex: 1,
          padding: '15px 25px',
          background: 'rgba(20, 20, 25, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '50px',
          color: '#fff',
          fontSize: '1rem',
          outline: 'none',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
        }}
      />
      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          padding: '15px 28px',
          background: loading ? 'rgba(0,245,255,0.1)' : 'rgba(0,245,255,0.15)',
          border: '1px solid rgba(0,245,255,0.3)',
          borderRadius: '50px',
          color: '#00f5ff',
          fontSize: '0.85rem',
          letterSpacing: '2px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: 'monospace',
          whiteSpace: 'nowrap'
        }}
      >
        {loading ? '...' : 'DEPLOY'}
      </button>
    </div>
  );
};

export default GoalInput;