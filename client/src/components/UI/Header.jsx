import React, { useState, useEffect } from 'react';

const Header = ({ isConnected, cycle }) => {
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [showObserver, setShowObserver] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Show observer text after 30 seconds
    const timeout = setTimeout(() => {
      setShowObserver(true);
    }, 30000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      left: '20px',
      zIndex: 1000,
      fontFamily: 'monospace',
      color: '#00f5ff',
      fontSize: '0.8rem',
      letterSpacing: '1px',
      pointerEvents: 'none'
    }}>
      <div style={{ opacity: 0.6 }}>SYS_VER  : 1.7.03</div>
      <div style={{ opacity: 0.6 }}>GRID     : WRK_0x43</div>
      <div style={{ opacity: 0.6 }}>MODE     : OBSERVE</div>
      <div style={{ opacity: 0.6 }}>TIME     : {time}</div>
      <div style={{ opacity: 0.6 }}>CAMERA   : OVERWATCH_3A</div>
      <div style={{ opacity: 0.6, color: isConnected ? '#00f5ff' : '#ffaa00' }}>
        STATUS   : {isConnected ? 'ONLINE' : 'OFFLINE'}
      </div>

      {showObserver && (
        <div style={{
          marginTop: '20px',
          color: '#ff0044',
          fontWeight: 'bold',
          opacity: 0,
          animation: 'fadeIn 2s ease-in forwards'
        }}>
          OBSERVER : DETECTED
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Header;
