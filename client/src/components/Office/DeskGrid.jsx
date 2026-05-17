// ─────────────────────────────────────────────────────────────
// client/src/components/Office/DeskGrid.jsx
// Office Desk Arrangement & Narrative Terminal Integration
// ─────────────────────────────────────────────────────────────

import React from 'react';
// import TheTerminal from './TheTerminal';

const DeskGrid = () => {
  // 5 Desk Rectangles matching the main Workroom floor layout
  const desks = [
    { pos: [-8, 0, -4], size: [4, 0.1, 2] },
    { pos: [-8, 0, 4],  size: [4, 0.1, 2] },
    { pos: [0, 0, 0],   size: [4, 0.1, 2] },
    { pos: [8, 0, -4],  size: [4, 0.1, 2] },
    { pos: [8, 0, 4],   size: [4, 0.1, 2] },
  ];

  return (
    <group position={[0, 0, 0]}>
      {/* 5 Desk Rectangles */}
      {desks.map((desk, i) => (
        <mesh key={i} position={[desk.pos[0], 0.2, desk.pos[2]]} castShadow receiveShadow>
          <boxGeometry args={desk.size} />
          <meshStandardMaterial color="#0a0a0f" roughness={0.2} metalness={0.8} />
        </mesh>
      ))}
      
      {/* Narrative Terminal Component sitting flush on Center Desk */}
      {/* <TheTerminal position={[0, 0.45, 0]} /> */}
    </group>
  );
};

export default DeskGrid;
