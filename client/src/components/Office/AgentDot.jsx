// ─────────────────────────────────────────────────────────────
// client/src/components/Office/AgentDot.jsx
// Single reusable agent component for the 3D office canvas
// ─────────────────────────────────────────────────────────────

import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html, Line } from '@react-three/drei';
import * as THREE from 'three';

import { OFFICE_BOUNDS } from '../../constants/OFFICE_LAYOUT';

const AgentDot = ({ name, role, color, symbol, x, y, status, task, isSelected, onClick, isFrozen, overrideX, overrideZ }) => {
  const meshRef = useRef();
  const ringRef = useRef();
  const glowRef = useRef();
  
  const clampedX = useMemo(() => Math.max(OFFICE_BOUNDS.minX, Math.min(OFFICE_BOUNDS.maxX, x)), [x]);
  const clampedZ = useMemo(() => Math.max(OFFICE_BOUNDS.minZ, Math.min(OFFICE_BOUNDS.maxZ, y)), [y]);

  // Hardcoded territory waypoints (no external imports)
  const waypoints = useMemo(() => {
    const upperName = name ? name.toUpperCase() : '';
    if (upperName === 'ARIA') {
      // FIX 2: Cabin moved to x:-7. Desk inside at world z:-7. Stand inside cabin near PC.
      // Cabin front opens at z:-4 area. Standing inside = z:-5.5 facing her monitor.
      return [
        { x: -7, z: -5.5 },
        { x: -6.5, z: -5.5 }
      ];
    } else if (upperName === 'KAEL') {
      // KAEL desk at KAEL.home=[0,0,0]. Stand in front = z:+1.5
      return [
        { x: 0, z: 1.5 },
        { x: 1, z: 1.5 }
      ];
    } else if (upperName === 'ZENO') {
      // ZENO desk at [6,0,-4]. Standing in front at z:-2.5 (right side, near clock wall)
      return [
        { x: 7, z: -2.5 },
        { x: 6.5, z: -2.5 }
      ];
    }
    return [{ x: clampedX, z: clampedZ }];
  }, [name, clampedX, clampedZ]);

  const currentWaypoint = waypoints[0] || { x: clampedX, z: clampedZ };

  // Target position: override (meeting chairs) takes priority, otherwise use territory waypoint
  // NOTE: deliberately ignoring status==='meeting' here — meeting positions are fully driven
  // by overrideX/Z props passed from OfficeCanvas. Without this, ZENO went to his socket
  // position (near KAEL) instead of his waypoint after meeting ended.
  const targetX = useMemo(() => {
    if (overrideX !== undefined && overrideX !== null) return overrideX;
    return Math.max(OFFICE_BOUNDS.minX, Math.min(OFFICE_BOUNDS.maxX, currentWaypoint.x));
  }, [currentWaypoint.x, overrideX]);

  const targetZ = useMemo(() => {
    if (overrideZ !== undefined && overrideZ !== null) return overrideZ;
    return Math.max(OFFICE_BOUNDS.minZ, Math.min(OFFICE_BOUNDS.maxZ, currentWaypoint.z));
  }, [currentWaypoint.z, overrideZ]);

  const targetPos = useMemo(() => new THREE.Vector3(targetX, 0.6, targetZ), [targetX, targetZ]);
  const currentPos = useRef(new THREE.Vector3(clampedX, 0.6, clampedZ));
  
  // ── Access the camera for "face the screen" behavior ──
  const { camera } = useThree();

  const isHidden = status === 'hidden';

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    if (isFrozen) {
      const lookTarget = new THREE.Vector3();
      camera.getWorldPosition(lookTarget);
      lookTarget.y = meshRef.current.position.y;
      meshRef.current.lookAt(lookTarget);

      if (glowRef.current) glowRef.current.intensity = 1.5;
      if (ringRef.current) {
        ringRef.current.scale.set(1.4, 1.4, 1.4);
        ringRef.current.material.opacity = 0.6;
      }
      return;
    }

    // ── Normal behavior ─────────────────────────────────
    currentPos.current.lerp(targetPos, 0.05);
    meshRef.current.position.copy(currentPos.current);

    const time = state.clock.getElapsedTime();
    meshRef.current.position.y += Math.sin(time * 2 + x) * 0.002;

    if (ringRef.current) {
      ringRef.current.scale.setScalar(1 + Math.sin(time * 3) * 0.1);
      ringRef.current.rotation.x = Math.PI / 2;
    }

    if (glowRef.current) {
      glowRef.current.intensity = isSelected ? 2.0 : 1.5 + Math.sin(time * 4) * 0.1;
    }
  });

  if (isHidden) return null;

  return (
    <group>
      {/* ── The Agent Mesh ── */}
      <group 
        ref={meshRef} 
        onClick={onClick}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
        onPointerOut={(e) => { document.body.style.cursor = 'auto'; }}
      >
        {/* Head */}
        <mesh position={[0, 0.55, 0]} castShadow>
          <boxGeometry args={[0.3, 0.3, 0.3]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} roughness={0.2} />
        </mesh>
        {/* Body */}
        <mesh position={[0, 0.15, 0]} castShadow>
          <boxGeometry args={[0.3, 0.5, 0.2]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} roughness={0.2} />
        </mesh>
        {/* Left Arm */}
        <mesh position={[-0.2, 0.2, 0]} castShadow>
          <boxGeometry args={[0.1, 0.4, 0.1]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} roughness={0.2} />
        </mesh>
        {/* Right Arm */}
        <mesh position={[0.2, 0.2, 0]} castShadow>
          <boxGeometry args={[0.1, 0.4, 0.1]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} roughness={0.2} />
        </mesh>
        {/* Left Leg */}
        <mesh position={[-0.1, -0.3, 0]} castShadow>
          <boxGeometry args={[0.1, 0.4, 0.1]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} roughness={0.2} />
        </mesh>
        {/* Right Leg */}
        <mesh position={[0.1, -0.3, 0]} castShadow>
          <boxGeometry args={[0.1, 0.4, 0.1]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} roughness={0.2} />
        </mesh>
        
        <pointLight ref={glowRef} color={color} distance={3} intensity={1.5} />

        {/* ── Pulsing Ring ── */}
        <mesh ref={ringRef} position={[0, -0.5, 0]}>
          <ringGeometry args={[0.2, 0.22, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>

        <Html transform={false} center position={[0, 2.2, 0]} style={{ pointerEvents: 'none' }}>
          <div style={{
            color: color,
            fontFamily: 'monospace',
            fontSize: '8px',
            textShadow: `0 0 4px ${color}`,
            whiteSpace: 'nowrap'
          }}>
            {name}
          </div>
        </Html>
      </group>
    </group>
  );
};

export default AgentDot;
