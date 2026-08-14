import React, { useEffect, useState } from 'react';

const DeliverableScreen = ({ terminalContent, onClose }) => {
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [onClose]);

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      backgroundColor: '#050508',
      color: '#ffffff',
      fontFamily: 'monospace',
      zIndex: 10000,
      padding: '40px',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box'
    }}>
      <div style={{ position: 'absolute', top: '20px', right: '30px', fontSize: '24px', color: '#ffaa00' }}>
        CLOSING IN: {countdown}
      </div>
      
      <h1 style={{ color: '#00f5ff', borderBottom: '1px solid #333', paddingBottom: '10px' }}>DELIVERABLE PACKAGE</h1>
      
      <div style={{ display: 'flex', gap: '20px', flex: 1, marginTop: '20px', overflow: 'hidden' }}>
        {/* ARIA - ARCHITECTURE PLAN */}
        <div style={{ flex: 1, backgroundColor: '#0d1117', padding: '20px', overflowY: 'auto' }}>
          <h2 style={{ color: '#00f5ff', fontSize: '14px' }}>ARCHITECTURE PLAN (ARIA)</h2>
          <pre style={{ fontSize: '10px', color: '#88ccff', whiteSpace: 'pre-wrap' }}>
            {terminalContent?.aria?.join('\n') || 'No architecture data found.'}
          </pre>
        </div>
        
        {/* KAEL - CODE OUTLINE */}
        <div style={{ flex: 1, backgroundColor: '#0d1117', padding: '20px', overflowY: 'auto' }}>
          <h2 style={{ color: '#ff8a00', fontSize: '14px' }}>CODE OUTLINE (KAEL)</h2>
          <pre style={{ fontSize: '10px', color: '#ffccaa', whiteSpace: 'pre-wrap' }}>
            {terminalContent?.kael?.join('\n') || 'No code data found.'}
          </pre>
        </div>
        
        {/* ZENO - TEST STRUCTURE */}
        <div style={{ flex: 1, backgroundColor: '#0d1117', padding: '20px', overflowY: 'auto' }}>
          <h2 style={{ color: '#a855f7', fontSize: '14px' }}>TEST STRUCTURE (ZENO)</h2>
          <pre style={{ fontSize: '10px', color: '#ddbbee', whiteSpace: 'pre-wrap' }}>
            {terminalContent?.zeno?.join('\n') || 'No test data found.'}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default DeliverableScreen;
