import React from 'react';

const AgentList = () => {
  const agents = [
    { id: 1, name: 'The Manager', role: 'Orchestrator', status: 'Thinking' },
    { id: 2, name: 'The Developer', role: 'Execution', status: 'Idle' },
  ];

  return (
    <div className="agent-list">
      {agents.map(agent => (
        <div key={agent.id} style={{
          marginBottom: '15px',
          padding: '10px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '8px'
        }}>
          <div style={{ fontWeight: 'bold' }}>{agent.name}</div>
          <div style={{ fontSize: '0.8rem', color: '#888' }}>{agent.role} • {agent.status}</div>
        </div>
      ))}
    </div>
  );
};

export default AgentList;
