import React from 'react';

const Header = () => {
  return (
    <header style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      padding: '20px 40px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      zIndex: 20,
      pointerEvents: 'none'
    }}>
      <div style={{ pointerEvents: 'auto' }}>
        <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold', letterSpacing: '2px' }}>WORKROOM</h1>
      </div>
      
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        padding: '5px 15px',
        borderRadius: '4px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        pointerEvents: 'auto'
      }}>
        <span style={{ color: '#888', fontSize: '0.8rem', marginRight: '10px' }}>CYCLE</span>
        <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>00042</span>
      </div>
    </header>
  );
};

export default Header;
