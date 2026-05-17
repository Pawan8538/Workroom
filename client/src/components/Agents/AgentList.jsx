import React from 'react';

const AgentList = ({ agents = [] }) => {
  // If socket agents is empty, provide a stylish fallback or render the live list
  const displayAgents = agents.length > 0 ? agents : [
    { id: 'aria', name: 'ARIA', role: 'Product Manager', status: 'idle', color: '#00f5ff', symbol: 'Ω' },
    { id: 'kael', name: 'KAEL', role: 'Backend Developer', status: 'idle', color: '#ff8a00', symbol: 'λ' },
    { id: 'zeno', name: 'ZENO', role: 'QA Engineer', status: 'idle', color: '#a855f7', symbol: 'Δ' },
  ];

  return (
    <div className="agent-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {displayAgents.map(agent => (
        <div key={agent.id} style={{
          padding: '12px 15px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '6px',
          backdropFilter: 'blur(5px)',
          transition: 'all 0.3s ease'
        }}>
          <div style={{ fontWeight: '600', color: agent.color || '#00f5ff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{agent.name}</span>
            <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#888' }}>{agent.symbol || ''}</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#aaa', marginTop: '6px', display: 'flex', justifyContent: 'space-between' }}>
            <span>{agent.role}</span>
            <span style={{ color: agent.status === 'working' ? '#00ff88' : (agent.status === 'thinking' ? '#00f5ff' : '#ffaa00'), fontFamily: 'monospace', textTransform: 'uppercase', fontSize: '0.75rem' }}>{agent.status || 'idle'}</span>
          </div>
          {agent.task && (
            <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px', fontFamily: 'monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Task: <span style={{ color: '#fff' }}>{agent.task.title}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default AgentList;
