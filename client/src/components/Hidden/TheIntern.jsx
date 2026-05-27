// ─────────────────────────────────────────────────────────────
// client/src/components/Hidden/TheIntern.jsx
// A Three.js element inside the meeting room
// ─────────────────────────────────────────────────────────────
//
// THE INTERN
// ──────────
// When a meeting is in progress (Socket.io meeting event), a faint
// figure appears at the far edge of the meeting room — standing
// just behind where the agents sit. Not quite in the room. Not
// quite outside it.
//
// It is translucent. It does not move. It does not pulse.
// It simply stands there, as if it has always been standing there
// and the meeting light only now reveals it.
//
// If the user clicks it:
//   - It vanishes instantly. No animation. No fade. Gone.
//   - A single ALERT log entry fires in RED:
//     "[ALERT] THIS AGENT IS NOT PART OF THE SIMULATION."
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

import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';

const TheIntern = ({ isMeetingActive, onDismiss }) => {
  // ── Once dismissed, gone forever (this session) ──
  // Using useRef instead of useState — survives re-renders without
  // causing unnecessary re-render on change. Permanent flag.
  const dismissedRef = useRef(false);

  // ── Force re-render after dismiss by using a state trigger ──
  const [_, setForceRender] = React.useState(0);

  // ── Ref for opacity animation ──
  const materialRef = useRef();

  // Console log on mount to confirm rendering
  useEffect(() => {
    console.log('[TheIntern] Mounted. isMeetingActive:', isMeetingActive);
  }, [isMeetingActive]);

  // ── Target opacity based on meeting state ──
  // 0.06 when visible — barely perceptible. A suggestion of form.
  // 0.0 when no meeting or dismissed.
  const targetOpacity = (!dismissedRef.current && isMeetingActive) ? 0.06 : 0.0;

  useFrame(() => {
    if (materialRef.current) {
      // Slow fade in, instant snap on dismiss
      if (dismissedRef.current) {
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
  if (dismissedRef.current) return null;

  // ── Only visible during meeting events from Socket.io ──
  // If no meeting is active, silhouette is completely invisible

  const handleClick = (e) => {
    e.stopPropagation();

    // Only respond if currently visible (meeting active)
    if (!isMeetingActive) return;

    console.log('[TheIntern] Clicked! Permanently dismissing figure.');

    // Permanent removal via ref — never comes back this session
    dismissedRef.current = true;
    setForceRender(prev => prev + 1); // Trigger re-render to unmount

    // Push the unsettling ALERT log entry in RED
    if (onDismiss) {
      onDismiss({
        agentId: '???',
        message: '[ALERT] THIS AGENT IS NOT PART OF THE SIMULATION.',
        type: 'shadow',
        color: '#ff0044', // Red alert color
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
      {!dismissedRef.current && (
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
