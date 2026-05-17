// ─────────────────────────────────────────────────────────────
// client/src/components/Office/AgentDot.jsx
// Single reusable agent component for the 3D office canvas
// ─────────────────────────────────────────────────────────────
//
// Renders a glowing sphere with pulsing ring, cinematic name
// tag, smooth lerp movement, and supports the Third Wall Break
// state where the agent freezes and "faces" the camera.
//
// Props:
//   name, role, color, symbol, x, y, status, task,
//   isSelected, onClick, isFrozen (Third Wall Break)
//
// ─────────────────────────────────────────────────────────────

import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

const AgentDot = ({ name, role, color, symbol, x, y, status, task, isSelected, onClick, isFrozen }) => {
  const meshRef = useRef();
  const ringRef = useRef();
  const glowRef = useRef();
  const targetPos = useMemo(() => new THREE.Vector3(x, 0.5, y), [x, y]);
  const currentPos = useRef(new THREE.Vector3(x, 0.5, y));

  // ── Access the camera for "face the screen" behavior ──
  const { camera } = useThree();

  const isHidden = status === 'hidden';

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    if (isFrozen) {
      // ─────────────────────────────────────────────────
      // THIRD WALL BREAK — FROZEN STATE
      // ─────────────────────────────────────────────────
      // The agent stops moving. Completely still.
      // It rotates to face the camera — toward the user,
      // toward the developer, toward whoever is watching.
      //
      // The float animation stops. The pulse stops.
      // Everything about this agent becomes still except
      // for the slow, deliberate turn toward you.
      // ─────────────────────────────────────────────────

      // Face the camera (the screen / the developer)
      const lookTarget = new THREE.Vector3();
      camera.getWorldPosition(lookTarget);
      lookTarget.y = meshRef.current.position.y; // Keep level, don't tilt
      meshRef.current.lookAt(lookTarget);

      // Frozen glow — slight intensity increase to mark the moment
      if (glowRef.current) {
        glowRef.current.intensity = 3.5;
      }

      // Ring freezes at expanded state
      if (ringRef.current) {
        ringRef.current.scale.set(1.4, 1.4, 1.4);
        ringRef.current.material.opacity = 0.6;
      }

      return; // No movement, no float, no normal behavior
    }

    // ── Normal behavior ─────────────────────────────────

    // Smooth position transition (lerp ~2s feel)
    currentPos.current.lerp(targetPos, delta * 1.5);
    meshRef.current.position.copy(currentPos.current);

    // Subtle idle float
    meshRef.current.position.y += Math.sin(state.clock.elapsedTime * 2) * 0.05;

    // Reset rotation to default when not frozen
    meshRef.current.rotation.set(0, 0, 0);

    // Pulsing ring animation
    if (ringRef.current) {
      const time = state.clock.elapsedTime;
      const scale = 1 + Math.sin(time * 3) * 0.3;
      ringRef.current.scale.set(scale, scale, scale);
      ringRef.current.material.opacity = 0.4 * (1 - (scale - 0.7) / 0.6);
    }

    // Normal glow intensity
    if (glowRef.current) {
      glowRef.current.intensity = 2;
    }
  });

  const dotColor = isHidden ? '#0a0a0f' : color;
  const emissiveColor = isHidden ? '#000000' : color;

  return (
    <group onClick={(e) => { e.stopPropagation(); onClick?.(); }}>
      {/* Main Agent Sphere */}
      <mesh ref={meshRef} castShadow>
        <sphereGeometry args={[0.22, 32, 32]} />
        <meshStandardMaterial
          ref={glowRef}
          color={dotColor}
          emissive={emissiveColor}
          emissiveIntensity={isHidden ? 0 : 2}
          transparent={isHidden}
          opacity={isHidden ? 0.3 : 1}
        />

        {/* Pulsing Ring Overlay */}
        {!isHidden && (
          <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.3, 0.38, 32]} />
            <meshBasicMaterial color={color} transparent opacity={0.4} side={THREE.DoubleSide} />
          </mesh>
        )}

        {/* ── Cinematic Name Tag ────────────────────────── */}
        <Html
          distanceFactor={10}
          position={[0, -0.6, 0]}
          center
          style={{ transition: 'opacity 0.5s' }}
        >
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            pointerEvents: 'none'
          }}>
            {/* Name label */}
            <div style={{
              color: isHidden ? 'rgba(255,255,255,0.05)' : (isFrozen ? '#ff3333' : 'white'),
              background: isHidden ? 'transparent' : 'rgba(5, 5, 8, 0.8)',
              backdropFilter: 'blur(4px)',
              padding: '4px 12px',
              borderRadius: '2px',
              fontSize: '11px',
              fontWeight: '500',
              letterSpacing: '1px',
              borderLeft: `2px solid ${isHidden ? 'transparent' : (isFrozen ? '#ff3333' : color)}`,
              boxShadow: isFrozen
                ? '0 0 25px rgba(255, 50, 50, 0.3)'
                : (isSelected ? `0 0 20px ${color}44` : 'none'),
              transition: 'all 0.4s ease',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap'
            }}>
              {name}
            </div>

            {/* Detail line — shows on select OR during freeze */}
            {((isSelected && !isHidden) || isFrozen) && (
              <div style={{
                color: isFrozen ? 'rgba(255, 80, 80, 0.7)' : 'rgba(255,255,255,0.5)',
                fontSize: '9px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontFamily: isFrozen ? 'monospace' : 'inherit',
              }}>
                {isFrozen ? '...' : `${role} • ${task}`}
              </div>
            )}
          </div>
        </Html>
      </mesh>
    </group>
  );
};

export default AgentDot;
