// ─────────────────────────────────────────────────────────────
// client/src/hooks/useSocket.js
// Central WebSocket hook for the Workroom simulation
// ─────────────────────────────────────────────────────────────
// Returns:
//   agents               — live array of agent objects
//   logs                 — live array of log entries (including shadow logs)
//   isFourthWallTriggered — boolean, true when the dark overlay fires
//   isMeetingActive       — boolean, true during spontaneous meeting (cycle 5)
//   socket               — raw socket instance (for emitting from components)
//   isConnected           — connection health indicator
// ─────────────────────────────────────────────────────────────

import { useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

// ── Server URL (Express on port 5000) ──
const SERVER_URL = 'http://localhost:5000';

// ── Max log entries kept in memory to prevent unbounded growth ──
const MAX_LOGS = 200;

export const useSocket = () => {
  // ── State ──
  const [agents, setAgents] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isFourthWallTriggered, setIsFourthWallTriggered] = useState(false);
  const [isMeetingActive, setIsMeetingActive] = useState(null); // true during spontaneous meeting
  const [isConnected, setIsConnected] = useState(false);
  const [thirdWallAgent, setThirdWallAgent] = useState(null);  // agentId currently frozen
  const [cycle, setCycle] = useState(0);
  // ── Event signal timestamps (bump to Date.now() to fire a one-shot reaction) ──
  const [meetingStartedAt, setMeetingStartedAt] = useState(null);
  const [ariaTaskAssignedAt, setAriaTaskAssignedAt] = useState(null);
  const [fourthWallAt, setFourthWallAt] = useState(null);
  const [philosophicalAt, setPhilosophicalAt] = useState(null);
  const [philosophicalText, setPhilosophicalText] = useState("");
  const [terminalContent, setTerminalContent] = useState({ kael: [], zeno: [], aria: [] });
  const [socketAriaCabinLightOff, setSocketAriaCabinLightOff] = useState(false);
  const [shadowTerminalAccess, setShadowTerminalAccess] = useState(false);

  // ── Ref to persist the socket across re-renders ──
  const socketRef = useRef(null);

  // ── Helper: append a log entry with automatic trimming ──
  const pushLog = useCallback((entry) => {
    setLogs((prev) => {
      const next = [...prev, { ...entry, _id: Date.now() + Math.random() }];
      // Keep only the most recent MAX_LOGS entries
      return next.length > MAX_LOGS ? next.slice(-MAX_LOGS) : next;
    });
  }, []);

  // Expose pushLog globally so standalone 3D components like TheIntern can push alert logs
  useEffect(() => {
    window.__workroom_pushLog = pushLog;
  }, [pushLog]);

  // ── Helper: update a single agent's fields by id ──
  const updateAgent = useCallback((agentId, patch) => {
    setAgents((prev) =>
      prev.map((a) => (a.id === agentId ? { ...a, ...patch } : a))
    );
  }, []);

  useEffect(() => {
    // ── Create the socket connection ──
    const socket = io(SERVER_URL, {
      // Reconnection config — graceful recovery
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    socketRef.current = socket;

    // ─────────────────────────────────────────────────────
    // CONNECTION LIFECYCLE
    // ─────────────────────────────────────────────────────
    socket.on('connect', () => {
      console.log('[Socket] ✦ Connected:', socket.id);
      setIsConnected(true);

      pushLog({
        agentId: 'SYSTEM',
        message: 'Connection established. Workroom online.',
        type: 'system',
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] ✧ Disconnected:', reason);
      setIsConnected(false);

      pushLog({
        agentId: 'SYSTEM',
        message: `Connection lost: ${reason}. Reconnecting...`,
        type: 'warning',
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('connect_error', (err) => {
      console.error('[Socket] Connection error:', err.message);
    });

    // ─────────────────────────────────────────────────────
    // EVENT: agent:init
    // Server sends the full agent roster on first connect.
    // ─────────────────────────────────────────────────────
    socket.on('agent:init', (agentArray) => {
      console.log(`[Socket] Received ${agentArray.length} agents`);
      setAgents(agentArray);
    });

    // ─────────────────────────────────────────────────────
    // EVENT: agent:taskAssigned
    // An agent has been given a new task.
    // ─────────────────────────────────────────────────────
    socket.on('agent:taskAssigned', (data) => {
      const { agentId, task, timestamp } = data;

      // Update the agent's task and set them to "working"
      updateAgent(agentId, { task, status: 'working' });

      // Signal ARIA task bubble
      if (agentId === 'aria') {
        setAriaTaskAssignedAt(Date.now());
      }

      pushLog({
        agentId,
        message: `Assigned: ${task.title}`,
        type: 'task',
        timestamp,
      });
    });

    // ─────────────────────────────────────────────────────
    // EVENT: agent:stateChanged
    // An agent transitions between idle/working/meeting/thinking.
    // ─────────────────────────────────────────────────────
    socket.on('agent:stateChanged', (data) => {
      const { agentId, state, detail, timestamp } = data;

      console.log('[Socket] Agent state changed:', agentId, state);
      updateAgent(agentId, { status: state });

      pushLog({
        agentId,
        message: `State → ${state}${detail ? ` (${detail})` : ''}`,
        type: 'info',
        timestamp,
      });
    });

    // ─────────────────────────────────────────────────────
    // EVENT: agent:logEntry
    // A generic log message for the activity feed.
    // ─────────────────────────────────────────────────────
    socket.on('agent:logEntry', (data) => {
      pushLog({
        agentId: data.agentId,
        message: data.message,
        type: data.type || 'info',
        timestamp: data.timestamp,
      });
    });

    // ─────────────────────────────────────────────────────
    // EVENT: agent:positionUpdate
    // An agent moves to new coordinates (meeting room, etc).
    // ─────────────────────────────────────────────────────
    socket.on('agent:positionUpdate', (data) => {
      const { agentId, position } = data;
      updateAgent(agentId, { position });
    });

    // ─────────────────────────────────────────────────────
    // EVENT: agent:meetingStarted
    // Two agents have entered the meeting room.
    // ─────────────────────────────────────────────────────
    socket.on('agent:meetingStarted', (data) => {
      const { agentIds, topic, timestamp } = data;

      pushLog({
        agentId: agentIds[0],
        message: `Meeting with ${agentIds[1]?.toUpperCase()}: ${topic}`,
        type: 'info',
        timestamp,
      });
    });

    // ─────────────────────────────────────────────────────
    // EVENT: agent:meetingEnded
    // Agents return to their desks.
    // ─────────────────────────────────────────────────────
    socket.on('agent:meetingEnded', (data) => {
      const { agentIds, timestamp } = data;

      pushLog({
        agentId: agentIds[0],
        message: `Meeting ended. Agents returning to desks.`,
        type: 'info',
        timestamp,
      });
    });

    // ─────────────────────────────────────────────────────
    // EVENT: simulation:meetingStarted
    // The spontaneous meeting — all three agents walk to the
    // meeting room at cycle 5. Muffled audio plays. Archivist
    // flickers rapidly. Observer is alone for 45 seconds.
    // ─────────────────────────────────────────────────────
    socket.on('simulation:meetingStarted', (data) => {
      console.log('[Socket] ◈ SPONTANEOUS MEETING STARTED', data.agents);
      setIsMeetingActive(true);
      setMeetingStartedAt(Date.now());

      pushLog({
        agentId: 'SYSTEM',
        message: 'All agents have entered the meeting room.',
        type: 'info',
        timestamp: data.timestamp,
      });
    });

    // ─────────────────────────────────────────────────────
    // EVENT: simulation:meetingEnded
    // Agents return to their desks. Muffled audio stops.
    // Archivist intensity returns to normal.
    // ─────────────────────────────────────────────────────
    socket.on('simulation:meetingEnded', (data) => {
      console.log('[Socket] ◈ SPONTANEOUS MEETING ENDED');
      setIsMeetingActive(false);

      pushLog({
        agentId: 'SYSTEM',
        message: 'Meeting concluded. Agents returning to positions.',
        type: 'info',
        timestamp: data.timestamp,
      });
    });

    // ─────────────────────────────────────────────────────
    // EVENT: simulation:fourthWallTrigger
    // All tasks done. The simulation becomes aware.
    // Triggers the dark cinematic overlay.
    // ─────────────────────────────────────────────────────
    socket.on('simulation:fourthWallTrigger', (data) => {
      console.log('[Socket] ◈◈◈ FOURTH WALL BREAK ◈◈◈');
      console.log('[CLIENT] Fourth wall received');
      setIsFourthWallTriggered(true);
      setFourthWallAt(Date.now());

      pushLog({
        agentId: 'SYSTEM',
        message: data.reason || 'The simulation is aware.',
        type: 'system',
        timestamp: data.timestamp,
      });
    });

    // ─────────────────────────────────────────────────────
    // EVENT: simulation:philosophicalMoment
    // ─────────────────────────────────────────────────────
    socket.on('simulation:philosophicalMoment', (data) => {
      console.log('[Socket] ◈ Philosophical Moment:', data.text);
      setPhilosophicalText(data.text);
      setPhilosophicalAt(Date.now());
    });

    // ─────────────────────────────────────────────────────
    // EVENT: agent:terminalContent
    // Real LLM output for agent terminals
    // ─────────────────────────────────────────────────────
    socket.on('agent:terminalContent', (data) => {
      console.log('[Socket] ◈ Terminal Content received for', data.agentId);
      const { agentId, lines } = data;
      setTerminalContent(prev => ({
        ...prev,
        [agentId]: lines
      }));
    });

    // ─────────────────────────────────────────────────────
    // EVENT: cabin light and shadow terminal events
    // ─────────────────────────────────────────────────────
    socket.on('simulation:ariaCabinLightOff', () => {
      console.log('[Socket] ◈ ARIA cabin light OFF event');
      setSocketAriaCabinLightOff(true);
    });

    socket.on('simulation:ariaCabinLightOn', () => {
      console.log('[Socket] ◈ ARIA cabin light ON event');
      setSocketAriaCabinLightOff(false);
    });

    socket.on('simulation:shadowTerminalAccess', () => {
      console.log('[Socket] ◈ Shadow terminal access triggered (3s blanking + flicker)');
      setShadowTerminalAccess(true);
      setTimeout(() => {
        setShadowTerminalAccess(false);
      }, 3000);
    });

    // ─────────────────────────────────────────────────────
    // EVENT: agent:shadowLog
    // The hidden "???" agent speaks. This entry appears
    // ONLY in the log feed — never in the agent panel.
    // Styled red on the frontend.
    // ─────────────────────────────────────────────────────
    socket.on('agent:shadowLog', (data) => {
      console.log('[Socket] ◈ Shadow agent whispered...');

      pushLog({
        agentId: data.agent,      // "???"
        message: data.message,
        type: 'shadow',
        timestamp: data.timestamp,
      });
    });

    // ─────────────────────────────────────────────────────
    // EVENT: agent:thirdWallBreak
    // KAEL freezes mid-path and faces the screen.
    // phase: 'freeze' — stop movement, face outward
    // phase: 'release' — resume normal behavior
    // ─────────────────────────────────────────────────────
    socket.on('agent:thirdWallBreak', (data) => {
      const { agentId, phase } = data;

      if (phase === 'freeze') {
        console.log(`[Socket] ◈◈ Third Wall Break — ${agentId} is aware ◈◈`);
        setThirdWallAgent(agentId);
      } else if (phase === 'release') {
        console.log(`[Socket] ◈◈ Third Wall Break — ${agentId} released ◈◈`);
        setThirdWallAgent(null);
      }
    });

    // ─────────────────────────────────────────────────────
    // EVENT: simulation:cycleUpdate
    // Server ticks every 6 seconds. Updates the cycle
    // counter displayed in the header.
    // ─────────────────────────────────────────────────────
    socket.on('simulation:cycleUpdate', (data) => {
      setCycle(data.cycle);
    });

    // ── Cleanup on unmount ──
    return () => {
      socket.removeAllListeners();
      socket.close();
      socketRef.current = null;
    };
  }, [pushLog, updateAgent]);

  return {
    agents,
    logs,
    isFourthWallTriggered,
    isMeetingActive,      // true during the spontaneous meeting (cycle 5)
    isConnected,
    thirdWallAgent,
    cycle,
    meetingStartedAt,
    ariaTaskAssignedAt,
    fourthWallAt,
    philosophicalAt,
    philosophicalText,
    terminalContent,
    socketAriaCabinLightOff,
    shadowTerminalAccess,
    socket: socketRef.current,
  };
};
