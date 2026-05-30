import React, { useEffect } from 'react';

// ── Sector calculation based on 3D coordinates (x, z) ──
// In Three.js, x is horizontal and z is depth (y is vertical height).
const getSector = (x, z) => {
  if (x == null || z == null) return 'UNKNOWN';
  
  // Divide floor into 3 columns (X-axis) and 2 rows (Z-axis)
  const col = x < -5 ? 1 : (x > 5 ? 3 : 2);
  const row = z < 0 ? 0 : 1;
  
  const sectorNum = row * 3 + col; // 1 to 6
  return `SECTOR_${sectorNum}`;
};

const AgentList = ({ agents = [] }) => {
  // Debug log to console to inspect exact incoming socket coordinates
  useEffect(() => {
    if (agents.length > 0) {
      console.log('[AgentList] Live Agent Coordinates from Socket:', agents.map(a => ({
        id: a.id,
        x: a.x,
        y: a.y,
        z: a.z,
        position: a.position
      })));
    }
  }, [agents]);

  const displayAgents = agents.length > 0 ? agents : [
    { id: 'aria', name: 'ARIA', color: '#00f5ff', status: 'idle', x: -8, y: 0, z: -4 },
    { id: 'kael', name: 'KAEL', color: '#ff8a00', status: 'idle', x: 0, y: 0, z: 0 },
    { id: 'zeno', name: 'ZENO', color: '#a855f7', status: 'idle', x: 8, y: 0, z: 4 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {displayAgents.map(agent => {
        // Extract correct X and Z coordinates whether top-level or inside position object
        const posX = agent.position?.x ?? agent.x;
        const posZ = agent.position?.z ?? agent.position?.y ?? agent.z ?? agent.y;

        return (
          <div key={agent.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'transparent' }}>
            {/* Header: Dot + Name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ 
                width: '12px', 
                height: '12px', 
                borderRadius: '50%', 
                backgroundColor: agent.color || '#00f5ff',
                boxShadow: `0 0 10px ${agent.color || '#00f5ff'}`
              }} />
              <div style={{ 
                color: agent.color || '#00f5ff', 
                fontSize: '1.1rem', 
                letterSpacing: '2px',
                textShadow: `0 0 5px ${agent.color || '#00f5ff'}88`
              }}>
                {agent.name}
              </div>
            </div>
            
            {/* Stats Block */}
            <div style={{ 
              color: '#666', 
              fontSize: '0.75rem', 
              paddingLeft: '22px', // Align with text
              display: 'flex', 
              flexDirection: 'column', 
              gap: '4px' 
            }}>
              <div style={{ display: 'flex' }}>
                <span style={{ width: '80px' }}>STATUS</span>
                <span>: </span>
                <span style={{
                  color: agent.status === 'working'
                    ? '#ff8a00'
                    : agent.status === 'meeting'
                      ? '#00f5ff'
                      : '#888',
                  textTransform: 'uppercase'
                }}>
                  {agent.status || 'IDLE'}
                </span>
              </div>
              <div style={{ display: 'flex' }}>
                <span style={{ width: '80px' }}>LOCATION</span>
                <span>: </span>
                <span style={{ color: '#888' }}>
                  {getSector(posX, posZ)}
                </span>
              </div>
              <div style={{ display: 'flex' }}>
                <span style={{ width: '80px' }}>AUTH</span>
                <span>: </span>
                <span style={{ color: '#00aa00' }}>OK</span>
              </div>
            </div>
          </div>
        );
      })}
      
      <div style={{ 
        color: '#222', 
        fontSize: '0.7rem', 
        textAlign: 'center', 
        marginTop: '10px',
        letterSpacing: '2px'
      }}>
        END_OF_LIST
      </div>
    </div>
  );
};

export default AgentList;
