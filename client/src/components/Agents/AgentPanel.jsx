import React from 'react';
import AgentList from './AgentList';
import AgentLog from './AgentLog';

const AgentPanel = ({ agents = [], logs = [] }) => {
  return (
    <div style={{
      position: 'absolute',
      right: 0,
      top: 0,
      width: '350px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px',
      boxSizing: 'border-box',
      zIndex: 10,
      fontFamily: 'monospace',
      pointerEvents: 'none', // Let clicks pass through empty areas
      background: 'transparent'
    }}>
      <div style={{
        pointerEvents: 'auto', // Re-enable for the actual panel content
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{
          color: '#555',
          fontSize: '0.9rem',
          letterSpacing: '2px',
          marginBottom: '20px',
          borderBottom: '1px solid #111',
          paddingBottom: '10px'
        }}>
          AGENTS [{agents.length}]
        </div>
        
        <AgentList agents={agents} />
        
        <div style={{ flex: 1 }} />
        
        <div style={{
          color: '#555',
          fontSize: '0.9rem',
          letterSpacing: '2px',
          marginBottom: '10px',
          marginTop: '20px',
          borderBottom: '1px solid #111',
          paddingBottom: '10px'
        }}>
          LIVE FEED
        </div>
        <AgentLog logs={logs} />
      </div>
    </div>
  );
};

export default AgentPanel;
