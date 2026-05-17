// ─────────────────────────────────────────────────────────────
// server/socket/agentEvents.js
// All real-time agent event handlers for the Workroom simulation
// ─────────────────────────────────────────────────────────────
// Events handled:
//   agent:taskAssigned      — an agent receives a new task
//   agent:stateChanged      — agent transitions between states
//   agent:logEntry          — agent pushes a message to the live feed
//   agent:meetingStarted    — two agents walk to the meeting room
//   agent:meetingEnded      — agents return to their desks
//   simulation:fourthWallTrigger — all tasks done, break the fourth wall
// ─────────────────────────────────────────────────────────────

// ── Agent desk positions (home base they return to after meetings) ──
const DESK_POSITIONS = {
  aria: { x: -8, y: -4 },
  kael: { x: 0, y: 0 },
  zeno: { x: 8, y: 4 },
};

// ── Meeting room position (top center of the office canvas) ──
const MEETING_ROOM = { x: 0, y: -15 };

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

    console.log(`[AgentEvent] ◈◈◈ FOURTH WALL BREAK ◈◈◈ — ${reason}`);

    io.emit('simulation:fourthWallTrigger', {
      reason,
      timestamp: new Date().toISOString(),
    });

    // Push a system log visible to all
    io.emit('agent:logEntry', {
      agentId: 'SYSTEM',
      message: reason,
      type: 'system',
      timestamp: new Date().toISOString(),
    });
  });
};
