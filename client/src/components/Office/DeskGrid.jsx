import React from 'react';

const DeskGrid = () => {
  return (
    <group position={[0, 0, 0]}>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      
      {/* Simple Desks */}
      {[...Array(6)].map((_, i) => (
        <mesh key={i} position={[(i % 3) * 4 - 4, 0.4, Math.floor(i / 3) * 6 - 3]} castShadow>
          <boxGeometry args={[2, 0.1, 1]} />
          <meshStandardMaterial color="#333" />
        </mesh>
      ))}
    </group>
  );
};

export default DeskGrid;
