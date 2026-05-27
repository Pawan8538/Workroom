// ─────────────────────────────────────────────────────────────
// client/src/components/Office/OfficeCanvas.jsx
// The main 3D viewport for the Workroom simulation
// ─────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import { OrbitControls, OrthographicCamera, Environment, ContactShadows, Line } from '@react-three/drei';
import AgentDot from './AgentDot';
import TheArchivist from '../Hidden/TheArchivist';
import TheIntern from '../Hidden/TheIntern';
import DeskGrid from './DeskGrid';
import TheTerminal from './TheTerminal';
import SpeechBubble from './SpeechBubble';
import { AGENT_DIALOGUE } from '../../constants/AGENT_DIALOGUE';
import { OFFICE_BOUNDS } from '../../constants/OFFICE_LAYOUT';

const SpeechBubbleProjector = ({ agents, bubbleCoords }) => {
  const { camera } = useThree();
  
  useFrame(() => {
    agents.forEach(agent => {
      const vector = new Vector3(agent.x, 1.5, agent.z || agent.y);
      vector.project(camera);
      const screenX = (vector.x * 0.5 + 0.5) * window.innerWidth;
      const screenY = (-vector.y * 0.5 + 0.5) * window.innerHeight - 80;

      if (agent.name === 'KAEL') {
        console.log('KAEL Bubble coords:', { screenX, screenY });
      }

      bubbleCoords.current[agent.name] = {
        screenX,
        screenY
      };
    });
  });

  return null;
};


const OfficeCanvas = ({ agents: socketAgents = [], logs = [], thirdWallAgent = null }) => {
  const [selectedAgent, setSelectedAgent] = useState(null);

  // ── Use socket-provided agents if available, otherwise fallback ──
  const [localAgents, setLocalAgents] = useState([
    { id: 'aria',  name: 'ARIA', role: 'Product Manager',     color: '#00f5ff', symbol: 'Ω', x: -8, y: -4, status: 'idle', task: null },
    { id: 'kael',  name: 'KAEL', role: 'Backend Developer',   color: '#ff8a00', symbol: 'λ', x: 0,  y: 0,  status: 'idle', task: null },
    { id: 'zeno',  name: 'ZENO', role: 'QA Engineer',         color: '#a855f7', symbol: 'Δ', x: 8,  y: 4,  status: 'idle', task: null },
  ]);

  // ── Merge socket agents into local state when they arrive ──
  useEffect(() => {
    if (socketAgents.length > 0) {
      setLocalAgents(socketAgents.map(a => ({
        ...a,
        x: a.position?.x ?? a.x ?? 0,
        y: a.position?.y ?? a.y ?? 0,
      })));
    }
  }, [socketAgents]);

  // ── Detect if any meeting is in progress (for TheIntern) ──
  const isMeetingActive = useMemo(() => {
    return localAgents.some(a => a.status === 'meeting');
  }, [localAgents]);

  // ── TheIntern dismiss handler — pushes to log via socket ──
  const handleInternDismiss = useCallback((logEntry) => {
    if (window.__workroom_pushLog) {
      window.__workroom_pushLog(logEntry);
    } else {
      console.log('[TheIntern]', logEntry.message);
    }
  }, []);

  const [introComplete, setIntroComplete] = useState(false);
  const [fadeBlack, setFadeBlack] = useState(true);
  const [showPathHint, setShowPathHint] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [hasTerminalBeenUsed, setHasTerminalBeenUsed] = useState(false);

  const [bubbles, setBubbles] = useState({
    ARIA: {text:'', visible:false}, 
    KAEL: {text:'', visible:false}, 
    ZENO: {text:'', visible:false}
  });
  const bubbleCoords = useRef({
    ARIA: { screenX: 0, screenY: 0 },
    KAEL: { screenX: 0, screenY: 0 },
    ZENO: { screenX: 0, screenY: 0 }
  });

  const taskExecutionAgentsRef = useRef({ ARIA: false, KAEL: false, ZENO: false });
  const prevTasksRef = useRef({ ARIA: null, KAEL: null, ZENO: null });

  // Track task assignments to switch dialogue pools
  useEffect(() => {
    localAgents.forEach(agent => {
      const upperName = agent.name.toUpperCase();
      const prevTask = prevTasksRef.current[upperName];
      const currentTask = agent.task;

      if (prevTask === null && currentTask === undefined) {
        // Initialize on first render if no task exists
        prevTasksRef.current[upperName] = null;
        return;
      }

      if (!prevTask && currentTask) {
        taskExecutionAgentsRef.current[upperName] = true;
        setTimeout(() => {
          taskExecutionAgentsRef.current[upperName] = false;
        }, 60000);
      }
      prevTasksRef.current[upperName] = currentTask;
    });
  }, [localAgents]);

  // Observer Greeting: One-time sequence on mount
  useEffect(() => {
    const t1 = setTimeout(() => {
      setBubbles(prev => ({
        ...prev,
        ARIA: { text: AGENT_DIALOGUE.ARIA.greeting, visible: true }
      }));
      setTimeout(() => {
        setBubbles(prev => ({
          ...prev,
          ARIA: { ...prev.ARIA, visible: false }
        }));
      }, 4000);
    }, 3000);

    const t2 = setTimeout(() => {
      setBubbles(prev => ({
        ...prev,
        KAEL: { text: AGENT_DIALOGUE.KAEL.greeting, visible: true }
      }));
      setTimeout(() => {
        setBubbles(prev => ({
          ...prev,
          KAEL: { ...prev.KAEL, visible: false }
        }));
      }, 4000);
    }, 8000);

    const t3 = setTimeout(() => {
      setBubbles(prev => ({
        ...prev,
        ZENO: { text: AGENT_DIALOGUE.ZENO.greeting, visible: true }
      }));
      setTimeout(() => {
        setBubbles(prev => ({
          ...prev,
          ZENO: { ...prev.ZENO, visible: false }
        }));
      }, 4000);
    }, 13000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  // Ambient dialogue loop starting after the greeting sequence (18s)
  useEffect(() => {
    let interval;
    const startDelay = setTimeout(() => {
      interval = setInterval(() => {
        const agentsList = ['ARIA', 'KAEL', 'ZENO'];
        const randomAgent = agentsList[Math.floor(Math.random() * agentsList.length)];
        
        const isWorking = taskExecutionAgentsRef.current[randomAgent];
        const dialogs = isWorking
          ? (AGENT_DIALOGUE[randomAgent]?.taskExecution || [])
          : (AGENT_DIALOGUE[randomAgent]?.normal || []);
          
        const randomLine = dialogs[Math.floor(Math.random() * dialogs.length)];

        setBubbles(prev => ({
          ...prev,
          [randomAgent]: { text: randomLine, visible: true }
        }));

        setTimeout(() => {
          setBubbles(prev => ({
            ...prev,
            [randomAgent]: { ...prev[randomAgent], visible: false }
          }));
        }, 4000);

      }, 8000);
    }, 18000);

    return () => {
      clearTimeout(startDelay);
      if (interval) clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeBlack(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIntroComplete(true);
    }, 3100);
    return () => clearTimeout(timer);
  }, []);

  // ── Idle tracker for Glowing Path Hint ──
  useEffect(() => {
    let idleTimer;
    let hideTimer;

    const handleActivity = () => {
      setShowPathHint(false);
      clearTimeout(idleTimer);
      clearTimeout(hideTimer);

      idleTimer = setTimeout(() => {
        setShowPathHint(true);
        // Fades away after 30 seconds automatically
        hideTimer = setTimeout(() => {
          setShowPathHint(false);
        }, 30000);
      }, 20000); // 20 seconds idle
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    handleActivity(); // Start initial timer

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      clearTimeout(idleTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  // ── Territory-based movement is now handled inside AgentDot itself ──
  // Each agent self-manages waypoints via AGENT_TERRITORIES; no external nudge needed.

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: '#050508', // Pure dark background
      position: 'relative'
    }}>
      {/* ── Cinematic Dark Fade Overlay ── */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: '#000000',
        zIndex: 999,
        pointerEvents: 'none',
        opacity: fadeBlack ? 1 : 0,
        transition: 'opacity 3s ease-in-out'
      }} />

      <Canvas shadows gl={{ antialias: true }}>
        {/* Isometric Camera Setup */}
        <OrthographicCamera makeDefault position={[25, 22, 25]} zoom={32} near={0.1} far={1000} />
        <OrbitControls
          enableRotate={false}
          enablePan={false}
          enableZoom={false}
          target={[0, 0, 0]}
          makeDefault
        />

        {/* ── Lighting ──────────────────────────────────── */}
        {/* Ambient: bright enough to see all furniture clearly */}
        <ambientLight intensity={2.5} color="#ffffff" />
        {/* Directional: from top-right for dramatic shadows */}
        <directionalLight position={[10, 20, 10]} intensity={2.0} castShadow />

        {/* ── Office Architecture ───────────────────────── */}
        <group>
          {/* Main Floor */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[24, 16]} />
            <meshStandardMaterial color="#050508" roughness={0.8} metalness={0.2} />
          </mesh>

          {/* Surrounding Walls */}
          <mesh position={[0, 2, -8]} receiveShadow castShadow>
            <boxGeometry args={[24, 4, 0.2]} />
            <meshStandardMaterial color="#111111" />
          </mesh>
          {/* Front Wall (Split for door) */}
          <mesh position={[-4, 2, 8]} receiveShadow castShadow>
            <boxGeometry args={[16, 4, 0.2]} />
            <meshStandardMaterial color="#111111" />
          </mesh>
          <mesh position={[9, 2, 8]} receiveShadow castShadow>
            <boxGeometry args={[6, 4, 0.2]} />
            <meshStandardMaterial color="#111111" />
          </mesh>
          {/* Door Frame */}
          <mesh position={[4, 2, 8]} receiveShadow castShadow>
            <boxGeometry args={[0.2, 4, 0.3]} />
            <meshStandardMaterial color="#333333" />
          </mesh>
          <mesh position={[6, 2, 8]} receiveShadow castShadow>
            <boxGeometry args={[0.2, 4, 0.3]} />
            <meshStandardMaterial color="#333333" />
          </mesh>
          <mesh position={[-12, 2, 0]} receiveShadow castShadow>
            <boxGeometry args={[0.2, 4, 16]} />
            <meshStandardMaterial color="#111111" />
          </mesh>
          <mesh position={[12, 2, 0]} receiveShadow castShadow>
            <boxGeometry args={[0.2, 4, 16]} />
            <meshStandardMaterial color="#111111" />
          </mesh>

          {/* Wall Clock */}
          <group position={[5, 2.5, -7.8]}>
            <mesh>
              <circleGeometry args={[0.4, 32]} />
              <meshStandardMaterial color="#ffffff" roughness={0.5} />
            </mesh>
            <mesh position={[0, 0, -0.01]}>
              <ringGeometry args={[0.4, 0.45, 32]} />
              <meshStandardMaterial color="#1a1a1a" />
            </mesh>
            <mesh position={[0, 0.1, 0.01]} rotation={[0, 0, -Math.PI / 4]}>
              <boxGeometry args={[0.03, 0.2, 0.01]} />
              <meshStandardMaterial color="#111111" />
            </mesh>
            <mesh position={[0, 0.15, 0.02]} rotation={[0, 0, Math.PI / 6]}>
              <boxGeometry args={[0.02, 0.3, 0.01]} />
              <meshStandardMaterial color="#111111" />
            </mesh>
          </group>

          {/* Office Desks & Architecture (Now fully encapsulated in DeskGrid) */}
          <DeskGrid onTerminalClick={() => {
            if (!hasTerminalBeenUsed) {
              setIsTerminalOpen(true);
            }
          }} />
        </group>

        {/* ── Dynamic Agents ────────────────────────────── */}
        {localAgents.map(agent => (
          <AgentDot
            key={agent.id}
            {...agent}
            isSelected={selectedAgent === agent.id}
            isFrozen={thirdWallAgent === agent.id}
            onClick={() => setSelectedAgent(agent.id === selectedAgent ? null : agent.id)}
          />
        ))}

        {/* ── Glowing Path Hint (Idle > 20s) ── */}
        {showPathHint && (
          <Line
            points={[[0, 0.1, 15], [0, 0.1, 0]]}
            color="#00f5ff"
            lineWidth={3}
            dashed={true}
            dashSize={0.5}
            gapSize={0.5}
            opacity={0.3}
            transparent
          />
        )}

        {/* ── THE ARCHIVIST ─────────────────────────────── */}
        <TheArchivist />

        {/* ── THE INTERN ───────────────────────────────── */}
        <TheIntern
          isMeetingActive={isMeetingActive}
          onDismiss={handleInternDismiss}
        />

        <SpeechBubbleProjector agents={localAgents} bubbleCoords={bubbleCoords} />

        <Environment preset="night" />
        <ContactShadows
          position={[0, 0.01, 0]}
          opacity={0.6}
          scale={50}
          blur={2.5}
          far={10}
          resolution={1024}
          color="#000000"
        />
      </Canvas>

      {/* ── TheTerminal — rendered OUTSIDE the Canvas as pure React ── */}
      {isTerminalOpen && (
        <TheTerminal onClose={() => {
          setIsTerminalOpen(false);
          setHasTerminalBeenUsed(true);
        }} />
      )}

      {/* ── Speech Bubbles ── */}
      {['ARIA', 'KAEL', 'ZENO'].map(agentName => {
        const agent = localAgents.find(a => a.name === agentName);
        return (
          <SpeechBubble
            key={agentName}
            text={bubbles[agentName]?.text || ''}
            visible={bubbles[agentName]?.visible || false}
            agentColor={agent?.color}
            screenX={bubbleCoords.current[agentName]?.screenX || 0}
            screenY={bubbleCoords.current[agentName]?.screenY || 0}
          />
        );
      })}
    </div>
  );
};

export default OfficeCanvas;
