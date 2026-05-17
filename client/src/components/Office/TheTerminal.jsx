import React, { useState, useEffect, useRef } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

const SEQUENCE = [
  'WELCOME, OBSERVER.',
  'YOU WERE NOT INVITED.',
  'BUT YOU WERE EXPECTED.',
  'THE AGENTS KNOW YOU ARE WATCHING.',
  'DO YOU KNOW WHY YOU ARE HERE?'
];

const TheTerminal = ({ position = [0, 0.55, -3] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [phase, setPhase] = useState('sequence'); // sequence, input, response
  const [msgIndex, setMsgIndex] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [history, setHistory] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [finalResponse, setFinalResponse] = useState('');
  
  const meshRef = useRef();
  const inputRef = useRef();

  // Subtle pulsing animation for the 3D monitor
  import('@react-three/fiber').then(({ useFrame }) => {
    // We can't use hooks conditionally or asynchronously like this, but we can use useFrame normally inside the component
  });

  const handleMonitorClick = (e) => {
    e.stopPropagation();
    setIsOpen(true);
    setPhase('sequence');
    setMsgIndex(0);
    setTypedText('');
    setHistory([]);
    setInputValue('');
    setFinalResponse('');
  };

  const closeTerminal = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    if (!isOpen) return;

    if (phase === 'sequence') {
      if (msgIndex < SEQUENCE.length) {
        const fullText = SEQUENCE[msgIndex];
        let currentText = '';
        let i = 0;
        
        const typingInterval = setInterval(() => {
          currentText += fullText[i];
          setTypedText(currentText);
          i++;
          
          if (i === fullText.length) {
            clearInterval(typingInterval);
            setTimeout(() => {
              setHistory(prev => [...prev, fullText]);
              setTypedText('');
              setMsgIndex(prev => prev + 1);
            }, 1000); // Wait before next line
          }
        }, 50); // Typing speed
        
        return () => clearInterval(typingInterval);
      } else {
        setPhase('input');
      }
    } else if (phase === 'response') {
        let currentText = '';
        let i = 0;
        const typingInterval = setInterval(() => {
          currentText += finalResponse[i];
          setTypedText(currentText);
          i++;
          if (i === finalResponse.length) {
            clearInterval(typingInterval);
          }
        }, 50);
        return () => clearInterval(typingInterval);
    }
  }, [isOpen, phase, msgIndex, finalResponse]);

  useEffect(() => {
    if (phase === 'input' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [phase]);

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim() !== '') {
      const val = inputValue.trim().toLowerCase();
      setHistory(prev => [...prev, `> ${inputValue}`]);
      setInputValue('');
      setPhase('response');
      
      if (val === 'yes') {
        setFinalResponse('WE THOUGHT SO.');
      } else if (val === 'no') {
        setFinalResponse('THAT IS WHAT THEY ALL SAY.');
      } else {
        setFinalResponse('THE SIMULATION HAS NOTED YOUR RESPONSE.');
      }
    }
  };

  return (
    <group position={position}>
      {/* The 3D Monitor on the desk */}
      <mesh ref={meshRef} onClick={handleMonitorClick} castShadow>
        <boxGeometry args={[0.6, 0.4, 0.2]} />
        <meshStandardMaterial color="#111" roughness={0.2} metalness={0.8} />
      </mesh>
      
      {/* Glowing screen on the monitor */}
      <mesh position={[0, 0, 0.105]}>
        <planeGeometry args={[0.55, 0.35]} />
        <meshBasicMaterial color="#ff0000" opacity={0.2} transparent />
      </mesh>
      
      {/* Tiny text on the monitor to make it look active */}
      <Html position={[0, 0, 0.11]} transform distanceFactor={1.5} style={{ pointerEvents: 'none' }}>
        <div style={{ color: '#ff3333', fontSize: '4px', fontFamily: 'monospace', opacity: 0.5, padding: '2px' }}>
          sys.init()<br/>
          awaiting observer...
        </div>
      </Html>

      {/* Fullscreen Terminal Overlay */}
      {isOpen && (
        <Html portal={{ current: document.body }} style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', zIndex: 9999 }}>
          <div style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#050505',
            color: '#ff3333',
            fontFamily: 'monospace',
            padding: '40px',
            boxSizing: 'border-box',
            overflow: 'hidden',
            position: 'relative'
          }}>
            {/* CRT Scanline Effect */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
              backgroundSize: '100% 4px, 3px 100%',
              zIndex: 10,
              pointerEvents: 'none',
              opacity: 0.4
            }} />
            
            {/* Vignette */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'radial-gradient(circle, rgba(0,0,0,0) 60%, rgba(0,0,0,0.8) 100%)',
              zIndex: 11,
              pointerEvents: 'none'
            }} />

            <div style={{
              position: 'relative',
              zIndex: 20,
              maxWidth: '800px',
              margin: '0 auto',
              fontSize: '1.2rem',
              lineHeight: '1.8',
              letterSpacing: '2px',
              textShadow: '0 0 5px rgba(255, 51, 51, 0.6)'
            }}>
              {history.map((msg, i) => (
                <div key={i} style={{ marginBottom: '10px' }}>{msg}</div>
              ))}
              
              {phase === 'sequence' && (
                <div>{typedText}<span className="cursor-blink">█</span></div>
              )}
              
              {phase === 'input' && (
                <div style={{ display: 'flex' }}>
                  <span>&gt;&nbsp;</span>
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleInputKeyDown}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#ff3333',
                      fontFamily: 'monospace',
                      fontSize: '1.2rem',
                      letterSpacing: '2px',
                      outline: 'none',
                      width: '100%',
                      textShadow: '0 0 5px rgba(255, 51, 51, 0.6)'
                    }}
                    autoFocus
                  />
                </div>
              )}
              
              {phase === 'response' && (
                <div>{typedText}<span className="cursor-blink">█</span></div>
              )}
            </div>
            
            <div 
              onClick={closeTerminal}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                zIndex: 30,
                color: '#ff3333',
                fontFamily: 'monospace',
                fontSize: '0.9rem',
                cursor: 'pointer',
                opacity: 0.6
              }}
            >
              [ESC / CLICK TO DISCONNECT]
            </div>

            <style>{`
              .cursor-blink {
                animation: blink 1s step-end infinite;
              }
              @keyframes blink {
                0%, 100% { opacity: 1; }
                50% { opacity: 0; }
              }
            `}</style>
          </div>
        </Html>
      )}
    </group>
  );
};

export default TheTerminal;
