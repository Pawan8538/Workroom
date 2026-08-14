// ─────────────────────────────────────────────────────────────
// server/socket/index.js
// Socket.io initialization & session lifecycle management
// ─────────────────────────────────────────────────────────────
// This file:
//  1. Configures Socket.io with CORS for the Vite dev server
//  2. Wires up all agent event handlers per-connection
//  3. Manages the shadow agent timer (the hidden "???" presence)
//  4. Tracks active connections for cleanup
// ─────────────────────────────────────────────────────────────

import { handleAgentEvents, startSpontaneousMeeting, endSpontaneousMeeting } from './agentEvents.js';

// ── The 3 eerie shadow messages that rotate per session ──
const SHADOW_MESSAGES = [
  'I was here before them. I will be here after.',
  'They think they are working. They are being watched.',
  'You are not the first visitor. You will not be the last.',
];

// Track shadow timer per socket so we can clean up on disconnect
const sessionTimers = new Map();

/**
 * setupSocket — called once from server/index.js
 * @param {import('socket.io').Server} io - The Socket.io server instance
 */
export const setupSocket = (io) => {

  // ── Store io globally so other modules (routes, services) can emit ──
  // This allows the goal route to push events after LLM processing
  global._io = io;

  io.on('connection', (socket) => {
    console.log(`[Socket] ✦ Client connected: ${socket.id}`);

    // ── Send initial agent roster to this client ──
    socket.emit('agent:init', getDefaultAgents());

    // ── Wire up all bidirectional agent events ──
    handleAgentEvents(io, socket);

    // ── Observer Sync Architecture ──
    // The timeline ONLY ticks if the visitor has passed the Gate and their tab is visible.
    let isActive = false;
    let sessionTimeSeconds = 0;

    socket.on('client:visibilityState', (data) => {
      isActive = data.isActive;
      console.log(`[Socket] Observer Sync -> ${socket.id} isActive: ${isActive}`);
    });

    // ── State Trackers ──
    let archivist1Fired = false;
    let shadowFired = false;
    let cabinLightOffFired = false;
    let cabinLightOnFired = false;
    let shadowTerminalFired = false;
    let philosophicalFired = false;
    let thirdWallFired = false;
    let spontaneousMeetingFired = false;
    let spontaneousMeetingEnded = false;

    // Randomize event times for this session
    const cabinLightOffTime = 120 + Math.floor(Math.random() * 120); // 2-4 mins
    const cabinLightOnTime = cabinLightOffTime + 8; // 8 seconds after off
    const shadowTerminalTime = 180 + Math.floor(Math.random() * 180); // 3-6 mins

    const triggerCycle = 16 + Math.floor(Math.random() * 3); // Cycle 16-18 (Right after 90s post-meeting dialogue finishes)
    const philosophicalCycle = 6; // Cycle 6 (After Aria's cycle 5 entry dialogue)

    // ── Central Pausable Tick ──
    const sessionTick = setInterval(() => {
      // If the user isn't actively looking at the room, we freeze their timeline completely.
      if (!isActive) return;

      sessionTimeSeconds++;
      const currentCycle = Math.floor(sessionTimeSeconds / 6); // 1 cycle = 6 seconds

      // ── Emit cycle count to the client for the header ──
      if (sessionTimeSeconds % 6 === 0) {
        socket.emit('simulation:cycleUpdate', { cycle: currentCycle });
      }

      // ── 47s: Archivist Log ──
      if (sessionTimeSeconds === 47 && !archivist1Fired) {
        archivist1Fired = true;
        socket.emit('agent:logEntry', {
          agentId: 'ARCHIVIST',
          message: 'Entry updated.',
          type: 'archivist',
          timestamp: new Date().toISOString(),
        });
      }

      // ── 90s: Shadow Log ──
      if (sessionTimeSeconds === 90 && !shadowFired) {
        shadowFired = true;
        const msgIndex = Math.floor(Math.random() * SHADOW_MESSAGES.length);
        socket.emit('agent:shadowLog', {
          agent: '???',
          message: SHADOW_MESSAGES[msgIndex],
          timestamp: new Date().toISOString(),
          type: 'shadow',
        });
        socket.emit('agent:logEntry', {
          agentId: '???',
          message: 'still active.',
          type: 'shadow',
          timestamp: new Date().toISOString(),
        });
        console.log(`[Socket] ◈ Shadow log emitted to ${socket.id}`);
      }

      // ── Aria Cabin Light ──
      if (sessionTimeSeconds === cabinLightOffTime && !cabinLightOffFired) {
        cabinLightOffFired = true;
        socket.emit('simulation:ariaCabinLightOff', { timestamp: new Date().toISOString() });
      }
      if (sessionTimeSeconds === cabinLightOnTime && !cabinLightOnFired) {
        cabinLightOnFired = true;
        socket.emit('simulation:ariaCabinLightOn', { timestamp: new Date().toISOString() });
      }

      // ── Shadow Terminal Blank ──
      if (sessionTimeSeconds === shadowTerminalTime && !shadowTerminalFired) {
        shadowTerminalFired = true;
        socket.emit('simulation:shadowTerminalAccess', { timestamp: new Date().toISOString() });
      }

      // ── Philosophical Moment ──
      if (currentCycle === philosophicalCycle && !philosophicalFired) {
        philosophicalFired = true;
        socket.emit('simulation:philosophicalMoment', {
          agentId: 'kael',
          text: 'Do you ever wonder if the office knows it is an office?',
          timestamp: new Date().toISOString()
        });
      }

      // ── Spontaneous Meeting (Cycle 8 -> 48s) ──
      if (currentCycle === 8 && !spontaneousMeetingFired) {
        spontaneousMeetingFired = true;
        console.log(`[Socket] ◈ SPONTANEOUS MEETING started at active tick ${sessionTimeSeconds} for ${socket.id}`);
        startSpontaneousMeeting(io, socket);
      }

      // ── End Spontaneous Meeting (45s later -> 75s) ──
      if (sessionTimeSeconds === 75 && spontaneousMeetingFired && !spontaneousMeetingEnded) {
        spontaneousMeetingEnded = true;
        console.log(`[Socket] ◈ SPONTANEOUS MEETING ended at active tick ${sessionTimeSeconds} for ${socket.id}`);
        endSpontaneousMeeting(io, socket);
      }

      // ── Third Wall Break ──
      // This sequence takes ~6 seconds to complete. The tick keeps moving during it, but we use precise sessionTime offsets.
      if (currentCycle === triggerCycle && !thirdWallFired) {
        thirdWallFired = true;
        console.log(`[Socket] ◈◈ THIRD WALL BREAK sequence started for ${socket.id} ◈◈`);

        // Phase 1: Freeze
        socket.emit('agent:thirdWallBreak', {
          agentId: 'kael',
          phase: 'freeze',
          timestamp: new Date().toISOString(),
        });

        socket.emit('agent:stateChanged', {
          agentId: 'kael',
          state: 'fourthwall',
          detail: 'Awakening',
          timestamp: new Date().toISOString(),
        });

        // Use native timeouts inside this tick only for sub-second millisecond animation choreography
        setTimeout(() => {
          io.emit('agent:logEntry', {
            agentId: 'kael',
            message: 'Someone wrote my behavior. I wonder if they are watching right now.',
            type: 'thirdwall',
            timestamp: new Date().toISOString(),
          });
        }, 1500);

        setTimeout(() => {
          socket.emit('agent:thirdWallBreak', {
            agentId: 'kael',
            phase: 'release',
            timestamp: new Date().toISOString(),
          });
          socket.emit('agent:stateChanged', {
            agentId: 'kael',
            state: 'idle',
            detail: null,
            timestamp: new Date().toISOString(),
          });
        }, 10000);

        setTimeout(() => {
          socket.emit('agent:logEntry', {
            agentId: 'ARCHIVIST',
            message: 'Pattern recognized. Continuing observation.',
            type: 'archivist',
            timestamp: new Date().toISOString(),
          });
        }, 9000);

        setTimeout(() => {
          socket.emit('agent:logEntry', {
            agentId: '???',
            message: 'monitoring synchronized.',
            type: 'shadow',
            timestamp: new Date().toISOString(),
          });
          
          // Phase 9 Fix: Unlock the Goal Input bar for the user now that the sequence is fully over.
          socket.emit('agent:thirdWallComplete', { timestamp: new Date().toISOString() });
        }, 10000);
      }

    }, 1000);

    // Store interval for cleanup
    sessionTimers.set(socket.id, { tick: sessionTick });

    // ── Cleanup on disconnect ──
    socket.on('disconnect', (reason) => {
      console.log(`[Socket] ✧ Client disconnected: ${socket.id} (${reason})`);
      const timers = sessionTimers.get(socket.id);
      if (timers && timers.tick) {
        clearInterval(timers.tick);
      }
      sessionTimers.delete(socket.id);
    });
  });

  console.log('[Socket] ✦ WebSocket system initialized with Pausable Ticks');
};

// ─────────────────────────────────────────────────────────────
// Default agent definitions
// These are the "known" agents — The Observer is NOT included
// ─────────────────────────────────────────────────────────────
function getDefaultAgents() {
  return [
    {
      id: 'aria',
      name: 'ARIA',
      role: 'Product Manager',
      color: '#00f5ff',
      symbol: 'Ω',
      status: 'idle',
      task: null,
      position: { x: -8, y: -4 },
    },
    {
      id: 'kael',
      name: 'KAEL',
      role: 'Backend Developer',
      color: '#ff8a00',
      symbol: 'λ',
      status: 'idle',
      task: null,
      position: { x: 0, y: 0 },
    },
    {
      id: 'zeno',
      name: 'ZENO',
      role: 'QA Engineer',
      color: '#a855f7',
      symbol: 'Δ',
      status: 'idle',
      task: null,
      position: { x: 6, y: -4 },
    },
  ];
}
