// ─────────────────────────────────────────────────────────────
// client/src/components/Office/AgentDot.jsx
// Single reusable agent component for the 3D office canvas
// ─────────────────────────────────────────────────────────────

import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html, Line } from '@react-three/drei';
import * as THREE from 'three';

import { OFFICE_BOUNDS } from '../../constants/OFFICE_LAYOUT';

const AgentDot = ({ name, role, color, symbol, x, y, status, task, isSelected, onClick, isFrozen, overrideX, overrideZ, overrideLookAt }) => {
  const meshRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  
  const clampedX = useMemo(() => Math.max(OFFICE_BOUNDS.minX, Math.min(OFFICE_BOUNDS.maxX, x)), [x]);
  const clampedZ = useMemo(() => Math.max(OFFICE_BOUNDS.minZ, Math.min(OFFICE_BOUNDS.maxZ, y)), [y]);

  const upperName = name ? name.toUpperCase() : '';

  // Customize based on gender and nature
  let hairColor = "#5a3d28";
  let skinColor = "#ffdbac";
  let pantsColor = "#2b2b2b";
  let noseColor = "#e0c09a";
  let hasBeard = false;
  let hasGlasses = false;
  let isFemale = false;

  if (upperName === 'ARIA') {
    isFemale = true;
    hairColor = "#2a1a10"; // Dark hair
    skinColor = "#ffdbac";
    pantsColor = "#3b4b5b"; // Dark blue pants
    noseColor = "#e0c09a";
  } else if (upperName === 'KAEL') {
    hairColor = "#4a3a2a";
    skinColor = "#f0c8a0";
    noseColor = "#d8b088";
    hasGlasses = false;
  } else if (upperName === 'ZENO') {
    hairColor = "#3b2b1b"; // Younger brown hair
    skinColor = "#f5d0b5";
    noseColor = "#e5c0a5";
    hasBeard = false;
    pantsColor = "#1a1a1a";
  }

  // Hardcoded territory waypoints (no external imports)
  const waypoints = useMemo(() => {
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

  const targetPos = useMemo(() => new THREE.Vector3(targetX, 0, targetZ), [targetX, targetZ]);
  const currentPos = useRef(new THREE.Vector3(clampedX, 0, clampedZ));
  
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

      // EFFECT: Hands on head (freaking out / freezing)
      if (leftArmRef.current && rightArmRef.current) {
        // Rotate arms forward and up, angled inwards towards the head
        leftArmRef.current.rotation.x = Math.PI / 1.2;
        leftArmRef.current.rotation.z = -Math.PI / 6;
        
        rightArmRef.current.rotation.x = Math.PI / 1.2;
        rightArmRef.current.rotation.z = Math.PI / 6;
      }
      
      // The agent freezes and looks at the camera — no jitter
      return;
    }

    // Reset scale if recovering from glitch
    meshRef.current.scale.lerp(new THREE.Vector3(0.6, 0.6, 0.6), 0.1);

    // ── Glancing behavior ─────────────────────────────────
    if (overrideLookAt) {
      const target = new THREE.Vector3(overrideLookAt.x, meshRef.current.position.y, overrideLookAt.z);
      meshRef.current.lookAt(target);
    } else {
      // Look towards movement direction
      const moveDelta = new THREE.Vector3().subVectors(targetPos, currentPos.current);
      if (moveDelta.lengthSq() > 0.001) {
        const lookTarget = new THREE.Vector3().copy(currentPos.current).add(moveDelta.normalize());
        lookTarget.y = meshRef.current.position.y;
        meshRef.current.lookAt(lookTarget);
      } else {
        // Idle: look at their monitor/desk
        if (upperName === 'KAEL') {
          meshRef.current.lookAt(new THREE.Vector3(0, meshRef.current.position.y, 0));
        } else if (upperName === 'ZENO') {
          meshRef.current.lookAt(new THREE.Vector3(6, meshRef.current.position.y, -4));
        } else if (upperName === 'ARIA') {
          meshRef.current.lookAt(new THREE.Vector3(-7, meshRef.current.position.y, -7));
        }
      }
    }

    // ── Normal behavior ─────────────────────────────────
    currentPos.current.lerp(targetPos, 0.05);
    meshRef.current.position.copy(currentPos.current);

    const time = state.clock.getElapsedTime();

    // Determine if walking by checking movement delta length
    const isWalking = typeof moveDelta !== 'undefined' && moveDelta.lengthSq() > 0.001;

    // Arm swing animation
    if (leftArmRef.current && rightArmRef.current) {
      // Reset the inward z-rotation from the 'hands on head' freeze effect
      leftArmRef.current.rotation.z = 0;
      rightArmRef.current.rotation.z = 0;

      if (isWalking) {
        // Brisk swing while walking
        leftArmRef.current.rotation.x = Math.sin(time * 10) * 0.5;
        rightArmRef.current.rotation.x = -Math.sin(time * 10) * 0.5;
      } else {
        // Gentle swing when idle
        leftArmRef.current.rotation.x = Math.sin(time * 2) * 0.1;
        rightArmRef.current.rotation.x = -Math.sin(time * 2) * 0.1;
      }
    }


  });

  if (isHidden) return null;

  return (
    <group>
      {/* ── The Agent Mesh ── */}
      <group 
        ref={meshRef} 
        scale={0.6}
        onClick={onClick}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
        onPointerOut={(e) => { document.body.style.cursor = 'auto'; }}
      >
        {/* 1. HEAD, HAIR & FACE */}
        <group position={[0, 2.1, 0]}>
          {/* Main Head */}
          <mesh castShadow>
            <boxGeometry args={[0.4, 0.4, 0.4]} />
            <meshToonMaterial color={skinColor} /> {/* Skin tone */}
          </mesh>
          
          {/* Hair */}
          <mesh position={[0, 0.2, 0.02]} castShadow>
            <boxGeometry args={[0.42, 0.12, 0.42]} />
            <meshToonMaterial color={hairColor} /> {/* Hair */}
          </mesh>
          {isFemale && (
            // Long hair at the back
            <mesh position={[0, 0, -0.18]} castShadow>
              <boxGeometry args={[0.42, 0.4, 0.1]} />
              <meshToonMaterial color={hairColor} />
            </mesh>
          )}

          {/* Left Eye */}
          <mesh position={[-0.08, 0.05, 0.201]} castShadow>
            <boxGeometry args={[0.04, 0.04, 0.02]} />
            <meshToonMaterial color="#1a1a1a" />
          </mesh>
          {/* Right Eye */}
          <mesh position={[0.08, 0.05, 0.201]} castShadow>
            <boxGeometry args={[0.04, 0.04, 0.02]} />
            <meshToonMaterial color="#1a1a1a" />
          </mesh>

          {hasGlasses && (
            // Glasses Frame
            <mesh position={[0, 0.05, 0.21]} castShadow>
              <boxGeometry args={[0.26, 0.06, 0.01]} />
              <meshToonMaterial color="#111111" transparent opacity={0.7} />
            </mesh>
          )}

          {/* Nose */}
          <mesh position={[0, -0.02, 0.21]} castShadow>
            <boxGeometry args={[0.04, 0.06, 0.04]} />
            <meshToonMaterial color={noseColor} />
          </mesh>

          {/* Mouth */}
          <mesh position={[0, -0.1, 0.201]} castShadow>
            <boxGeometry args={[0.1, 0.02, 0.02]} />
            <meshToonMaterial color="#3a2a1a" />
          </mesh>

          {hasBeard && (
            // Beard around mouth and jaw
            <mesh position={[0, -0.12, 0.205]} castShadow>
              <boxGeometry args={[0.3, 0.15, 0.04]} />
              <meshToonMaterial color={hairColor} />
            </mesh>
          )}

          {/* Left Ear */}
          <mesh position={[-0.21, 0, 0]} castShadow>
            <boxGeometry args={[0.04, 0.1, 0.1]} />
            <meshToonMaterial color={skinColor} />
          </mesh>
          {/* Right Ear */}
          <mesh position={[0.21, 0, 0]} castShadow>
            <boxGeometry args={[0.04, 0.1, 0.1]} />
            <meshToonMaterial color={skinColor} />
          </mesh>
        </group>

        {/* 2. TORSO / SHIRT */}
        <mesh position={[0, 1.4, 0]} castShadow>
          <boxGeometry args={[0.6, 0.8, 0.3]} />
          <meshToonMaterial color={color || "#4a3728"} />
        </mesh>

        {/* 3. LEGS (Pants) */}
        {/* Left Leg */}
        <mesh position={[-0.18, 0.5, 0]} castShadow>
          <boxGeometry args={[0.2, 1.0, 0.25]} />
          <meshToonMaterial color={pantsColor} />
        </mesh>
        {/* Right Leg */}
        <mesh position={[0.18, 0.5, 0]} castShadow>
          <boxGeometry args={[0.2, 1.0, 0.25]} />
          <meshToonMaterial color={pantsColor} />
        </mesh>

        {/* 4. ARMS */}
        {/* Left Arm */}
        <group ref={leftArmRef} position={[-0.4, 1.7, 0]}>
          <mesh position={[0, -0.3, 0]} castShadow>
            <boxGeometry args={[0.18, 0.7, 0.2]} />
            <meshToonMaterial color={color || "#4a3728"} />
          </mesh>
        </group>
        {/* Right Arm */}
        <group ref={rightArmRef} position={[0.4, 1.7, 0]}>
          <mesh position={[0, -0.3, 0]} castShadow>
            <boxGeometry args={[0.18, 0.7, 0.2]} />
            <meshToonMaterial color={color || "#4a3728"} />
          </mesh>
        </group>
        


        <Html transform={false} center position={[0, 2.8, 0]} style={{ pointerEvents: 'none' }} zIndexRange={[100, 0]}>
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
