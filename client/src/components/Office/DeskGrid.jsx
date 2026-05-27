import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { AGENT_TERRITORIES } from '../../constants/OFFICE_LAYOUT';
import * as THREE from 'three';

// Constant positions for elements not tied to a specific agent's 'home'
const MEETING_ROOM_POS = [0, 0, -5];
const OBSERVER_DESK_POS = [0, 0, 3];
const STORAGE_CORNER_POS = [8, 0, 6];
const PAINTING_POS = [-4, 2, -7.9];
const CLOCK_POS = [6, 2, -8];

// ── THE TERMINAL MONITOR (Reusable Glowing Mesh) ──
const TerminalMonitor = ({ position, onTerminalClick }) => {
  const screenMatRef = useRef();

  useFrame(({ clock }) => {
    if (screenMatRef.current) {
      screenMatRef.current.emissiveIntensity = 0.6 + Math.sin(clock.getElapsedTime() * 2) * 0.3;
    }
  });

  return (
    <group position={position}>
      {/* Monitor Body */}
      <mesh onClick={(e) => { e.stopPropagation(); onTerminalClick && onTerminalClick(); }} castShadow>
        <boxGeometry args={[0.8, 0.5, 0.05]} />
        <meshStandardMaterial color="#050505" roughness={0.4} />
      </mesh>

      {/* Glowing screen — updated to dark grey */}
      <mesh position={[0, 0, 0.026]}>
        <planeGeometry args={[0.75, 0.45]} />
        <meshStandardMaterial
          ref={screenMatRef}
          color="#222222"
          emissive="#222222"
          emissiveIntensity={0.8}
          transparent
          opacity={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Monitor Stand */}
      <mesh position={[0, -0.15, -0.1]}>
        <boxGeometry args={[0.1, 0.3, 0.1]} />
        <meshStandardMaterial color="#050505" />
      </mesh>
    </group>
  );
};

// ── 1. ARIA CABIN ──
const AriaCabin = () => {
  return (
    <group position={[AGENT_TERRITORIES.ARIA.home.x, 0, AGENT_TERRITORIES.ARIA.home.z]}>
      {/* Enclosed walls (back, left, right) */}
      <mesh position={[0, 1.5, -2]} castShadow receiveShadow>
        <boxGeometry args={[4, 3, 0.2]} />
        <meshStandardMaterial color="#0a0a0f" roughness={0.8} />
      </mesh>
      <mesh position={[-2, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 3, 4]} />
        <meshStandardMaterial color="#0a0a0f" roughness={0.8} />
      </mesh>
      <mesh position={[2, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 3, 4]} />
        <meshStandardMaterial color="#0a0a0f" roughness={0.8} />
      </mesh>

      <mesh position={[-0.5, 1.5, 2]} receiveShadow>
        <boxGeometry args={[3, 3, 0.1]} />
        <meshStandardMaterial color="#334455" transparent opacity={0.25} roughness={0.1} metalness={0.9} />
      </mesh>

      {/* Door slightly ajar with warm light spilling through gap */}
      <group position={[1.5, 0, 2]} rotation={[0, 0.2, 0]}>
        <mesh position={[0.5, 1.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[1, 3, 0.1]} />
          <meshStandardMaterial color="#111" roughness={0.8} />
        </mesh>
      </group>

      {/* Warm point light inside */}
      <pointLight position={[0, 2, 0]} intensity={1.5} color="#ffaa44" distance={6} />

      {/* Desk */}
      <mesh position={[0, 0.7, -1]} castShadow receiveShadow>
        <boxGeometry args={[3, 0.1, 1.5]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.4} metalness={0.6} />
      </mesh>

      {/* Monitor */}
      <mesh position={[0, 1.0, -1.5]} rotation={[0, 0, 0]} castShadow>
        <boxGeometry args={[1.2, 0.7, 0.05]} />
        <meshStandardMaterial color="#050505" />
      </mesh>

      {/* Small plant shape */}
      <group position={[1, 0.85, -1]}>
        {/* Pot */}
        <mesh castShadow>
          <cylinderGeometry args={[0.15, 0.1, 0.2, 8]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        {/* Leaves */}
        <mesh position={[0, 0.2, 0]} castShadow>
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshStandardMaterial color="#2e5c3e" roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
};

// ── 2. MEETING ROOM ──
const MeetingRoom = () => {
  return (
    <group position={MEETING_ROOM_POS}>
      {/* Glass walls two sides (front and left) */}
      <mesh position={[0, 1.5, 3]} receiveShadow>
        <boxGeometry args={[8, 3, 0.1]} />
        <meshStandardMaterial color="#334455" transparent opacity={0.25} roughness={0.1} metalness={0.9} />
      </mesh>
      <mesh position={[-4, 1.5, 0]} receiveShadow>
        <boxGeometry args={[0.1, 3, 6]} />
        <meshStandardMaterial color="#334455" transparent opacity={0.25} roughness={0.1} metalness={0.9} />
      </mesh>

      {/* Long table */}
      <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[5, 0.1, 2]} />
        <meshStandardMaterial color="#151515" roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Table Legs */}
      <mesh position={[-2, 0.375, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.75, 8]} />
        <meshStandardMaterial color="#050505" />
      </mesh>
      <mesh position={[2, 0.375, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.75, 8]} />
        <meshStandardMaterial color="#050505" />
      </mesh>

      {/* 4 chair shapes, one chair slightly different color */}
      {/* Chair 1 (different color) */}
      <mesh position={[-1.5, 0, 1.5]} castShadow>
        <boxGeometry args={[0.6, 0.8, 0.6]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.8} />
      </mesh>
      {/* Chair 2 */}
      <mesh position={[1.5, 0, 1.5]} castShadow>
        <boxGeometry args={[0.6, 0.8, 0.6]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.8} />
      </mesh>
      {/* Chair 3 */}
      <mesh position={[-1.5, 0, -1.5]} castShadow>
        <boxGeometry args={[0.6, 0.8, 0.6]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.8} />
      </mesh>
      {/* Chair 4 */}
      <mesh position={[1.5, 0, -1.5]} castShadow>
        <boxGeometry args={[0.6, 0.8, 0.6]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.8} />
      </mesh>

      {/* Warm dim light inside */}
      <pointLight position={[0, 2.5, 0]} intensity={0.5} color="#ffd1a3" distance={10} />
    </group>
  );
};

// ── 3. KAEL DESK ──
const KaelDesk = ({ onTerminalClick }) => {
  return (
    <group position={[AGENT_TERRITORIES.KAEL.home.x, 0, AGENT_TERRITORIES.KAEL.home.z]}>
      {/* Desk Surface */}
      <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
        <boxGeometry args={[3, 0.1, 1.5]} />
        <meshStandardMaterial color="#0a0a0f" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Left Normal Monitor */}
      <group position={[-0.8, 1.05, -0.3]} rotation={[0, 0.3, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.8, 0.5, 0.05]} />
          <meshStandardMaterial color="#050505" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0, 0.026]}>
          <planeGeometry args={[0.75, 0.45]} />
          <meshStandardMaterial color="#00f5ff" emissive="#0044ff" emissiveIntensity={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, -0.2, -0.1]}>
          <boxGeometry args={[0.1, 0.4, 0.1]} />
          <meshStandardMaterial color="#050505" />
        </mesh>
      </group>

      {/* Right Terminal Monitor (pulsing, clickable) */}
      <TerminalMonitor position={[0.6, 1.05, -0.3]} onTerminalClick={onTerminalClick} />

      {/* Keyboard shape */}
      <mesh position={[-0.1, 0.76, 0.3]} rotation={[0, -0.1, 0]} castShadow>
        <boxGeometry args={[0.8, 0.02, 0.3]} />
        <meshStandardMaterial color="#111" roughness={0.8} />
      </mesh>
    </group>
  );
};

// ── 4. ZENO DESK ──
const ZenoDesk = () => {
  return (
    <group position={[6, 0, -4]}>
      {/* Desk Surface */}
      <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 0.1, 1.5]} />
        <meshStandardMaterial color="#0a0a0f" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* One monitor */}
      <group position={[0, 1.05, -0.3]}>
        <mesh castShadow>
          <boxGeometry args={[0.8, 0.5, 0.05]} />
          <meshStandardMaterial color="#050505" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0, 0.026]}>
          <planeGeometry args={[0.75, 0.45]} />
          <meshStandardMaterial color="#00f5ff" emissive="#0044ff" emissiveIntensity={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, -0.2, -0.1]}>
          <boxGeometry args={[0.1, 0.4, 0.1]} />
          <meshStandardMaterial color="#050505" />
        </mesh>

        {/* Small post-it shape on monitor edge */}
        <mesh position={[0.35, -0.2, 0.03]} rotation={[0, 0, 0.1]}>
          <planeGeometry args={[0.1, 0.1]} />
          <meshBasicMaterial color="#ffeb3b" />
        </mesh>
      </group>

      {/* Keyboard */}
      <mesh position={[0, 0.76, 0.3]} castShadow>
        <boxGeometry args={[0.8, 0.02, 0.3]} />
        <meshStandardMaterial color="#111" roughness={0.8} />
      </mesh>
    </group>
  );
};

// ── 5. OBSERVER DESK ──
const ObserverDesk = () => {
  const handlePaperClick = (e) => {
    e.stopPropagation();
    console.log('[ObserverDesk] Paper clicked.');
  };

  return (
    <group position={OBSERVER_DESK_POS}>
      {/* Different material from other desks — slightly warmer tone */}
      <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.5, 0.1, 1.8]} />
        <meshStandardMaterial color="#2a1e12" roughness={0.6} metalness={0.3} />
      </mesh>

      {/* Empty chair pulled out */}
      <group position={[0, 0.4, 1.5]} rotation={[0, 0.4, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.6, 0.1, 0.6]} />
          <meshStandardMaterial color="#030303" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.4, 0.25]} castShadow>
          <boxGeometry args={[0.6, 0.8, 0.1]} />
          <meshStandardMaterial color="#030303" roughness={0.9} />
        </mesh>
        <mesh position={[0, -0.3, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.3, 0.2, 8]} />
          <meshStandardMaterial color="#111" metalness={0.8} />
        </mesh>
      </group>

      {/* Lamp shape on top with warm point light */}
      <group position={[-1, 0.75, -0.5]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.15, 0.2, 0.05, 16]} />
          <meshStandardMaterial color="#333" metalness={0.9} />
        </mesh>
        <mesh position={[0, 0.2, 0]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
          <meshStandardMaterial color="#555" metalness={0.9} />
        </mesh>
        <mesh position={[0, 0.4, 0.1]} rotation={[0.5, 0, 0]} castShadow>
          <coneGeometry args={[0.15, 0.2, 16]} />
          <meshStandardMaterial color="#222" metalness={0.8} />
        </mesh>
        {/* The Light */}
        <pointLight position={[0, 0.3, 0.1]} intensity={1} distance={2} color="#ffcc66" />
      </group>

      {/* Small paper shape under lamp — clickable */}
      <mesh position={[-0.8, 0.76, -0.2]} rotation={[-Math.PI / 2, 0, 0.2]} onClick={handlePaperClick}>
        <planeGeometry args={[0.3, 0.4]} />
        <meshStandardMaterial color="#eaeaea" roughness={0.9} />
      </mesh>
    </group>
  );
};

// ── 7. WALL DECORATIONS (Painting, Clock) ──
const WallDecorations = () => {
  return (
    <group>
      {/* Painting */}
      <group position={PAINTING_POS}>
        <mesh position={[0, 0, -0.02]} rotation={[0, 0, 0.05]} castShadow>
          <boxGeometry args={[0.88, 0.64, 0.04]} />
          <meshStandardMaterial color="#111" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0, 0.01]} rotation={[0, 0, 0.05]}>
          <planeGeometry args={[0.8, 0.56]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.5} />
        </mesh>
      </group>

      {/* Clock */}
      <group position={CLOCK_POS} rotation={[Math.PI / 2, 0, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.6, 0.6, 0.1, 32]} />
          <meshStandardMaterial color="#e0e0e0" roughness={0.4} />
        </mesh>
        {/* Simple hands placed slightly above the cylinder face (which is at y = 0.05) */}
        <mesh position={[0, 0.06, 0]} rotation={[0, 0.5, 0]}>
          <boxGeometry args={[0.04, 0.02, 0.4]} />
          <meshBasicMaterial color="#000" />
        </mesh>
        <mesh position={[0.1, 0.06, 0]} rotation={[0, -0.2, 0]}>
          <boxGeometry args={[0.3, 0.02, 0.04]} />
          <meshBasicMaterial color="#000" />
        </mesh>
      </group>
    </group>
  );
};

// ── 8. STORAGE CORNER ──
const StorageCorner = () => {
  return (
    <group position={STORAGE_CORNER_POS}>
      {/* 4-5 box shapes stacked */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#4a3b2c" roughness={0.9} />
      </mesh>
      <mesh position={[0.2, 1.5, 0.1]} rotation={[0, 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.9, 0.9, 0.9]} />
        <meshStandardMaterial color="#4a3b2c" roughness={0.9} />
      </mesh>
      <mesh position={[-0.3, 2.4, 0]} rotation={[0, -0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial color="#5c4a38" roughness={0.9} /> {/* Slightly different color */}
      </mesh>
      <mesh position={[0.5, 0.4, -0.8]} rotation={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial color="#4a3b2c" roughness={0.9} />
      </mesh>
    </group>
  );
};

const DeskGrid = ({ onTerminalClick }) => {
  return (
    <group>
      <AriaCabin />
      <MeetingRoom />
      <KaelDesk onTerminalClick={onTerminalClick} />
      <ZenoDesk />
      <ObserverDesk />
      <WallDecorations />
      
      {/* ── New Chairs ── */}
      <mesh position={[0, 0.2, 1.5]} castShadow>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
      {/* Moved Zeno chair to match Zeno desk at [6, 0, -4] */}
      <mesh position={[6, 0.2, -2.5]} castShadow>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
      <mesh position={[0, 0.2, 4.5]} castShadow>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>

      {/* ── Bookshelf / Cabinet at [8, 0, -4] ── */}
      <mesh position={[8, 1.0, -4]} castShadow receiveShadow>
        <boxGeometry args={[1, 2, 0.5]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
      </mesh>

      {/* ── Meeting Room Header Frame at [0, 3.2, -6.5] ── */}
      <mesh position={[0, 3.2, -6.5]} castShadow>
        <boxGeometry args={[2, 0.3, 0.1]} />
        <meshStandardMaterial color="#003300" emissive="#003300" emissiveIntensity={0.2} />
      </mesh>

      {/* ── Archivist Red Glow ── */}
      <group position={[-8, 1.5, 6]}>
        <pointLight intensity={4.0} color="#ff0044" distance={10} />
        <pointLight intensity={2.0} color="#ff2200" distance={10} />
      </group>
      <StorageCorner />
    </group>
  );
};

export default DeskGrid;
