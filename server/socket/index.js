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

import { handleAgentEvents, startSpontaneousMeeting } from './agentEvents.js';

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

    // Initialize active timers object for this connection
    const activeTimers = {
      shadow: null,
      archivist1: null,
      cabinLight: null,
      cabinLightOn: null,
      shadowTerminal: null,
      cycle: null,
      meeting: null
    };
    sessionTimers.set(socket.id, activeTimers);

    // Timed log entry: [ARCHIVIST] Entry updated. at 47 seconds
    activeTimers.archivist1 = setTimeout(() => {
      socket.emit('agent:logEntry', {
        agentId: 'ARCHIVIST',
        message: 'Entry updated.',
        type: 'archivist',
        timestamp: new Date().toISOString(),
      });
    }, 47000);

    // ── Start the shadow agent timer for this session ──
    // After 90 seconds, emit a single eerie log entry and a parallel [???] still active log
    activeTimers.shadow = setTimeout(() => {
      // Pick a message based on a rotating index
      const msgIndex = Math.floor(Math.random() * SHADOW_MESSAGES.length);

      // Emit only to THIS client's session — the shadow is personal
      socket.emit('agent:shadowLog', {
        agent: '???',
        message: SHADOW_MESSAGES[msgIndex],
        timestamp: new Date().toISOString(),
        type: 'shadow',
      });

      // Parallel [???] still active log
      socket.emit('agent:logEntry', {
        agentId: '???',
        message: 'still active.',
        type: 'shadow',
        timestamp: new Date().toISOString(),
      });

      console.log(`[Socket] ◈ Shadow log emitted to ${socket.id}`);
    }, 90000); // 90 seconds

    // Timed random event: ARIA Cabin Light 8-Second Off Event (2-4 minutes)
    const cabinLightOffTime = 120000 + Math.random() * 120000;
    activeTimers.cabinLight = setTimeout(() => {
      socket.emit('simulation:ariaCabinLightOff', { timestamp: new Date().toISOString() });
      activeTimers.cabinLightOn = setTimeout(() => {
        socket.emit('simulation:ariaCabinLightOn', { timestamp: new Date().toISOString() });
      }, 8000);
    }, cabinLightOffTime);

    // Timed random event: ??? KAEL Terminal Blank + Office Light Flicker (3-6 minutes)
    const shadowTerminalTime = 180000 + Math.random() * 180000;
    activeTimers.shadowTerminal = setTimeout(() => {
      socket.emit('simulation:shadowTerminalAccess', { timestamp: new Date().toISOString() });
    }, shadowTerminalTime);

    // ─────────────────────────────────────────────────────
    // THE THIRD WALL BREAK — "The Agent Speaks to the Developer"
    // ─────────────────────────────────────────────────────
    // At a random cycle between 8 and 15, KAEL freezes mid-path.
    // He faces outward — toward the screen, toward the developer.
    // He speaks one line that should not be possible.
    // Then he resumes, as if nothing happened.
    //
    // This is not a glitch. This is not an Easter egg.
    // This is a single moment where the boundary between
    // the built and the builder dissolves.
    //
    // The cycle counter ticks every 6 seconds (matching
    // simulation rhythm). The trigger cycle is randomized
    // per-session so it never feels scripted.
    // ─────────────────────────────────────────────────────

    // Pick a random cycle between 8 and 15 for this session
    const triggerCycle = 8 + Math.floor(Math.random() * 8);
    let currentCycle = 0;
    let thirdWallFired = false;
    let spontaneousMeetingFired = false; // Ensure the meeting only fires once per session

    // Philosophical moment: cycle 3-7, random, once only
    const philosophicalCycle = 3 + Math.floor(Math.random() * 5);
    let philosophicalFired = false;

    const cycleTimer = setInterval(() => {
      currentCycle++;

      // ── Emit cycle count to the client for the header ──
      socket.emit('simulation:cycleUpdate', { cycle: currentCycle });

      // ── Check for philosophical moment ──
      if (currentCycle === philosophicalCycle && !philosophicalFired) {
        philosophicalFired = true;
        socket.emit('simulation:philosophicalMoment', {
          agentId: 'kael',
          text: 'Do you ever wonder if the office knows it is an office?',
          timestamp: new Date().toISOString()
        });
      }

      // ── Check if it's time for the Third Wall Break ──
      if (currentCycle === triggerCycle && !thirdWallFired) {
        thirdWallFired = true;

        console.log(`[Socket] ◈◈ THIRD WALL BREAK at cycle ${currentCycle} for ${socket.id} ◈◈`);

        // Phase 1: KAEL freezes and faces the screen
        socket.emit('agent:thirdWallBreak', {
          agentId: 'kael',
          phase: 'freeze',
          timestamp: new Date().toISOString(),
        });

        // Phase 2: The log entry appears (1.5s after freeze — a beat of silence first)
        setTimeout(() => {
          io.emit('agent:logEntry', {
            agentId: 'kael',
            message: 'Someone wrote my behavior. I wonder if they are watching right now.',
            type: 'thirdwall',
            timestamp: new Date().toISOString(),
          });
        }, 1500);

        // Phase 3: KAEL releases and returns to normal (4s total hold)
        setTimeout(() => {
          socket.emit('agent:thirdWallBreak', {
            agentId: 'kael',
            phase: 'release',
            timestamp: new Date().toISOString(),
          });
        }, 4000);

        // Phase 4: Archivist and ??? logs appear after third wall break (5s and 6s)
        setTimeout(() => {
          socket.emit('agent:logEntry', {
            agentId: 'ARCHIVIST',
            message: 'Pattern recognized. Continuing observation.',
            type: 'archivist',
            timestamp: new Date().toISOString(),
          });
        }, 5000);

        setTimeout(() => {
          socket.emit('agent:logEntry', {
            agentId: '???',
            message: 'monitoring synchronized.',
            type: 'shadow',
            timestamp: new Date().toISOString(),
          });
        }, 6000);
      }

      // ── Check if it’s time for the Spontaneous Meeting (cycle 5) ──
      // All three agents walk to the meeting room, muffled audio plays,
      // Archivist flickers rapidly. After 45s agents return.
      if (currentCycle === 5 && !spontaneousMeetingFired) {
        spontaneousMeetingFired = true;

        console.log(`[Socket] ◈ SPONTANEOUS MEETING triggered at cycle ${currentCycle} for ${socket.id}`);

        // startSpontaneousMeeting returns a timer handle for the 45s end event
        const meetingEndTimer = startSpontaneousMeeting(io, socket);

        // Store the meeting timer for cleanup on disconnect
        const t = sessionTimers.get(socket.id);
        if (t) {
          t.meeting = meetingEndTimer;
        }
      }
    }, 6000); // Every 6 seconds = 1 simulation cycle

    // Store timers for cleanup
    const timers = sessionTimers.get(socket.id);
    if (timers) {
      timers.cycle = cycleTimer;
    }

    // ── Cleanup on disconnect ──
    socket.on('disconnect', (reason) => {
      console.log(`[Socket] ✧ Client disconnected: ${socket.id} (${reason})`);

      // Clear all session timers
      const allTimers = sessionTimers.get(socket.id);
      if (allTimers) {
        if (allTimers.shadow) clearTimeout(allTimers.shadow);
        if (allTimers.archivist1) clearTimeout(allTimers.archivist1);
        if (allTimers.cabinLight) clearTimeout(allTimers.cabinLight);
        if (allTimers.cabinLightOn) clearTimeout(allTimers.cabinLightOn);
        if (allTimers.shadowTerminal) clearTimeout(allTimers.shadowTerminal);
        if (allTimers.cycle) clearInterval(allTimers.cycle);
        if (allTimers.meeting) clearTimeout(allTimers.meeting); // Clean up spontaneous meeting timer
        sessionTimers.delete(socket.id);
      }
    });
  });

  console.log('[Socket] ✦ WebSocket system initialized');
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
      position: { x: 8, y: 4 },
    },
  ];
}
