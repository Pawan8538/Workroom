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
  const targetOpacity = (!dismissedRef.current && isMeetingActive) ? 0.35 : 0.0;

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
    <group position={[1.5, 0.8, -6.5]}>
      {/* ── The silhouette ──────────────────────────────── */}
      {/* Tall, thin box silhouette standing in the meeting room. */}
      <mesh
        position={[0, 0, 0]}
        onClick={handleClick}
        renderOrder={10}
      >
        <boxGeometry args={[0.3, 1.6, 0.2]} />
        <meshStandardMaterial
          ref={materialRef}
          color="#111111"
          transparent
          opacity={0.0}
        />
      </mesh>

      {/* ── Ground shadow ──────────────────────────────── */}
      {/* Persists at the floor level (Y = 0, which is -0.8 relative to group Y = 0.8) */}
      {!dismissedRef.current && (
        <mesh
          position={[0, -0.79, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          renderOrder={10}
        >
          <circleGeometry args={[0.3, 16]} />
          <meshBasicMaterial
            color="#000000"
            transparent
            opacity={isMeetingActive ? 0.03 : 0.0}
            depthWrite={false}
            depthTest={false}
          />
        </mesh>
      )}
    </group>
  );
};

export default TheIntern;
