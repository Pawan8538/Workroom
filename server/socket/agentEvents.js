// ─────────────────────────────────────────────────────────────
// server/socket/agentEvents.js
// All real-time agent event handlers for the Workroom simulation
// ─────────────────────────────────────────────────────────────
// Events handled:
//   agent:taskAssigned              — an agent receives a new task
//   agent:stateChanged              — agent transitions between states
//   agent:logEntry                  — agent pushes a message to the live feed
//   agent:meetingStarted            — two agents walk to the meeting room
//   agent:meetingEnded              — agents return to their desks
//   simulation:meetingStarted       — spontaneous all-agent meeting (cycle 5)
//   simulation:meetingEnded         — spontaneous meeting concludes (45s later)
//   simulation:fourthWallTrigger    — all tasks done, break the fourth wall
// ─────────────────────────────────────────────────────────────

// ── Agent desk positions (home base they return to after meetings) ──
const DESK_POSITIONS = {
  aria: { x: -8, y: -4 },
  kael: { x: 0, y: 0 },
  zeno: { x: 6, y: -4 },
};

// ── Meeting room position (top center of the office canvas) ──
const MEETING_ROOM = { x: 0, y: -15 };

// ── Meeting room positions for the spontaneous 3-agent meeting ──
// Each agent gets a staggered seat in the meeting room
const MEETING_POSITIONS = {
  aria: { x: -1, y: -5 },
  kael: { x: 0,  y: -5 },
  zeno: { x: 1,  y: -5 },
};

// ── Duration of the spontaneous meeting in milliseconds ──
const SPONTANEOUS_MEETING_DURATION = 45000;

/**
 * handleAgentEvents — called once per socket connection
 * @param {import('socket.io').Server} io   — broadcast to all clients
 * @param {import('socket.io').Socket} socket — the individual connection
 */
export const handleAgentEvents = (io, socket) => {

  // ─────────────────────────────────────────────────────────
  // EVENT: agent:taskAssigned
  // Fired when the backend assigns a task to a specific agent.
  // Payload: { agentId, task: { id, title, description, priority, estimatedCycles } }
  // Broadcasts to ALL clients so every viewer sees the assignment.
  // ─────────────────────────────────────────────────────────
  socket.on('agent:taskAssigned', (data) => {
    const { agentId, task } = data;

    console.log(`[AgentEvent] Task assigned to ${agentId}: "${task.title}"`);

    // Broadcast the assignment to every connected client
    io.emit('agent:taskAssigned', {
      agentId,
      task,
      timestamp: new Date().toISOString(),
    });

    // Automatically push a log entry for this event
    io.emit('agent:logEntry', {
      agentId,
      message: `Received task: ${task.title}`,
      type: 'task',
      timestamp: new Date().toISOString(),
    });
  });

  // ─────────────────────────────────────────────────────────
  // EVENT: agent:stateChanged
  // Fired when an agent transitions between states.
  // Valid states: idle, working, meeting, thinking
  // Payload: { agentId, state, detail? }
  // ─────────────────────────────────────────────────────────
  socket.on('agent:stateChanged', (data) => {
    const { agentId, state, detail } = data;
    const agentName = agentId;
    const status = state;
    console.log('[SOCKET] Agent status update:', agentName, status);

    console.log(`[AgentEvent] ${agentId} → ${state}${detail ? ` (${detail})` : ''}`);

    io.emit('agent:stateChanged', {
      agentId,
      state,
      detail: detail || null,
      timestamp: new Date().toISOString(),
    });
  });

  // ─────────────────────────────────────────────────────────
  // EVENT: agent:logEntry
  // A generic log message pushed to the live activity feed.
  // Payload: { agentId, message, type? }
  // type can be: 'info', 'task', 'warning', 'system', 'shadow'
  // ─────────────────────────────────────────────────────────
  socket.on('agent:logEntry', (data) => {
    const { agentId, message, type } = data;

    console.log(`[AgentEvent] LOG [${agentId}]: ${message}`);

    io.emit('agent:logEntry', {
      agentId,
      message,
      type: type || 'info',
      timestamp: new Date().toISOString(),
    });
  });

  // ─────────────────────────────────────────────────────────
  // EVENT: agent:meetingStarted
  // Two agents walk to the meeting room together.
  // Payload: { agentIds: [string, string], topic? }
  // Server moves both agents to meeting room coords and
  // sets their state to "meeting".
  // ─────────────────────────────────────────────────────────
  socket.on('agent:meetingStarted', (data) => {
    const { agentIds, topic } = data;

    console.log(`[AgentEvent] Meeting started: ${agentIds.join(' + ')}${topic ? ` — "${topic}"` : ''}`);

    // Move both agents to the meeting room
    agentIds.forEach((agentId) => {
      io.emit('agent:stateChanged', {
        agentId,
        state: 'meeting',
        detail: topic || 'Sync meeting',
        timestamp: new Date().toISOString(),
      });

      io.emit('agent:positionUpdate', {
        agentId,
        position: MEETING_ROOM,
        timestamp: new Date().toISOString(),
      });
    });

    // Broadcast the meeting event itself
    io.emit('agent:meetingStarted', {
      agentIds,
      topic: topic || 'Sync meeting',
      position: MEETING_ROOM,
      timestamp: new Date().toISOString(),
    });

    // Log it
    io.emit('agent:logEntry', {
      agentId: agentIds[0],
      message: `Meeting started with ${agentIds[1].toUpperCase()}${topic ? `: ${topic}` : ''}`,
      type: 'info',
      timestamp: new Date().toISOString(),
    });
  });

  // ─────────────────────────────────────────────────────────
  // EVENT: agent:meetingEnded
  // Agents return to their home desk positions.
  // Payload: { agentIds: [string, string] }
  // ─────────────────────────────────────────────────────────
  socket.on('agent:meetingEnded', (data) => {
    const { agentIds } = data;

    console.log(`[AgentEvent] Meeting ended: ${agentIds.join(' + ')}`);

    // Send each agent back to their desk
    agentIds.forEach((agentId) => {
      const deskPos = DESK_POSITIONS[agentId] || { x: 0, y: 0 };

      io.emit('agent:stateChanged', {
        agentId,
        state: 'idle',
        detail: null,
        timestamp: new Date().toISOString(),
      });

      io.emit('agent:positionUpdate', {
        agentId,
        position: deskPos,
        timestamp: new Date().toISOString(),
      });
    });

    // Broadcast meeting ended
    io.emit('agent:meetingEnded', {
      agentIds,
      timestamp: new Date().toISOString(),
    });

    // Log it
    io.emit('agent:logEntry', {
      agentId: agentIds[0],
      message: `Meeting concluded. Returning to desk.`,
      type: 'info',
      timestamp: new Date().toISOString(),
    });
  });

  // ─────────────────────────────────────────────────────────
  // EVENT: simulation:fourthWallTrigger
  // Emitted when ALL tasks in a goal are completed.
  // This triggers the dark cinematic overlay on every client.
  // Payload: { reason? }
  // ─────────────────────────────────────────────────────────
  socket.on('simulation:fourthWallTrigger', (data) => {
    const reason = data?.reason || 'All tasks completed. The simulation is aware.';
    console.log('[SOCKET] Fourth wall triggered');

    console.log(`[AgentEvent] ◈◈◈ FOURTH WALL BREAK ◈◈◈ — ${reason}`);

    io.emit('simulation:fourthWallTrigger', {
      reason,
      timestamp: new Date().toISOString(),
    });

    io.emit('agent:logEntry', {
      agentId: 'SYSTEM',
      message: reason,
      type: 'system',
      timestamp: new Date().toISOString(),
    });
  });

  // ─────────────────────────────────────────────────────────
  // EVENT: simulation:triggerFourthWall
  // Emitted by the client (App.jsx) when the terminal closes.
  // ─────────────────────────────────────────────────────────
  socket.on('simulation:triggerFourthWall', (data) => {
    const reason = 'All tasks completed. The simulation is aware.';
    console.log('[SOCKET] Fourth wall triggered by client');

    console.log(`[AgentEvent] ◈◈◈ FOURTH WALL BREAK ◈◈◈ — ${reason}`);

    io.emit('simulation:fourthWallTrigger', {
      reason,
      timestamp: new Date().toISOString(),
    });

    io.emit('agent:logEntry', {
      agentId: 'SYSTEM',
      message: reason,
      type: 'system',
      timestamp: new Date().toISOString(),
    });
  });
};

// ─────────────────────────────────────────────────────────────
// SPONTANEOUS MEETING — triggered by the cycle system in index.js
// ─────────────────────────────────────────────────────────────
// At cycle 5, all three agents walk to the meeting room together.
// Muffled audio plays on the client. Archivist flickers rapidly.
// After 45 seconds agents return to their territory home positions.
// Observer never learns what was discussed. It was about them.
// ─────────────────────────────────────────────────────────────

/**
 * startSpontaneousMeeting — called from index.js when cycle === 5
 * @param {import('socket.io').Server} io — broadcast to all clients
 * @param {import('socket.io').Socket} socket — the individual connection
 * @returns {NodeJS.Timeout} — the meeting end timer (for cleanup on disconnect)
 */
export const startSpontaneousMeeting = (io, socket) => {
  const agentIds = ['aria', 'kael', 'zeno'];
  const agentNames = ['ARIA', 'KAEL', 'ZENO'];

  console.log(`[AgentEvent] ◈ SPONTANEOUS MEETING started for ${socket.id}`);

  // ── Set all agents to "meeting" state ──
  agentIds.forEach((agentId) => {
    io.emit('agent:stateChanged', {
      agentId,
      state: 'meeting',
      detail: 'Spontaneous alignment meeting',
      timestamp: new Date().toISOString(),
    });

    // Move each agent to their meeting room seat
    io.emit('agent:positionUpdate', {
      agentId,
      position: MEETING_POSITIONS[agentId],
      timestamp: new Date().toISOString(),
    });
  });

  // ── Emit the simulation-level meeting event to all clients ──
  // This is the event useSocket listens for to set isMeetingActive
  io.emit('simulation:meetingStarted', {
    agents: agentNames,
    duration: SPONTANEOUS_MEETING_DURATION,
    timestamp: new Date().toISOString(),
  });

  // ── Log entry visible in the feed ──
  io.emit('agent:logEntry', {
    agentId: 'SYSTEM',
    message: 'Agents convened in meeting room. Muffled voices behind glass.',
    type: 'info',
    timestamp: new Date().toISOString(),
  });

  // ── After 45 seconds, end the meeting ──
  const meetingEndTimer = setTimeout(() => {
    console.log(`[AgentEvent] ◈ SPONTANEOUS MEETING ended for ${socket.id}`);

    // Return all agents to idle state and their home desks
    agentIds.forEach((agentId) => {
      const deskPos = DESK_POSITIONS[agentId] || { x: 0, y: 0 };

      io.emit('agent:stateChanged', {
        agentId,
        state: 'idle',
        detail: null,
        timestamp: new Date().toISOString(),
      });

      io.emit('agent:positionUpdate', {
        agentId,
        position: deskPos,
        timestamp: new Date().toISOString(),
      });
    });

    // ── Emit the simulation-level meeting-ended event ──
    io.emit('simulation:meetingEnded', {
      agents: agentNames,
      timestamp: new Date().toISOString(),
    });

    // ── Post-meeting log: ARIA's response per masterplan ──
    io.emit('agent:logEntry', {
      agentId: 'aria',
      message: 'Noted. Continuing as planned.',
      type: 'info',
      timestamp: new Date().toISOString(),
    });
  }, SPONTANEOUS_MEETING_DURATION);

  return meetingEndTimer;
};
