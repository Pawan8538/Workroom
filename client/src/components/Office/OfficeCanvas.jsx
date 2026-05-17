// ─────────────────────────────────────────────────────────────
// client/src/components/Office/OfficeCanvas.jsx
// The main 3D viewport for the Workroom simulation
// ─────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import AgentDot from './AgentDot';
import TheArchivist from '../Hidden/TheArchivist';
import TheIntern from '../Hidden/TheIntern';

const OfficeCanvas = ({ agents: socketAgents = [], logs = [], thirdWallAgent = null }) => {
  const [selectedAgent, setSelectedAgent] = useState(null);

  // ── Use socket-provided agents if available, otherwise fallback ──
  const [localAgents, setLocalAgents] = useState([
    { id: 'aria',  name: 'ARIA', role: 'Product Manager',     color: '#00f5ff', symbol: 'Ω', x: -8, y: -4, status: 'idle', task: null },
    { id: 'kael',  name: 'KAEL', role: 'Backend Developer',   color: '#ff8a00', symbol: 'λ', x: 0,  y: 0,  status: 'idle', task: null },
    { id: 'zeno',  name: 'ZENO', role: 'QA Engineer',         color: '#a855f7', symbol: 'Δ', x: 8,  y: 4,  status: 'idle', task: null },
  ]);

  // ── Merge socket agents into local state when they arrive ──
  useEffect(() => {
    if (socketAgents.length > 0) {
      setLocalAgents(socketAgents.map(a => ({
        ...a,
        x: a.position?.x ?? a.x ?? 0,
        y: a.position?.y ?? a.y ?? 0,
      })));
    }
  }, [socketAgents]);

  // ── Detect if any meeting is in progress (for TheIntern) ──
  const isMeetingActive = useMemo(() => {
    return localAgents.some(a => a.status === 'meeting');
  }, [localAgents]);

  // ── TheIntern dismiss handler — pushes to log via socket ──
  const handleInternDismiss = useCallback((logEntry) => {
    // If socket is available via global, emit. Otherwise just log.
    if (window.__workroom_pushLog) {
      window.__workroom_pushLog(logEntry);
    } else {
      console.log('[TheIntern]', logEntry.message);
    }
  }, []);

  // ── Random idle movement for agents not in a meeting ──
  useEffect(() => {
    const moveAgents = () => {
      setLocalAgents(current => current.map(agent => {
        if (agent.status === 'meeting') return agent;
        // Don't move the frozen agent during Third Wall Break
        if (thirdWallAgent === agent.id) return agent;
        return {
          ...agent,
          x: agent.x + (Math.random() - 0.5) * 2,
          y: agent.y + (Math.random() - 0.5) * 2,
        };
      }));
    };

    const interval = setInterval(moveAgents, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: '#050508',
      position: 'relative'
    }}>
      {/* ── CSS Grid Overlay ──────────────────────────────── */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(0, 245, 255, 0.015) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 245, 255, 0.015) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        pointerEvents: 'none',
        zIndex: 1
      }} />

      <Canvas shadows gl={{ antialias: true }}>
        <PerspectiveCamera makeDefault position={[12, 12, 12]} fov={45} />
        <OrbitControls
          enablePan={true}
          maxPolarAngle={Math.PI / 2.1}
          minDistance={8}
          maxDistance={30}
          makeDefault
        />

        {/* ── Lighting ──────────────────────────────────── */}
        <ambientLight intensity={0.1} />
        <spotLight position={[15, 20, 15]} angle={0.2} penumbra={1} intensity={1.5} castShadow />
        <pointLight position={[-10, 5, -10]} intensity={0.5} color="#00f5ff" />

        {/* ── Office Architecture ───────────────────────── */}
        <group>
          {/* Main Floor */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[60, 60]} />
            <meshStandardMaterial color="#050508" roughness={0.9} metalness={0.1} />
          </mesh>

          {/* 5 Desk Rectangles */}
          {[
            { pos: [-8, 0, -4], size: [4, 0.1, 2] },
            { pos: [-8, 0, 4],  size: [4, 0.1, 2] },
            { pos: [0, 0, 0],   size: [4, 0.1, 2] },
            { pos: [8, 0, -4],  size: [4, 0.1, 2] },
            { pos: [8, 0, 4],   size: [4, 0.1, 2] },
          ].map((desk, i) => (
            <mesh key={i} position={[desk.pos[0], 0.2, desk.pos[2]]} castShadow>
              <boxGeometry args={desk.size} />
              <meshStandardMaterial color="#0a0a0f" roughness={0.2} metalness={0.8} />
            </mesh>
          ))}

          {/* Meeting Room (Top Center) */}
          <group position={[0, 1.5, -15]}>
            <mesh receiveShadow>
              <boxGeometry args={[16, 3, 8]} />
              <meshStandardMaterial color="#00f5ff" transparent opacity={0.03} />
            </mesh>
            <mesh position={[0, -1.4, 0]}>
              <boxGeometry args={[10, 0.1, 4]} />
              <meshStandardMaterial color="#111" />
            </mesh>
          </group>
        </group>

        {/* ── Dynamic Agents ────────────────────────────── */}
        {localAgents.map(agent => (
          <AgentDot
            key={agent.id}
            {...agent}
            isSelected={selectedAgent === agent.id}
            isFrozen={thirdWallAgent === agent.id}
            onClick={() => setSelectedAgent(agent.id === selectedAgent ? null : agent.id)}
          />
        ))}

        {/* ── THE ARCHIVIST ─────────────────────────────── */}
        {/* The corner room with the flickering light.       */}
        {/* The original dark corner room mesh is replaced   */}
        {/* by TheArchivist's self-contained room geometry.  */}
        <TheArchivist />

        {/* ── THE INTERN ───────────────────────────────── */}
        {/* The figure at the back of the meeting room.     */}
        {/* Only manifests during active meetings.          */}
        <TheIntern
          isMeetingActive={isMeetingActive}
          onDismiss={handleInternDismiss}
        />

        <Environment preset="night" />
        <ContactShadows
          position={[0, 0, 0]}
          opacity={0.4}
          scale={40}
          blur={2.5}
          far={10}
          resolution={1024}
          color="#000000"
        />
      </Canvas>
    </div>
  );
};

export default OfficeCanvas;
