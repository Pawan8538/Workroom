import React, { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const TheArchivist = ({ warmWhite, doorOpen }) => {
  const doorRef = useRef();
  const flickerRef = useRef();
  const [isHovered, setIsHovered] = useState(false);
  const [glassHovered, setGlassHovered] = useState(false);
  const [figureNoticing, setFigureNoticing] = useState(false);
  const noticeTimeoutRef = useRef(null);
  const targetColor = useRef(new THREE.Color('#ff0044'));

  // Clean up timeout
  useEffect(() => {
    return () => {
      if (noticeTimeoutRef.current) clearTimeout(noticeTimeoutRef.current);
    };
  }, []);

  // Update target color when warmWhite changes
  useEffect(() => {
    if (warmWhite) {
      targetColor.current.set('#fff5e0');
    } else {
      targetColor.current.set('#ff0044');
    }
  }, [warmWhite]);

  useFrame(({ clock }) => {
    if (flickerRef.current && !warmWhite) {
      const t = clock.elapsedTime;
      // FIX 8: Dual sine flicker — faster when hovered
      const speed = isHovered ? 4 : 1;
      const flicker = Math.sin(t * 8 * speed) * 0.3 + Math.sin(t * 13 * speed) * 0.2;
      flickerRef.current.intensity = 3.0 + flicker;
    } else if (flickerRef.current && warmWhite) {
      // When warm white: lerp to steady 5.0, no flicker
      flickerRef.current.intensity += (5.0 - flickerRef.current.intensity) * 0.05;
      flickerRef.current.color.lerp(targetColor.current, 0.02);
    }
    if (doorRef.current && doorOpen) {
      doorRef.current.rotation.y = THREE.MathUtils.lerp(doorRef.current.rotation.y, Math.PI / 2, 0.05);
    }
  });

  return (
    <group position={[-8, 0, 5.9]}>
      {/* Solid Walls (Back, Left, Right) */}
      <mesh position={[0, 1.5, -2]} castShadow receiveShadow>
        <boxGeometry args={[4, 3, 0.2]} />
        <meshStandardMaterial color="#110000" roughness={0.9} />
      </mesh>
      <mesh position={[-2, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 3, 4]} />
        <meshStandardMaterial color="#110000" roughness={0.9} />
      </mesh>
      <mesh position={[2, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 3, 4]} />
        <meshStandardMaterial color="#110000" roughness={0.9} />
      </mesh>

      {/* Frosted Glass Front (Door with hinge at left edge) */}
      <group position={[-2, 0, 2]} ref={doorRef}>
        <mesh 
          position={[2, 1.5, 0]} 
          receiveShadow 
          castShadow
          onPointerEnter={(e) => {
            e.stopPropagation();
            setGlassHovered(true);
            setFigureNoticing(true);
            if (noticeTimeoutRef.current) clearTimeout(noticeTimeoutRef.current);
            noticeTimeoutRef.current = setTimeout(() => {
              setFigureNoticing(false);
            }, 2000);
          }}
          onPointerLeave={(e) => {
            e.stopPropagation();
            setGlassHovered(false);
          }}
        >
          <boxGeometry args={[4, 3, 0.1]} />
          <meshStandardMaterial 
            color="#aaccff" 
            transparent={true} 
            opacity={glassHovered ? 0.6 : 0.4} 
            roughness={0.4} 
            metalness={0.8} 
          />
        </mesh>
      </group>

      {/* Faint Silhouette Figure inside (pressed directly against the glass) */}
      <group position={[0, 1.0, 1.75]}>
        {/* Head */}
        <mesh position={[0, 0.7, 0]}>
          <boxGeometry args={[0.4, 0.4, 0.4]} />
          <meshBasicMaterial 
            color="#000000" 
            transparent={true} 
            opacity={figureNoticing ? 0.7 : 0.15} 
          />
        </mesh>
        {/* Body */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.7, 1.0, 0.4]} />
          <meshBasicMaterial 
            color="#000000" 
            transparent={true} 
            opacity={figureNoticing ? 0.7 : 0.15} 
          />
        </mesh>
      </group>
      
      {/* Dark Roof */}
      <mesh position={[0, 3.05, 0]} receiveShadow castShadow>
        <boxGeometry args={[4.2, 0.1, 4.2]} />
        <meshStandardMaterial color="#050505" />
      </mesh>

      {/* Internal Light source bleeding out (moved backwards to cast silhouette forward) */}
      <pointLight 
        ref={flickerRef} 
        position={[0, 1.5, -1.0]} 
        color="#ff0044" 
        distance={10} 
        intensity={3.0} 
      />

      {/* Invisible hover trigger box (slightly larger) */}
      <mesh 
        position={[0, 1.5, 0]} 
        onPointerOver={(e) => { e.stopPropagation(); setIsHovered(true); }}
        onPointerOut={(e) => { e.stopPropagation(); setIsHovered(false); }}
        visible={false}
      >
        <boxGeometry args={[4.5, 3.5, 4.5]} />
        <meshBasicMaterial />
      </mesh>
    </group>
  );
};

export default TheArchivist;
