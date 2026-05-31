// ─────────────────────────────────────────────────────────────
// client/src/components/Office/ArchitectFigure.jsx
// The Architect — 3D figure that emerges from the Archivist room
// and walks to the Observer desk after the fourth wall sequence.
// ─────────────────────────────────────────────────────────────

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

// Archivist room center position
const ARCHIVIST_POS = new THREE.Vector3(-8, 0, 6);
// Observer desk sitting position (in front of Observer desk at [0,0,3])
const OBSERVER_DESK_POS = new THREE.Vector3(0, 0, 4.2);

const WALK_SPEED = 0.025; // lerp factor per frame — slow, deliberate walk

// ── Simple humanoid figure (low-poly) ──
const HumanoidFigure = ({ isSeated, color }) => {
  // Idle bob animation ref
  const groupRef = useRef();
  const bobPhase = useRef(Math.random() * Math.PI * 2);

  useFrame(({ clock }) => {
    if (!groupRef.current || isSeated) return;
    const t = clock.getElapsedTime() + bobPhase.current;
    groupRef.current.position.y = Math.sin(t * 1.8) * 0.04;
  });

  const bodyColor = color || '#1a1a2e';
  const headColor = '#c8a882';

  if (isSeated) {
    // Seated pose — torso upright, legs horizontal
    return (
      <group ref={groupRef}>
        {/* Head */}
        <mesh position={[0, 1.55, 0]} castShadow>
          <boxGeometry args={[0.28, 0.3, 0.28]} />
          <meshStandardMaterial color={headColor} roughness={0.6} />
        </mesh>
        {/* Neck */}
        <mesh position={[0, 1.35, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.12, 8]} />
          <meshStandardMaterial color={headColor} roughness={0.6} />
        </mesh>
        {/* Torso */}
        <mesh position={[0, 1.0, 0]} castShadow>
          <boxGeometry args={[0.42, 0.6, 0.22]} />
          <meshStandardMaterial color={bodyColor} roughness={0.7} />
        </mesh>
        {/* Left Arm — down */}
        <mesh position={[-0.28, 0.9, 0.05]} rotation={[0.2, 0, 0.1]} castShadow>
          <boxGeometry args={[0.12, 0.45, 0.12]} />
          <meshStandardMaterial color={bodyColor} roughness={0.7} />
        </mesh>
        {/* Right Arm — down */}
        <mesh position={[0.28, 0.9, 0.05]} rotation={[0.2, 0, -0.1]} castShadow>
          <boxGeometry args={[0.12, 0.45, 0.12]} />
          <meshStandardMaterial color={bodyColor} roughness={0.7} />
        </mesh>
        {/* Left Thigh — forward */}
        <mesh position={[-0.12, 0.65, 0.3]} rotation={[-Math.PI / 2.2, 0, 0]} castShadow>
          <boxGeometry args={[0.14, 0.4, 0.14]} />
          <meshStandardMaterial color={bodyColor} roughness={0.7} />
        </mesh>
        {/* Right Thigh — forward */}
        <mesh position={[0.12, 0.65, 0.3]} rotation={[-Math.PI / 2.2, 0, 0]} castShadow>
          <boxGeometry args={[0.14, 0.4, 0.14]} />
          <meshStandardMaterial color={bodyColor} roughness={0.7} />
        </mesh>
        {/* Left Lower Leg — down */}
        <mesh position={[-0.12, 0.35, 0.55]} castShadow>
          <boxGeometry args={[0.12, 0.35, 0.12]} />
          <meshStandardMaterial color={bodyColor} roughness={0.7} />
        </mesh>
        {/* Right Lower Leg — down */}
        <mesh position={[0.12, 0.35, 0.55]} castShadow>
          <boxGeometry args={[0.12, 0.35, 0.12]} />
          <meshStandardMaterial color={bodyColor} roughness={0.7} />
        </mesh>
      </group>
    );
  }

  // Standing / walking pose
  return (
    <group ref={groupRef}>
      {/* Head */}
      <mesh position={[0, 1.75, 0]} castShadow>
        <boxGeometry args={[0.28, 0.3, 0.28]} />
        <meshStandardMaterial color={headColor} roughness={0.6} />
      </mesh>
      {/* Neck */}
      <mesh position={[0, 1.55, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 0.12, 8]} />
        <meshStandardMaterial color={headColor} roughness={0.6} />
      </mesh>
      {/* Torso */}
      <mesh position={[0, 1.15, 0]} castShadow>
        <boxGeometry args={[0.42, 0.65, 0.22]} />
        <meshStandardMaterial color={bodyColor} roughness={0.7} />
      </mesh>
      {/* Left Arm */}
      <mesh position={[-0.28, 0.95, 0]} castShadow>
        <boxGeometry args={[0.12, 0.55, 0.12]} />
        <meshStandardMaterial color={bodyColor} roughness={0.7} />
      </mesh>
      {/* Right Arm */}
      <mesh position={[0.28, 0.95, 0]} castShadow>
        <boxGeometry args={[0.12, 0.55, 0.12]} />
        <meshStandardMaterial color={bodyColor} roughness={0.7} />
      </mesh>
      {/* Left Leg */}
      <mesh position={[-0.12, 0.45, 0]} castShadow>
        <boxGeometry args={[0.14, 0.6, 0.14]} />
        <meshStandardMaterial color={bodyColor} roughness={0.7} />
      </mesh>
      {/* Right Leg */}
      <mesh position={[0.12, 0.45, 0]} castShadow>
        <boxGeometry args={[0.14, 0.6, 0.14]} />
        <meshStandardMaterial color={bodyColor} roughness={0.7} />
      </mesh>
    </group>
  );
};

// ── Main ArchitectFigure ──
const ArchitectFigure = ({ visible, isSeated, onArrivedAtDesk, architectOutcome }) => {
  const figureGroupRef = useRef();
  const [hasArrived, setHasArrived] = useState(false);
  const arrivedFiredRef = useRef(false);

  // Start at Archivist room position
  const currentPos = useRef(ARCHIVIST_POS.clone());
  const targetPos = useRef(ARCHIVIST_POS.clone());

  // When visible becomes true, begin walk
  useEffect(() => {
    if (visible) {
      // Small delay before starting walk (door opens first)
      const t = setTimeout(() => {
        targetPos.current = OBSERVER_DESK_POS.clone();
      }, 800);
      return () => clearTimeout(t);
    }
  }, [visible]);

  useFrame(() => {
    if (!figureGroupRef.current || !visible) return;

    // Lerp toward target
    currentPos.current.lerp(targetPos.current, WALK_SPEED);
    figureGroupRef.current.position.copy(currentPos.current);

    // Face direction of travel
    const diff = targetPos.current.clone().sub(currentPos.current);
    if (diff.length() > 0.05) {
      const angle = Math.atan2(diff.x, diff.z);
      figureGroupRef.current.rotation.y = THREE.MathUtils.lerp(
        figureGroupRef.current.rotation.y,
        angle,
        0.1
      );
    }

    // Check arrival
    const distToDesk = currentPos.current.distanceTo(OBSERVER_DESK_POS);
    if (distToDesk < 0.3 && !hasArrived) {
      setHasArrived(true);
      if (!arrivedFiredRef.current) {
        arrivedFiredRef.current = true;
        onArrivedAtDesk && onArrivedAtDesk();
      }
    }
  });

  if (!visible) return null;

  return (
    <group ref={figureGroupRef} position={[ARCHIVIST_POS.x, ARCHIVIST_POS.y, ARCHIVIST_POS.z]}>
      {/* The figure itself */}
      <HumanoidFigure isSeated={isSeated && hasArrived} color="#0a0a18" />

      {/* Name tag — always "ARCHITECT", rendered above the figure */}
      <Html
        transform={false}
        position={[0, 2.4, 0]}
        distanceFactor={10}
        style={{ pointerEvents: 'none' }}
        center
      >
        <div style={{
          background: 'rgba(0,0,0,0.85)',
          color: '#ffffff',
          fontFamily: 'monospace',
          fontSize: '11px',
          letterSpacing: '3px',
          padding: '3px 10px',
          border: '1px solid rgba(255,255,255,0.3)',
          whiteSpace: 'nowrap',
          userSelect: 'none',
          textShadow: '0 0 8px rgba(255,255,255,0.5)',
        }}>
          ARCHITECT
        </div>
      </Html>
    </group>
  );
};

export default ArchitectFigure;
