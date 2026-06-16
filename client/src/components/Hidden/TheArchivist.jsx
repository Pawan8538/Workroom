import React, { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const TheArchivist = ({ warmWhite, doorOpen }) => {
  const flickerRef = useRef();
  const whiteLightRef = useRef();
  const [isHovered, setIsHovered] = useState(false);
  const targetColor = useRef(new THREE.Color('#ff0044'));

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
      // Light is off unless hovered
      if (isHovered) {
        // Normal noticeable rate, highly dense intensity
        const flicker = Math.sin(t * 8) * 3.0 + Math.sin(t * 14) * 2.0;
        flickerRef.current.intensity = Math.max(0, 8.0 + flicker);
      } else {
        flickerRef.current.intensity = 0;
      }
    } else if (flickerRef.current && warmWhite) {
      // When warm white: steady
      flickerRef.current.intensity += (5.0 - flickerRef.current.intensity) * 0.05;
      flickerRef.current.color.lerp(targetColor.current, 0.02);
    }
  });

  const [isFigureVisible, setIsFigureVisible] = useState(false);
  const targetObj = useRef(new THREE.Object3D());
  
  useEffect(() => {
    // Aria's cabin is at ~ [-7, 0, -5.5] globally. 
    // Archivist is at [-8, 0, 5.9]. Relative target: X=1, Y=0, Z=-11.4
    targetObj.current.position.set(1, 0, -11.4);
  }, []);

  return (
    <group position={[-8, 0, 5.9]}>
      
      {/* Spotlight target */}
      <primitive object={targetObj.current} />

      {/* ── RESTORED SOLID WALLS & DOOR ── */}
      {/* Solid Walls (Back, Left, Right) */}
      <mesh position={[0, 1.5, 2]} castShadow receiveShadow>
        <boxGeometry args={[4, 3, 0.2]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      <mesh position={[-2, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 3, 4]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      <mesh position={[2, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 3, 4]} />
        <meshStandardMaterial color="#111111" />
      </mesh>

      {/* Solid Roof */}
      <mesh position={[0, 3.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.2, 0.2, 4.2]} />
        <meshStandardMaterial color="#111111" />
      </mesh>

      {/* Front Wall with door cutout (z = -2) */}
      <mesh position={[-1.4, 1.5, -2]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 3, 0.2]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      <mesh position={[1.4, 1.5, -2]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 3, 0.2]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      {/* Header over door */}
      <mesh position={[0, 2.5, -2]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 1, 0.2]} />
        <meshStandardMaterial color="#111111" />
      </mesh>

      {/* The Door (Hinged on the left side) */}
      <group position={[-0.8, 0, -2]} rotation={[0, doorOpen ? -Math.PI / 1.6 : 0, 0]}>
        <mesh position={[0.8, 1.0, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.6, 2.0, 0.1]} />
          <meshStandardMaterial color="#080808" roughness={0.9} />
        </mesh>
      </group>

      {/* Shadowy Architect Figure inside - Visible only for 2s on hover */}
      <group position={[0, 0, 0.5]} visible={isFigureVisible}>
        <group scale={0.6}>
          {/* HEAD & FACE */}
          <group position={[0, 2.1, 0]}>
            <mesh castShadow frustumCulled={false}>
              <boxGeometry args={[0.4, 0.4, 0.4]} />
              <meshBasicMaterial color="#000000" transparent opacity={0.8} />
            </mesh>
            <mesh position={[0, 0.2, 0.02]} castShadow frustumCulled={false}>
              <boxGeometry args={[0.42, 0.12, 0.42]} />
              <meshBasicMaterial color="#000000" transparent opacity={0.8} />
            </mesh>
          </group>

          {/* TORSO / SHIRT */}
          <mesh position={[0, 1.4, 0]} castShadow frustumCulled={false}>
            <boxGeometry args={[0.6, 0.8, 0.3]} />
            <meshBasicMaterial color="#000000" transparent opacity={0.8} />
          </mesh>

          {/* LEGS (Pants) */}
          <mesh position={[-0.18, 0.5, 0]} castShadow frustumCulled={false}>
            <boxGeometry args={[0.2, 1.0, 0.25]} />
            <meshBasicMaterial color="#000000" transparent opacity={0.8} />
          </mesh>
          <mesh position={[0.18, 0.5, 0]} castShadow frustumCulled={false}>
            <boxGeometry args={[0.2, 1.0, 0.25]} />
            <meshBasicMaterial color="#000000" transparent opacity={0.8} />
          </mesh>

          {/* ARMS */}
          <group position={[-0.4, 1.7, 0]}>
            <mesh position={[0, -0.3, 0]} castShadow frustumCulled={false}>
              <boxGeometry args={[0.18, 0.7, 0.2]} />
              <meshBasicMaterial color="#000000" transparent opacity={0.8} />
            </mesh>
          </group>
          <group position={[0.4, 1.7, 0]}>
            <mesh position={[0, -0.3, 0]} castShadow frustumCulled={false}>
              <boxGeometry args={[0.18, 0.7, 0.2]} />
              <meshBasicMaterial color="#000000" transparent opacity={0.8} />
            </mesh>
          </group>
        </group>
      </group>

      {/* Internal Red Hover Light - High density/distance */}
      <pointLight 
        ref={flickerRef} 
        position={[0, 1.5, 0]} 
        color="#ff0044" 
        distance={25} 
        intensity={0} 
      />

      {/* Internal White Light for casting shadow out the door towards Aria's Cabin */}
      {doorOpen && (
        <spotLight 
          position={[0, 1.5, 1.4]} // Positioned exactly at the back wall of the room
          target={targetObj.current} // Pointing directly towards Aria's cabin
          color="#ffffff" 
          distance={40} 
          angle={Math.PI / 4} 
          penumbra={0.0} // 0 penumbra for the hardest, densest shadow edge possible
          intensity={30.0} // Doubled intensity
          castShadow 
          shadow-mapSize-width={2048} // High resolution shadow map
          shadow-mapSize-height={2048}
        />
      )}

      {/* Invisible hover trigger box */}
      <mesh 
        position={[0, 1.5, 0]} 
        onPointerOver={(e) => { 
          e.stopPropagation(); 
          if (!isHovered) {
            setIsFigureVisible(true);
            setTimeout(() => {
              setIsFigureVisible(false);
            }, 2000);
          }
          setIsHovered(true); 
        }}
        onPointerOut={(e) => { 
          e.stopPropagation(); 
          setIsHovered(false); 
        }}
        visible={false}
      >
        <boxGeometry args={[4.5, 3.5, 4.5]} />
        <meshBasicMaterial />
      </mesh>
    </group>
  );
};

export default TheArchivist;
