import React from 'react';

const AgentLog = ({ logs = [] }) => {
  const displayLogs = logs.length > 0 ? logs : [
    { _id: 1, timestamp: new Date().toISOString(), agentId: 'SYSTEM', message: 'System initialized. Workroom online.', type: 'system' }
  ];

  return (
    <div className="agent-log" style={{
      fontSize: '0.75rem',
      fontFamily: 'monospace',
      color: '#ccc',
      maxHeight: '280px',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      paddingRight: '5px'
    }}>
      {displayLogs.map(log => {
        const timeStr = log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : '';
        let color = '#ccc';
        if (log.type === 'system') color = '#00f5ff';
        if (log.type === 'warning') color = '#ffaa00';
        if (log.type === 'task') color = '#00ff88';
        if (log.type === 'shadow') color = '#ff3333';

        return (
          <div key={log._id || Math.random()} style={{ lineHeight: '1.4', background: 'rgba(0,0,0,0.2)', padding: '6px 8px', borderRadius: '4px', borderLeft: `2px solid ${color}` }}>
            <div style={{ color: '#666', fontSize: '0.65rem', marginBottom: '2px', display: 'flex', justifyContent: 'space-between' }}>
              <span>[{timeStr}]</span>
              <span style={{ color, fontWeight: 'bold' }}>{log.agentId}</span>
            </div>
            <div style={{ color: log.type === 'shadow' ? '#ff3333' : '#eee', textShadow: log.type === 'shadow' ? '0 0 5px rgba(255,51,51,0.5)' : 'none' }}>
              {log.message}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AgentLog;
