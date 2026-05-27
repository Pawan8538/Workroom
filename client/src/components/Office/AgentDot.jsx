// ─────────────────────────────────────────────────────────────
// client/src/components/Office/AgentDot.jsx
// Single reusable agent component for the 3D office canvas
// ─────────────────────────────────────────────────────────────

import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html, Line } from '@react-three/drei';
import * as THREE from 'three';

import { OFFICE_BOUNDS } from '../../constants/OFFICE_LAYOUT';

const AgentDot = ({ name, role, color, symbol, x, y, status, task, isSelected, onClick, isFrozen }) => {
  const meshRef = useRef();
  const ringRef = useRef();
  const glowRef = useRef();
  
  const clampedX = useMemo(() => Math.max(OFFICE_BOUNDS.minX, Math.min(OFFICE_BOUNDS.maxX, x)), [x]);
  const clampedZ = useMemo(() => Math.max(OFFICE_BOUNDS.minZ, Math.min(OFFICE_BOUNDS.maxZ, y)), [y]);

  // Hardcoded territory waypoints (no external imports)
  const waypoints = useMemo(() => {
    const upperName = name ? name.toUpperCase() : '';
    if (upperName === 'ARIA') {
      return [
        { x: -6, z: -5 },
        { x: -4, z: -4 }
      ];
    } else if (upperName === 'KAEL') {
      return [
        { x: 0, z: 0 },
        { x: 1, z: 1 }
      ];
    } else if (upperName === 'ZENO') {
      return [
        { x: 6, z: -4 },
        { x: 5, z: -3 }
      ];
    }
    return [{ x: clampedX, z: clampedZ }];
  }, [name, clampedX, clampedZ]);

  const [currentWaypoint, setCurrentWaypoint] = useState(() => waypoints[0] || { x: clampedX, z: clampedZ });

  // Periodically pick a random waypoint from territory list every 5 seconds
  useEffect(() => {
    if (status === 'meeting') return;

    const timerId = setInterval(() => {
      if (waypoints.length > 0) {
        const nextWp = waypoints[Math.floor(Math.random() * waypoints.length)];
        setCurrentWaypoint(nextWp);
      }
    }, 5000);

    return () => clearInterval(timerId);
  }, [waypoints, status]);

  // Target position uses props if in a meeting, otherwise the local territory waypoint
  const targetX = useMemo(() => {
    const rawX = status === 'meeting' ? clampedX : currentWaypoint.x;
    return Math.max(OFFICE_BOUNDS.minX, Math.min(OFFICE_BOUNDS.maxX, rawX));
  }, [status, clampedX, currentWaypoint.x]);

  const targetZ = useMemo(() => {
    const rawZ = status === 'meeting' ? clampedZ : currentWaypoint.z;
    return Math.max(OFFICE_BOUNDS.minZ, Math.min(OFFICE_BOUNDS.maxZ, rawZ));
  }, [status, clampedZ, currentWaypoint.z]);

  const targetPos = useMemo(() => new THREE.Vector3(targetX, 0.5, targetZ), [targetX, targetZ]);
  const currentPos = useRef(new THREE.Vector3(clampedX, 0.5, clampedZ));
  
  // ── Dotted trail history ──
  const [trail, setTrail] = useState([new THREE.Vector3(clampedX, 0.5, clampedZ)]);

  useEffect(() => {
    setTrail(prev => {
      const newTrail = [...prev, targetPos];
      if (newTrail.length > 5) newTrail.shift();
      return newTrail;
    });
  }, [clampedX, clampedZ, targetPos]);

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
      {/* ── Dotted Trail ── */}
      {trail.length > 1 && (
        <Line 
          points={trail.map(p => [p.x, 0.05, p.z])} 
          color={color} 
          lineWidth={2}
          dashed={true}
          dashSize={0.2}
          gapSize={0.2}
          opacity={0.4}
          transparent
        />
      )}

      {/* ── The Agent Mesh ── */}
      <group ref={meshRef} onClick={onClick}>
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

        {/* ── Monospace Name Tag (Removed to prevent OrthographicCamera scale issues) ── */}
        {/*
        <Html distanceFactor={15} position={[0, -0.4, 0]} center style={{ transition: 'opacity 0.5s' }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            pointerEvents: 'none'
          }}>
            <div style={{
              color: isFrozen ? '#ff3333' : color,
              fontFamily: 'monospace',
              fontSize: '10px',
              fontWeight: 'bold',
              letterSpacing: '1px',
              textShadow: `0 0 5px ${isFrozen ? '#ff3333' : color}`,
              transition: 'all 0.4s ease',
              textTransform: 'uppercase',
            }}>
              [{name}]
            </div>
          </div>
        </Html>
        */}
      </group>
    </group>
  );
};

export default AgentDot;
