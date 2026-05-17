import React from 'react';
import AgentList from './AgentList';
import AgentLog from './AgentLog';

const AgentPanel = () => {
  return (
    <div className="agent-panel" style={{
      position: 'absolute',
      right: 0,
      top: 0,
      width: '300px',
      height: '100%',
      background: 'rgba(15, 15, 20, 0.9)',
      backdropFilter: 'blur(10px)',
      borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px',
      boxSizing: 'border-box',
      zIndex: 10
    }}>
      <h2 style={{ fontSize: '1.2rem', marginBottom: '20px', color: '#fff' }}>Personnel</h2>
      <AgentList />
      <div style={{ flex: 1 }} />
      <h3 style={{ fontSize: '0.9rem', marginBottom: '10px', color: '#888' }}>Live Logs</h3>
      <AgentLog />
    </div>
  );
};

export default AgentPanel;
