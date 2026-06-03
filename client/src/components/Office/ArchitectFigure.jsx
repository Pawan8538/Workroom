import React, { useState, useEffect } from 'react';
import { Html } from '@react-three/drei';
import { ARCHITECT_LINES } from '../../constants/ARCHITECT_SCRIPT';

const ArchitectFigure = ({ visible, architectOutcome, onClose }) => {
  const [lineIndex, setLineIndex] = useState(0);
  const [showButtons, setShowButtons] = useState(false);

  useEffect(() => {
    if (!visible) return;
    
    setLineIndex(0);
    setShowButtons(false);
    
    const interval = setInterval(() => {
      setLineIndex(prev => {
        if (prev < ARCHITECT_LINES.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setShowButtons(true);
          return prev;
        }
      });
    }, 4000);
    
    return () => clearInterval(interval);
  }, [visible]);

  if (!visible) return null;
  
  const currentLine = ARCHITECT_LINES[lineIndex];

  return (
    <group position={[0, 0.6, 4]}>
      {/* Blocky human shape faint white */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[0.3, 0.8, 0.3]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} transparent opacity={0.15} />
      </mesh>
      
      {/* Label */}
      <Html position={[0, 1.2, 0]} center style={{ pointerEvents: 'none' }}>
        <div style={{ color: '#ffffff', fontFamily: 'monospace', fontSize: '10px', letterSpacing: '2px', opacity: 0.7 }}>
          ARCHITECT
        </div>
      </Html>
      
      {/* Speech Bubble */}
      {!showButtons && architectOutcome === 'none' && (
        <Html position={[0, 1.5, 0]} center style={{ pointerEvents: 'none' }}>
          <div style={{
            background: 'rgba(0,0,0,0.85)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: '#fff',
            padding: '8px 16px',
            fontFamily: 'monospace',
            fontSize: '12px',
            whiteSpace: 'nowrap'
          }}>
            {currentLine}
          </div>
        </Html>
      )}

      {/* YES / NO Buttons */}
      {showButtons && architectOutcome === 'none' && (
        <Html position={[0, 1.5, 0]} center>
          <div style={{ display: 'flex', gap: '20px' }}>
            <button 
              onClick={() => onClose('yes')}
              style={{ background: 'transparent', border: '1px solid #fff', color: '#fff', padding: '5px 15px', fontFamily: 'monospace', cursor: 'pointer' }}
            >YES</button>
            <button 
              onClick={() => onClose('no')}
              style={{ background: 'transparent', border: '1px solid #fff', color: '#fff', padding: '5px 15px', fontFamily: 'monospace', cursor: 'pointer' }}
            >NO</button>
          </div>
        </Html>
      )}
    </group>
  );
};

export default ArchitectFigure;
