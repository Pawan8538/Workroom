import React, { useState, useEffect, useRef } from 'react';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { ARCHITECT_LINES } from '../../constants/ARCHITECT_SCRIPT';

const ArchitectFigure = ({ visible, architectOutcome, onClose, chapter2Approved, onArchitectArrivedAtDesk, onSpeechEnd }) => {
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
  const [currentPosStr, setCurrentPosStr] = useState(startPos.join(','));
  const posRef = useRef(startPos);
  const [hasArrived, setHasArrived] = useState(false);
  
  // Initialize walking when visible
  useEffect(() => {
    if (visible && !isWalking && posRef.current[0] === startPos[0]) {
      setIsWalking(true);
    }
  }, [visible]);

  useEffect(() => {
    if (isWalking && window.__workroom_sound && window.__workroom_sound.playArchitectWalk) {
      window.__workroom_sound.playArchitectWalk();
    } else if (!isWalking && window.__workroom_sound && window.__workroom_sound.stopArchitectWalk) {
      window.__workroom_sound.stopArchitectWalk();
    }
    return () => {
      if (window.__workroom_sound && window.__workroom_sound.stopArchitectWalk) {
        window.__workroom_sound.stopArchitectWalk();
      }
    };
  }, [isWalking]);

  useFrame((state, delta) => {
    if (!visible || !groupRef.current) return;
    
    if (isWalking && waypointIndex < waypoints.length) {
      const speed = 2.0 * delta;
      const target = waypoints[waypointIndex];
      const curPos = posRef.current;
      const dx = target[0] - curPos[0];
      const dz = target[2] - curPos[2];
      const dist = Math.sqrt(dx * dx + dz * dz);
      
      let nextPos;
      if (dist < 0.1) {
        nextPos = target;
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
        const nx = curPos[0] + (dx / dist) * speed;
        const nz = curPos[2] + (dz / dist) * speed;
        nextPos = [nx, curPos[1], nz];
        
        // Orient towards target
        const angle = Math.atan2(dx, dz);
        groupRef.current.rotation.y = angle;
      }
      
      posRef.current = nextPos;
      groupRef.current.position.set(nextPos[0], nextPos[1], nextPos[2]);

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

  const hasStartedSpeech = useRef(false);
  const onSpeechEndRef = useRef(onSpeechEnd);
  
  useEffect(() => {
    onSpeechEndRef.current = onSpeechEnd;
  }, [onSpeechEnd]);

  useEffect(() => {
    if (!visible || chapter2Approved !== true || isWalking) return;
    if (hasStartedSpeech.current) return;
    
    hasStartedSpeech.current = true;
    setLineIndex(0);
    setShowButtons(false);
    
    let isCancelled = false;
    let currentAudio = null;
    let timeoutId = null;

    const playNextLine = (index) => {
      if (isCancelled) return;
      
      if (index >= ARCHITECT_LINES.length) {
        if (onSpeechEndRef.current) onSpeechEndRef.current();
        timeoutId = setTimeout(() => setShowButtons(true), 1500);
        return;
      }
      
      setLineIndex(index);
      
      const audio = new Audio(`/Architect/line_${index + 1}.mp3`);
      currentAudio = audio;
      
      const pauseDuration = 500;
      
      const onEnded = () => {
        if (isCancelled) return;
        timeoutId = setTimeout(() => {
          playNextLine(index + 1);
        }, pauseDuration);
      };

      const onError = () => {
        console.warn(`Audio for line ${index + 1} not found.`);
        timeoutId = setTimeout(() => {
          if (isCancelled) return;
          playNextLine(index + 1);
        }, 5000);
      };

      audio.addEventListener('ended', onEnded);
      audio.addEventListener('error', onError);
      
      audio.play().catch(e => {
        console.error("Audio play failed:", e);
        onError();
      });
    };
    
    timeoutId = setTimeout(() => playNextLine(0), 1000);
    
    return () => {
      isCancelled = true;
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.src = '';
      }
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [visible, chapter2Approved, isWalking]);

  if (!visible) return null;
  
  const currentLine = ARCHITECT_LINES[lineIndex];

  return (
    <group ref={groupRef} position={startPos} visible={visible}>
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
          <meshToonMaterial color="#555555" />
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
            <meshToonMaterial color="#555555" />
          </mesh>
        </group>
        <group ref={rightArmRef} position={[0.4, 1.7, 0]}>
          <mesh position={[0, -0.3, 0]} castShadow>
            <boxGeometry args={[0.18, 0.7, 0.2]} />
            <meshToonMaterial color="#555555" />
          </mesh>
        </group>
      </group>
      
      {/* Label */}
      {chapter2Approved && (
        <Html position={[0, 2.8, 0]} center style={{ pointerEvents: 'none' }}>
          <div style={{ color: '#ffffff', fontFamily: 'monospace', fontSize: '10px', letterSpacing: '2px', opacity: 0.7, textShadow: '0 0 4px #000' }}>
            ARCHITECT
          </div>
        </Html>
      )}
      
      {/* Speech Bubble */}
      {chapter2Approved === true && !showButtons && architectOutcome === 'none' && (
        <Html position={[0, 3.2, 0]} center style={{ pointerEvents: 'none', zIndex: 500 }}>
          <div style={{
            position: 'relative',
            backgroundColor: '#0a0a0f',
            border: '1px solid #444',
            color: '#fff',
            fontFamily: 'monospace',
            fontSize: '11px',
            padding: '8px 12px',
            maxWidth: '280px',
            width: 'max-content',
            textAlign: 'center',
            wordWrap: 'break-word',
            borderRadius: '4px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            transform: 'translateY(-16px)', // Float slightly above
          }}>
            {currentLine}
            
            {/* Outer Triangle (Border) */}
            <div
              style={{
                position: 'absolute',
                bottom: '-6px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: '6px solid #444',
              }}
            />
            {/* Inner Triangle (Background) */}
            <div
              style={{
                position: 'absolute',
                bottom: '-5px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '5px solid transparent',
                borderRight: '5px solid transparent',
                borderTop: '5px solid #0a0a0f',
              }}
            />
          </div>
        </Html>
      )}

      {/* YES / NO Buttons */}
      {showButtons && architectOutcome === 'none' && chapter2Approved === true && (
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
