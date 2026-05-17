// ─────────────────────────────────────────────────────────────
// client/src/components/Hidden/TheArchivist.jsx
// A Three.js group placed inside the dark corner room
// ─────────────────────────────────────────────────────────────
//
// THE ARCHIVIST
// ─────────────
// Something lives in the corner room. You cannot enter it.
// Through the frosted glass walls, a faint warm light flickers —
// on for exactly 1.2 seconds, then off for 8-12 seconds (random).
// During the 1.2-second window, a vague silhouette is barely
// visible through the translucent walls. A tall, still figure.
//
// If you click the room, nothing happens. No event fires.
// No tooltip. No cursor change. No acknowledgment.
// The room does not want to be opened.
//
// Behavior goals:
//   - The flicker must feel organic, not mechanical
//   - The silhouette must be ambiguous — "did I see that?"
//   - The user should feel they discovered something private
//
// ─────────────────────────────────────────────────────────────

import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';

const TheArchivist = () => {
  const lightRef = useRef();
  const figureRef = useRef();

  // ── Flicker state machine ──
  // isLit: whether the light is currently on (1.2s window)
  // nextToggle: timestamp (in seconds) when we flip the state
  const [isLit, setIsLit] = useState(false);
  const nextToggleRef = useRef(0);

  useFrame((state) => {
    const elapsed = state.clock.elapsedTime;

    // ── State transition logic ──
    if (elapsed >= nextToggleRef.current) {
      if (isLit) {
        // Light was on → turn it off
        // Stay off for 8-12 seconds (randomized each cycle)
        setIsLit(false);
        nextToggleRef.current = elapsed + 8 + Math.random() * 4;
      } else {
        // Light was off → turn it on
        // Stay on for exactly 1.2 seconds
        setIsLit(true);
        nextToggleRef.current = elapsed + 1.2;
      }
    }

    // ── Light intensity ──
    // When "on", the light doesn't snap to full — it breathes in
    // with a slight sine wave to feel organic, not digital.
    if (lightRef.current) {
      if (isLit) {
        // Warm, breathing glow — peaks at 1.5 intensity
        const breathe = Math.sin(elapsed * 4) * 0.3;
        lightRef.current.intensity = 1.2 + breathe;
      } else {
        // Not zero — a residual 0.02 so the room isn't fully black.
        // This makes users question if they saw something.
        lightRef.current.intensity = 0.02;
      }
    }

    // ── Figure visibility ──
    // The silhouette fades in/out with the light, but slightly delayed
    // so it feels like the light reveals something already standing there.
    if (figureRef.current) {
      const targetOpacity = isLit ? 0.08 : 0.0;
      // Slow lerp — the figure lingers a fraction of a second after light dies
      figureRef.current.material.opacity +=
        (targetOpacity - figureRef.current.material.opacity) * 0.03;
    }
  });

  return (
    <group position={[18, 0, 18]}>

      {/* ── Frosted glass walls ─────────────────────────── */}
      {/* Four walls forming a sealed room. Slightly visible  */}
      {/* from outside — enough to notice light changes.      */}
      {/* They absorb clicks silently via onPointerDown.      */}

      {/* Front wall (facing the office) */}
      <mesh position={[0, 1.5, -6]} onPointerDown={(e) => e.stopPropagation()}>
        <boxGeometry args={[12, 3, 0.15]} />
        <meshPhysicalMaterial
          color="#0a0a10"
          transparent
          opacity={0.4}
          roughness={0.9}
          transmission={0.05}
          thickness={0.5}
        />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 1.5, 6]} onPointerDown={(e) => e.stopPropagation()}>
        <boxGeometry args={[12, 3, 0.15]} />
        <meshPhysicalMaterial color="#060608" transparent opacity={0.6} roughness={1} />
      </mesh>

      {/* Left wall */}
      <mesh position={[-6, 1.5, 0]} rotation={[0, Math.PI / 2, 0]} onPointerDown={(e) => e.stopPropagation()}>
        <boxGeometry args={[12, 3, 0.15]} />
        <meshPhysicalMaterial
          color="#0a0a10"
          transparent
          opacity={0.35}
          roughness={0.9}
          transmission={0.04}
          thickness={0.5}
        />
      </mesh>

      {/* Right wall */}
      <mesh position={[6, 1.5, 0]} rotation={[0, Math.PI / 2, 0]} onPointerDown={(e) => e.stopPropagation()}>
        <boxGeometry args={[12, 3, 0.15]} />
        <meshPhysicalMaterial color="#060608" transparent opacity={0.6} roughness={1} />
      </mesh>

      {/* ── The flickering light ───────────────────────── */}
      {/* Warm amber — like an old desk lamp left on.       */}
      {/* Positioned slightly off-center to feel natural.   */}
      <pointLight
        ref={lightRef}
        position={[0.5, 2.2, 0.3]}
        color="#ffb347"
        intensity={0.02}
        distance={8}
        decay={2}
      />

      {/* ── The figure ─────────────────────────────────── */}
      {/* A tall, narrow, dark shape standing perfectly      */}
      {/* still in the center of the room. Visible only     */}
      {/* as a faint silhouette during the 1.2s light       */}
      {/* window. Its opacity never exceeds 0.08 — enough   */}
      {/* to trigger "did I see that?" but never certainty. */}
      <mesh ref={figureRef} position={[0, 1.1, 0]}>
        <cylinderGeometry args={[0.15, 0.25, 1.8, 8]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={0.0}
          depthWrite={false}
        />
      </mesh>

      {/* ── Floor stain ────────────────────────────────── */}
      {/* A subtle dark mark on the floor beneath the       */}
      {/* figure. It is always visible — even when the      */}
      {/* light is off. A permanent residue.                */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.6, 16]} />
        <meshBasicMaterial color="#030305" transparent opacity={0.5} />
      </mesh>
    </group>
  );
};

export default TheArchivist;
