import React, { useState, useEffect, useRef } from 'react';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { ARCHITECT_LINES } from '../../constants/ARCHITECT_SCRIPT';

const ArchitectFigure = ({ visible, architectOutcome, onClose, chapter2Approved, onArchitectArrivedAtDesk }) => {
  const [lineIndex, setLineIndex] = useState(0);
  const [showButtons, setShowButtons] = useState(false);
  
  // Animation state
  const groupRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const [isWalking, setIsWalking] = useState(false);
  const startPos = [-8.5, 0, 6];
  // Waypoints: first step out of the room, then walk to the desk
  const waypoints = [
    [-8.5, 0, 3], // step out
    [5.0, 0, 2.5] // target desk
  ];
  const [waypointIndex, setWaypointIndex] = useState(0);
  const [currentPos, setCurrentPos] = useState(startPos);
  const [hasArrived, setHasArrived] = useState(false);
  
  // Initialize walking when visible
  useEffect(() => {
    if (visible && !isWalking && currentPos[0] === startPos[0]) {
      setIsWalking(true);
    }
  }, [visible]);

  useFrame((state, delta) => {
    if (!visible || !groupRef.current) return;
    
    if (isWalking && waypointIndex < waypoints.length) {
      const speed = 2.0 * delta;
      const target = waypoints[waypointIndex];
      const dx = target[0] - currentPos[0];
      const dz = target[2] - currentPos[2];
      const dist = Math.sqrt(dx * dx + dz * dz);
      
      if (dist < 0.1) {
        setCurrentPos(target);
        if (waypointIndex === waypoints.length - 1) {
          setIsWalking(false);
          if (!hasArrived) {
            setHasArrived(true);
            onArchitectArrivedAtDesk && onArchitectArrivedAtDesk();
          }
        } else {
          setWaypointIndex(waypointIndex + 1);
        }
      } else {
        const nx = currentPos[0] + (dx / dist) * speed;
        const nz = currentPos[2] + (dz / dist) * speed;
        setCurrentPos([nx, currentPos[1], nz]);
        
        // Orient towards target
        const angle = Math.atan2(dx, dz);
        groupRef.current.rotation.y = angle;
      }
      groupRef.current.position.set(currentPos[0], currentPos[1], currentPos[2]);

      const time = state.clock.getElapsedTime();
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.x = Math.sin(time * 10) * 0.5;
        rightArmRef.current.rotation.x = -Math.sin(time * 10) * 0.5;
      }
    } else if (hasArrived) {
      // Face towards the observer table [7.0, 0, 3.5] from current [5.0, 0, 2.5]
      groupRef.current.rotation.y = Math.atan2(7.0 - 5.0, 3.5 - 2.5);
      
      const time = state.clock.getElapsedTime();
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.x = Math.sin(time * 2) * 0.1;
        rightArmRef.current.rotation.x = -Math.sin(time * 2) * 0.1;
      }
    }
  });

  useEffect(() => {
    if (!visible || !chapter2Approved || isWalking) return;
    
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
    }, 5000); // 5 seconds per line for readability
    
    return () => clearInterval(interval);
  }, [visible, chapter2Approved, isWalking]);

  if (!visible) return null;
  
  const currentLine = ARCHITECT_LINES[lineIndex];

  return (
    <group ref={groupRef} position={startPos}>
      <group scale={0.6}>
        {/* 1. HEAD, HAIR & FACE */}
        <group position={[0, 2.1, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.4, 0.4, 0.4]} />
            <meshToonMaterial color="#ffdbac" />
          </mesh>
          <mesh position={[0, 0.2, 0.02]} castShadow>
            <boxGeometry args={[0.42, 0.12, 0.42]} />
            <meshToonMaterial color="#2b2b2b" />
          </mesh>
          <mesh position={[-0.08, 0.05, 0.201]} castShadow>
            <boxGeometry args={[0.04, 0.04, 0.02]} />
            <meshToonMaterial color="#1a1a1a" />
          </mesh>
          <mesh position={[0.08, 0.05, 0.201]} castShadow>
            <boxGeometry args={[0.04, 0.04, 0.02]} />
            <meshToonMaterial color="#1a1a1a" />
          </mesh>
          <mesh position={[0, -0.02, 0.21]} castShadow>
            <boxGeometry args={[0.04, 0.06, 0.04]} />
            <meshToonMaterial color="#e0c09a" />
          </mesh>
          <mesh position={[0, -0.1, 0.201]} castShadow>
            <boxGeometry args={[0.1, 0.02, 0.02]} />
            <meshToonMaterial color="#3a2a1a" />
          </mesh>
          <mesh position={[-0.21, 0, 0]} castShadow>
            <boxGeometry args={[0.04, 0.1, 0.1]} />
            <meshToonMaterial color="#ffdbac" />
          </mesh>
          <mesh position={[0.21, 0, 0]} castShadow>
            <boxGeometry args={[0.04, 0.1, 0.1]} />
            <meshToonMaterial color="#ffdbac" />
          </mesh>
        </group>

        {/* 2. TORSO / SHIRT */}
        <mesh position={[0, 1.4, 0]} castShadow>
          <boxGeometry args={[0.6, 0.8, 0.3]} />
          <meshToonMaterial color="#d0d0d0" />
        </mesh>

        {/* 3. LEGS (Pants) */}
        <mesh position={[-0.18, 0.5, 0]} castShadow>
          <boxGeometry args={[0.2, 1.0, 0.25]} />
          <meshToonMaterial color="#3b3b3b" />
        </mesh>
        <mesh position={[0.18, 0.5, 0]} castShadow>
          <boxGeometry args={[0.2, 1.0, 0.25]} />
          <meshToonMaterial color="#3b3b3b" />
        </mesh>

        {/* 4. ARMS */}
        <group ref={leftArmRef} position={[-0.4, 1.7, 0]}>
          <mesh position={[0, -0.3, 0]} castShadow>
            <boxGeometry args={[0.18, 0.7, 0.2]} />
            <meshToonMaterial color="#d0d0d0" />
          </mesh>
        </group>
        <group ref={rightArmRef} position={[0.4, 1.7, 0]}>
          <mesh position={[0, -0.3, 0]} castShadow>
            <boxGeometry args={[0.18, 0.7, 0.2]} />
            <meshToonMaterial color="#d0d0d0" />
          </mesh>
        </group>
      </group>
      
      {/* Label */}
      <Html position={[0, 2.8, 0]} center style={{ pointerEvents: 'none' }}>
        <div style={{ color: '#ffffff', fontFamily: 'monospace', fontSize: '10px', letterSpacing: '2px', opacity: 0.7, textShadow: '0 0 4px #000' }}>
          ARCHITECT
        </div>
      </Html>
      
      {/* Speech Bubble */}
      {chapter2Approved && !showButtons && architectOutcome === 'none' && (
        <Html position={[0, 3.2, 0]} center style={{ pointerEvents: 'none' }}>
          <div style={{
            background: 'rgba(0,0,0,0.85)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: '#fff',
            padding: '12px 20px',
            fontFamily: 'monospace',
            fontSize: '14px',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            borderRadius: '4px'
          }}>
            {currentLine}
          </div>
        </Html>
      )}

      {/* YES / NO Buttons */}
      {showButtons && architectOutcome === 'none' && chapter2Approved && (
        <Html position={[0, 3.2, 0]} center>
          <div style={{ display: 'flex', gap: '20px' }}>
            <button 
              onClick={() => onClose('yes')}
              style={{ background: 'rgba(0,255,0,0.1)', border: '1px solid #0f0', color: '#0f0', padding: '8px 20px', fontFamily: 'monospace', cursor: 'pointer', letterSpacing: '2px' }}
            >YES</button>
            <button 
              onClick={() => onClose('no')}
              style={{ background: 'rgba(255,0,0,0.1)', border: '1px solid #f00', color: '#f00', padding: '8px 20px', fontFamily: 'monospace', cursor: 'pointer', letterSpacing: '2px' }}
            >NO</button>
          </div>
        </Html>
      )}
    </group>
  );
};

export default ArchitectFigure;
