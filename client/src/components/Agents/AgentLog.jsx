import React, { useState, useEffect, useRef } from 'react';

const AgentLog = ({ logs = [] }) => {
  const [injectedTraces, setInjectedTraces] = useState([]);
  const logsEndRef = useRef(null);

  // Auto-scroll to the latest log entry whenever logs update
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Inject observer trace every 45 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setInjectedTraces(prev => [
        ...prev,
        {
          _id: `trace_${Date.now()}`,
          timestamp: new Date().toISOString(),
          agentId: 'OBSERVER',
          message: 'signal trace: active',
          type: 'trace'
        }
      ]);
    }, 45000);
    return () => clearInterval(timer);
  }, []);

  // Merge actual logs and injected traces, then sort by time
  const allLogs = [...logs, ...injectedTraces].sort((a, b) => {
    return new Date(a.timestamp) - new Date(b.timestamp);
  });

  const displayLogs = allLogs.length > 0 ? allLogs : [
    { _id: 1, timestamp: new Date().toISOString(), agentId: 'SYSTEM', message: 'FEED SYNCED', type: 'system' }
  ];

  return (
    <div style={{
      fontSize: '0.7rem',
      color: '#666',
      maxHeight: '400px',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      paddingRight: '5px'
    }}>
      {displayLogs.map(log => {
        const timeStr = log.timestamp ? new Date(log.timestamp).toLocaleTimeString('en-US', { hour12: false }) : '';
        let color = '#00f5ff'; // cyan normal
        let msgColor = '#555';
        let prefix = `[${log.agentId}]`;

        if (log.type === 'system') {
          color = '#555';
          prefix = '[SYSTEM]';
        } else if (log.type === 'warning') {
          color = '#ffaa00'; // orange warning
        } else if (log.type === 'alert') {
          color = '#ff0044'; // red alert
          prefix = '[ALERT]';
        } else if (log.type === 'shadow') {
          color = '#880000'; // dark red
          prefix = '[ALERT]';
          msgColor = '#880000';
        } else if (log.type === 'trace') {
          color = '#222'; // extremely faint
          msgColor = '#222';
        }

        return (
          <div key={log._id || Math.random()} style={{ display: 'flex', gap: '8px', lineHeight: '1.2', background: 'transparent' }}>
            <span style={{ color: '#444', minWidth: '60px' }}>{timeStr}</span>
            <span style={{ color }}>{prefix}</span>
            <span style={{ color: msgColor, textTransform: 'uppercase' }}>{log.message}</span>
          </div>
        );
      })}
      <div ref={logsEndRef} />
    </div>
  );
};

export default AgentLog;
