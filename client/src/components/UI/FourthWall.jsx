// ─────────────────────────────────────────────────────────────
// client/src/components/UI/FourthWall.jsx
// THE FOURTH WALL BREAK — "The Silence Sequence"
// ─────────────────────────────────────────────────────────────
//
// Replaces the text overlay with a pure 3D scene orchestration.
// Timing:
// 0s: KAEL typing stops
// 2s: ARIA cabin goes dark
// 3s: ZENO monitor goes dark
// 4s: Ambient hum stops
// 5s: Clock ticks once, then stops. 6 seconds of silence follows.
// 11.5s: Archivist room glows warm white
// 15.5s: Archivist door opens -> triggers architect summon

import React, { useEffect, useRef } from 'react';

const FourthWall = ({ onArchitectSummon }) => {
  const timersRef = useRef([]);

  useEffect(() => {
    // Log reaching fourth wall to Doorkeeper
    window.__doorkeeper?.logFourthWall?.();

    // ── The Silence Sequence ──

    // Phase 1 (0s): emit window.__workroom_sound.stopKeyboardLoop()
    if (window.__workroom_sound?.stopKeyboardLoop) {
      window.__workroom_sound.stopKeyboardLoop();
    }

    // Phase 2 (2s): emit window.__workroom_ariaCabinLightOff = true
    const t2 = setTimeout(() => {
      window.__workroom_ariaCabinLightOff = true;
      window.dispatchEvent(new Event('fourthWall:ariaCabinLightOff'));
    }, 2000);
    timersRef.current.push(t2);

    // Phase 3 (3s): emit window.__workroom_zenoMonitorDark = true
    const t3 = setTimeout(() => {
      window.__workroom_zenoMonitorDark = true;
      window.dispatchEvent(new Event('fourthWall:zenoMonitorDark'));
    }, 3000);
    timersRef.current.push(t3);

    // Phase 4 (4s): emit window.__workroom_sound.stopAmbientHum()
    const t4 = setTimeout(() => {
      if (window.__workroom_sound?.stopAmbientHum) {
        window.__workroom_sound.stopAmbientHum();
      }
    }, 4000);
    timersRef.current.push(t4);

    // Phase 5 (5s): emit window.__workroom_sound.playClockTick() then stop the clocks
    const t5 = setTimeout(() => {
      if (window.__workroom_sound?.playClockTick) {
        window.__workroom_sound.playClockTick();
      }
      if (window.__workroom_stopClock) {
        window.__workroom_stopClock();
      }
      if (window.__workroom_sound?.stopClockInterval) {
        window.__workroom_sound.stopClockInterval();
      }
    }, 5000);
    timersRef.current.push(t5);

    // Phase 6 (5.5s-11.5s): 6 seconds of complete silence — NO actions

    // Phase 7 (11.5s): emit window.__workroom_archivistWarmWhite = true (slow 4s transition)
    const t7 = setTimeout(() => {
      window.__workroom_archivistWarmWhite = true;
      window.dispatchEvent(new Event('fourthWall:archivistWarmWhite'));
    }, 11500);
    timersRef.current.push(t7);

    // Phase 8 (15.5s): emit window.__workroom_archivistDoorOpen = true → onArchitectSummon()
    const t8 = setTimeout(() => {
      window.__workroom_archivistDoorOpen = true;
      window.dispatchEvent(new Event('fourthWall:archivistDoorOpen'));
      if (onArchitectSummon) {
        onArchitectSummon();
      }
    }, 15500);
    timersRef.current.push(t8);

    // ── Cleanup all timers on unmount ──
    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, [onArchitectSummon]);

  return null; // Pure timing sequence, no UI overlay
};

export default FourthWall;
