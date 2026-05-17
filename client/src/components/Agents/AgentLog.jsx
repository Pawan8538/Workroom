import React from 'react';

const AgentLog = () => {
  const logs = [
    { id: 1, time: '22:30:01', msg: 'System initialized.' },
    { id: 2, time: '22:30:05', msg: 'Manager assigned to goal.' },
  ];

  return (
    <div className="agent-log" style={{
      fontSize: '0.75rem',
      fontFamily: 'monospace',
      color: '#00ff00',
      maxHeight: '200px',
      overflowY: 'auto'
    }}>
      {logs.map(log => (
        <div key={log.id} style={{ marginBottom: '5px' }}>
          <span style={{ color: '#444' }}>[{log.time}]</span> {log.msg}
        </div>
      ))}
    </div>
  );
};

export default AgentLog;
