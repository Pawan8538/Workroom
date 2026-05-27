import React, { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const TheArchivist = () => {
  const lightRef = useRef();
  const [isHovered, setIsHovered] = useState(false);
  const [targetIntensity, setTargetIntensity] = useState(2.0); // Base intensity 2.0

  useEffect(() => {
    let timeoutId;
    const triggerFlicker = () => {
      // Randomly change intensity for a flicker effect
      setTargetIntensity(1.0 + Math.random() * 1.5);
      
      // Delay: 8 to 12 seconds normally, 0.1 to 0.4 seconds if hovered
      const delay = isHovered 
        ? 100 + Math.random() * 300 
        : 8000 + Math.random() * 4000;
        
      timeoutId = setTimeout(triggerFlicker, delay);
    };
    
    timeoutId = setTimeout(triggerFlicker, 1000);
    return () => clearTimeout(timeoutId);
  }, [isHovered]);

  useFrame(() => {
    if (lightRef.current) {
      // Lerp for a smoother bulb-like transition
      lightRef.current.intensity += (targetIntensity - lightRef.current.intensity) * 0.3;
    }
  });

  return (
    <group position={[-8, 0, 6]}>
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

      {/* Frosted Glass Front */}
      <mesh position={[0, 1.5, 2]} receiveShadow castShadow>
        <boxGeometry args={[4, 3, 0.1]} />
        <meshStandardMaterial 
          color="#110000" 
          transparent={true} 
          opacity={0.4} 
          roughness={0.9} 
          metalness={0.1} 
        />
      </mesh>
      
      {/* Dark Roof */}
      <mesh position={[0, 3.05, 0]} receiveShadow castShadow>
        <boxGeometry args={[4.2, 0.1, 4.2]} />
        <meshStandardMaterial color="#050505" />
      </mesh>

      {/* Internal Red Light source bleeding out */}
      <pointLight 
        ref={lightRef} 
        position={[0, 1.5, 0]} 
        color="#ff0044" 
        distance={10} 
        intensity={2.0} 
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
