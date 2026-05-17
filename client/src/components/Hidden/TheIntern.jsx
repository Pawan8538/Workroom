// ─────────────────────────────────────────────────────────────
// client/src/components/Hidden/TheIntern.jsx
// A Three.js element inside the meeting room
// ─────────────────────────────────────────────────────────────
//
// THE INTERN
// ──────────
// When a meeting is in progress, a faint figure appears at the
// far edge of the meeting room — standing just behind where the
// agents sit. Not quite in the room. Not quite outside it.
//
// It is translucent. It does not move. It does not pulse.
// It simply stands there, as if it has always been standing there
// and the meeting light only now reveals it.
//
// If the user clicks it:
//   - It vanishes instantly. No animation. No fade. Gone.
//   - A single log entry appears: "This agent is not part of the simulation."
//   - The figure never returns for the rest of the session.
//   - Clicking the same spot again does nothing. Empty space.
//
// The goal is discomfort — not jump-scare. The user should feel
// like they removed something that was watching, and that the
// simulation noticed.
//
// Props:
//   isMeetingActive (boolean) — true when a meeting is in progress
//   onDismiss (function)      — callback to push the log entry
//
// ─────────────────────────────────────────────────────────────

import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';

const TheIntern = ({ isMeetingActive, onDismiss }) => {
  // ── Once dismissed, gone forever (this session) ──
  const [dismissed, setDismissed] = useState(false);

  // ── Ref for opacity animation ──
  const materialRef = useRef();

  // ── Target opacity based on meeting state ──
  // 0.06 when visible — barely perceptible. A suggestion of form.
  // 0.0 when no meeting or dismissed.
  const targetOpacity = (!dismissed && isMeetingActive) ? 0.06 : 0.0;

  useFrame(() => {
    if (materialRef.current) {
      // Slow fade in, instant snap on dismiss
      if (dismissed) {
        materialRef.current.opacity = 0;
      } else {
        // Gradual approach — takes ~2 seconds to fully materialize
        materialRef.current.opacity +=
          (targetOpacity - materialRef.current.opacity) * 0.02;
      }
    }
  });

  // ── If dismissed, render nothing ──
  // Not even an invisible mesh. It is gone from the scene graph.
  // Clicking the empty space produces no event. No handler. Nothing.
  if (dismissed) return null;

  // ── If no meeting and opacity is essentially zero, skip rendering ──
  // (But keep the component mounted so it can reappear next meeting)

  const handleClick = (e) => {
    e.stopPropagation();

    // Only respond if currently visible
    if (!isMeetingActive) return;

    // Permanent removal
    setDismissed(true);

    // Push the unsettling log entry
    if (onDismiss) {
      onDismiss({
        agentId: '???',
        message: 'This agent is not part of the simulation.',
        type: 'shadow',
        timestamp: new Date().toISOString(),
      });
    }
  };

  return (
    <group position={[0, 0, -15]}>
      {/* ── The silhouette ──────────────────────────────── */}
      {/* Positioned at the back wall of the meeting room.   */}
      {/* Tall, thin, perfectly still. No animation.         */}
      {/* The mesh is slightly offset from center — it is    */}
      {/* not sitting at the table. It is standing behind.   */}
      <mesh
        position={[5.5, 1.0, -2.8]}
        onClick={handleClick}
      >
        <cylinderGeometry args={[0.12, 0.18, 1.5, 8]} />
        <meshBasicMaterial
          ref={materialRef}
          color="#000000"
          transparent
          opacity={0.0}
          depthWrite={false}
        />
      </mesh>

      {/* ── Ground shadow ──────────────────────────────── */}
      {/* A faint oval beneath the figure. It persists for   */}
      {/* a fraction of a second after the figure vanishes,  */}
      {/* because the material ref is separate. This creates */}
      {/* a "was something standing here?" moment.           */}
      {!dismissed && (
        <mesh
          position={[5.5, 0.01, -2.8]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <circleGeometry args={[0.3, 16]} />
          <meshBasicMaterial
            color="#000000"
            transparent
            opacity={isMeetingActive ? 0.03 : 0.0}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
};

export default TheIntern;
