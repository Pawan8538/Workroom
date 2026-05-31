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
import ArchitectFigure from './ArchitectFigure';
import { AGENT_DIALOGUE } from '../../constants/AGENT_DIALOGUE';
import { OFFICE_BOUNDS } from '../../constants/OFFICE_LAYOUT';

const SpeechBubbleProjector = ({ agents, bubbleCoords, meetingPositionsRef, isMeetingActive, setBubbleCoordsState }) => {
  const { camera, scene } = useThree();

  useEffect(() => {
    let archivistLight = null;
    scene.traverse((obj) => {
      if (obj.isPointLight && obj.color.getHexString() === 'ff0044') {
        archivistLight = obj;
      }
    });

    if (archivistLight) {
      archivistLight.intensity = isMeetingActive ? 5.0 : 2.0;
    }
  }, [isMeetingActive, scene]);

  useFrame(() => {
    agents.forEach(agent => {
      const overridePos = meetingPositionsRef.current ? meetingPositionsRef.current[agent.name] : null;
      const agentX = overridePos ? overridePos.x : agent.x;
      const agentZ = overridePos ? overridePos.z : (agent.z || agent.y);
      const vector = new Vector3(agentX, 3.5, agentZ);
      vector.project(camera);
      const screenX = (vector.x * 0.5 + 0.5) * window.innerWidth;
      const screenY = (-vector.y * 0.5 + 0.5) * window.innerHeight;

      if (agent.name === 'KAEL') {
        // console.log('KAEL Bubble coords:', { screenX, screenY });
      }

      bubbleCoords.current[agent.name] = {
        screenX,
        screenY
      };
    });
    setBubbleCoordsState({ ...bubbleCoords.current });
  });

  return null;
};

// ── Camera zoom animator — runs inside Canvas so it has access to the camera ──
const CameraZoomAnimator = ({ freezeZoomRef, isMeetingActive, showArchitect, meetingStartedAt }) => {
  const { camera } = useThree();
  const defaultPos = useMemo(() => new Vector3(25, 22, 25), []);

  useFrame((state, delta) => {
    const targetZoom = freezeZoomRef.current ? 55 : 38;
    // Lerp speed: covers the full range in ~2s (factor ~0.5 per second)
    const lerpFactor = 1 - Math.pow(0.008, delta);
    camera.zoom = camera.zoom + (targetZoom - camera.zoom) * lerpFactor;

    let targetPos = defaultPos;
    if (showArchitect) {
      targetPos = new Vector3(25, 8, 25);
    } else if (freezeZoomRef.current) {
      targetPos = new Vector3(23, 22, 23); 
    } else if (isMeetingActive && meetingStartedAt) {
      const waypoints = [
        new Vector3(25, 22, 25), // Center
        new Vector3(0, 22, 5),   // Observer
        new Vector3(8, 22, 6),   // Storage
        new Vector3(-4, 22, -8), // Painting
        new Vector3(-12, 22, 0), // Archivist
        new Vector3(0, 22, -3),  // KAEL
        new Vector3(25, 22, 25)  // Center
      ];
      
      const elapsed = (Date.now() - new Date(meetingStartedAt).getTime()) / 1000;
      const duration = 45; // 45 seconds meeting duration
      let time = elapsed / duration;
      if (time > 1) time = 1;
      if (time < 0) time = 0;
      
      const totalSegments = waypoints.length - 1;
      const scaledTime = time * totalSegments;
      const index = Math.floor(scaledTime);
      const frac = scaledTime - index;
      
      if (index >= totalSegments) {
        targetPos = waypoints[totalSegments];
      } else {
        targetPos = new Vector3().copy(waypoints[index]).lerp(waypoints[index + 1], frac);
      }
    }

    camera.position.lerp(targetPos, isMeetingActive ? 0.02 : 0.05);
    camera.updateProjectionMatrix();
  });

  return null;
};

const OfficeCanvas = ({ agents: socketAgents = [], logs = [], thirdWallAgent = null, isMeetingActive = false, meetingStartedAt = null, ariaTaskAssignedAt = null, fourthWallAt = null, philosophicalAt = null, philosophicalText = null, terminalContent, soundEngine, architectOutcome, observerPCFlickering, onObserverPCClick, onPaperClick, showTerminal, onTerminalClose, socketAriaCabinLightOff = false, shadowTerminalAccess = false, showArchitect = false, architectFigureVisible = false, architectIsSeated = false, onArchitectArrivedAtDesk, cycle = 0 }) => {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const freezeZoomRef = useRef(false);
  const [zenoPreWalkState, setZenoPreWalkState] = useState(null);

  useEffect(() => {
    if (cycle === 4) {
      setZenoPreWalkState('observer');
      const timer1 = setTimeout(() => {
        setZenoPreWalkState('kael');
        setBubbles(prev => ({ ...prev, ZENO: { text: AGENT_DIALOGUE.PRE_MEETING.ZENO, visible: true } }));
      }, 3000);
      const timer2 = setTimeout(() => {
        setZenoPreWalkState(null);
        setBubbles(prev => ({ ...prev, ZENO: { ...prev.ZENO, visible: false } }));
      }, 7000);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [cycle]);

  // ── Use socket-provided agents if available, otherwise fallback ──
  const [localAgents, setLocalAgents] = useState([
    { id: 'aria', name: 'ARIA', role: 'Product Manager', color: '#00f5ff', symbol: 'Ω', x: -8, y: -4, status: 'idle', task: null },
    { id: 'kael', name: 'KAEL', role: 'Backend Developer', color: '#ff8a00', symbol: 'λ', x: 0, y: 0, status: 'idle', task: null },
    { id: 'zeno', name: 'ZENO', role: 'QA Engineer', color: '#a855f7', symbol: 'Δ', x: 8, y: 4, status: 'idle', task: null },
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

  const agentTerminalContent = useMemo(() => {
    const goalActive = localAgents.some(a => !!a.task);
    return goalActive ? 'active' : 'idle';
  }, [localAgents]);

  // ── TheIntern dismiss handler — pushes to log via socket ──
  const handleInternDismiss = useCallback((logEntry) => {
    if (window.__workroom_pushLog) {
      window.__workroom_pushLog(logEntry);
    } else {
      console.log('[TheIntern]', logEntry.message);
    }
  }, []);

  // Sync freeze ref whenever thirdWallAgent changes
  useEffect(() => {
    freezeZoomRef.current = thirdWallAgent === 'kael';
  }, [thirdWallAgent]);

  // ── Event-triggered speech bubbles ──

  // simulation:meetingStarted → ZENO speaks before agents walk
  useEffect(() => {
    if (!meetingStartedAt) return;
    setBubbles(prev => ({ ...prev, ZENO: { text: AGENT_DIALOGUE.PRE_MEETING.ZENO, visible: true } }));
    const hide = setTimeout(() => {
      setBubbles(prev => ({ ...prev, ZENO: { ...prev.ZENO, visible: false } }));
    }, 5000);
    return () => clearTimeout(hide);
  }, [meetingStartedAt]);

  // simulation:fourthWallTrigger → ZENO delivers final line before office dims
  useEffect(() => {
    if (!fourthWallAt) return;
    setBubbles(prev => ({ ...prev, ZENO: { text: AGENT_DIALOGUE.PRE_FOURTH_WALL.ZENO, visible: true } }));
    const hide = setTimeout(() => {
      setBubbles(prev => ({ ...prev, ZENO: { ...prev.ZENO, visible: false } }));
    }, 4000);
    return () => clearTimeout(hide);
  }, [fourthWallAt]);

  const [introComplete, setIntroComplete] = useState(false);
  const [fadeBlack, setFadeBlack] = useState(true);
  
  // ── Fourth Wall Orchestration States ──
  const [ariaCabinLightOff, setAriaCabinLightOff] = useState(false);
  const [zenoMonitorDark, setZenoMonitorDark] = useState(false);
  const [archivistWarmWhite, setArchivistWarmWhite] = useState(false);
  const [archivistDoorOpen, setArchivistDoorOpen] = useState(false);

  useEffect(() => {
    const handleAriaLight = () => setAriaCabinLightOff(true);
    const handleZenoDark = () => setZenoMonitorDark(true);
    const handleArchivistWarm = () => setArchivistWarmWhite(true);
    const handleArchivistDoor = () => setArchivistDoorOpen(true);

    window.addEventListener('fourthWall:ariaCabinLightOff', handleAriaLight);
    window.addEventListener('fourthWall:zenoMonitorDark', handleZenoDark);
    window.addEventListener('fourthWall:archivistWarmWhite', handleArchivistWarm);
    window.addEventListener('fourthWall:archivistDoorOpen', handleArchivistDoor);

    return () => {
      window.removeEventListener('fourthWall:ariaCabinLightOff', handleAriaLight);
      window.removeEventListener('fourthWall:zenoMonitorDark', handleZenoDark);
      window.removeEventListener('fourthWall:archivistWarmWhite', handleArchivistWarm);
      window.removeEventListener('fourthWall:archivistDoorOpen', handleArchivistDoor);
    };
  }, []);

  const meetingPositionsRef = useRef(null);

  useEffect(() => {
    if (isMeetingActive) {
      meetingPositionsRef.current = {
        ARIA: { x: -1, z: -5 },
        KAEL: { x: 0, z: -5 },
        ZENO: { x: 1, z: -5 }
      };

      if (soundEngine) {
        soundEngine.playMeetingMuffled();
      } else if (window.__workroom_sound) {
        window.__workroom_sound.playMeetingMuffled();
      }
    } else {
      meetingPositionsRef.current = null;
      if (soundEngine) {
        soundEngine.stopMeetingMuffled();
      } else if (window.__workroom_sound) {
        window.__workroom_sound.stopMeetingMuffled();
      }
    }
  }, [isMeetingActive, soundEngine]);

  const [bubbles, setBubbles] = useState({
    ARIA: { text: '', visible: false },
    KAEL: { text: '', visible: false },
    ZENO: { text: '', visible: false }
  });
  const bubbleCoords = useRef({
    ARIA: { screenX: 0, screenY: 0 },
    KAEL: { screenX: 0, screenY: 0 },
    ZENO: { screenX: 0, screenY: 0 }
  });
  const [bubbleCoordsState, setBubbleCoordsState] = useState({});

  const prevTasksRef = useRef({ ARIA: null, KAEL: null, ZENO: null });

  // ── STATE MACHINE DIALOGUE LOGIC ──

  // ENTRY STATE
  useEffect(() => {
    // [3s]  → ARIA greeting
    const t1 = setTimeout(() => {
      setBubbles(prev => ({ ...prev, ARIA: { text: AGENT_DIALOGUE.ARIA.greeting, visible: true } }));
      setTimeout(() => setBubbles(prev => ({ ...prev, ARIA: { ...prev.ARIA, visible: false } })), 4000);
    }, 3000);

    // [8s]  → KAEL greeting
    const t2 = setTimeout(() => {
      setBubbles(prev => ({ ...prev, KAEL: { text: AGENT_DIALOGUE.KAEL.greeting, visible: true } }));
      setTimeout(() => setBubbles(prev => ({ ...prev, KAEL: { ...prev.KAEL, visible: false } })), 4000);
    }, 8000);

    // [13s] → ZENO greeting
    const t3 = setTimeout(() => {
      setBubbles(prev => ({ ...prev, ZENO: { text: AGENT_DIALOGUE.ZENO.greeting, visible: true } }));
      setTimeout(() => setBubbles(prev => ({ ...prev, ZENO: { ...prev.ZENO, visible: false } })), 4000);
    }, 13000);

    // [25s] → ARIA: "Did anyone check on the new arrival?"
    const t4 = setTimeout(() => {
      setBubbles(prev => ({ ...prev, ARIA: { text: AGENT_DIALOGUE.ENTRY_STATE.ARIA_25s, visible: true } }));
      setTimeout(() => setBubbles(prev => ({ ...prev, ARIA: { ...prev.ARIA, visible: false } })), 4000);
    }, 25000);

    // [30s + random 0-30s] → KAEL: "Something is running in the background I did not write."
    const t5 = setTimeout(() => {
      setBubbles(prev => ({ ...prev, KAEL: { text: AGENT_DIALOGUE.ENTRY_STATE.KAEL_30_60s, visible: true } }));
      setTimeout(() => setBubbles(prev => ({ ...prev, KAEL: { ...prev.KAEL, visible: false } })), 4000);
    }, 30000 + Math.random() * 30000);

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5);
    };
  }, []);

  // POST_MEETING (on isMeetingActive → false)
  const prevIsMeetingActive = useRef(isMeetingActive);
  useEffect(() => {
    if (prevIsMeetingActive.current === true && isMeetingActive === false) {
      // Transition from true -> false
      setBubbles(prev => ({ ...prev, ARIA: { text: AGENT_DIALOGUE.POST_MEETING.ARIA, visible: true } }));
      setTimeout(() => setBubbles(prev => ({ ...prev, ARIA: { ...prev.ARIA, visible: false } })), 4000);

      setTimeout(() => {
        setBubbles(prev => ({ ...prev, ZENO: { text: AGENT_DIALOGUE.POST_MEETING.ZENO_30s, visible: true } }));
        setTimeout(() => setBubbles(prev => ({ ...prev, ZENO: { ...prev.ZENO, visible: false } })), 4000);
      }, 30000);

      setTimeout(() => {
        setBubbles(prev => ({ ...prev, KAEL: { text: AGENT_DIALOGUE.POST_MEETING.KAEL_45s, visible: true } }));
        setTimeout(() => setBubbles(prev => ({ ...prev, KAEL: { ...prev.KAEL, visible: false } })), 4000);
      }, 45000);
    }
    prevIsMeetingActive.current = isMeetingActive;
  }, [isMeetingActive]);

  // TASK_ACTIVE (on ariaTaskAssignedAt)
  useEffect(() => {
    if (!ariaTaskAssignedAt) return;
    
    setBubbles(prev => ({ ...prev, ARIA: { text: AGENT_DIALOGUE.TASK_ACTIVE.ARIA[0], visible: true } }));
    setTimeout(() => setBubbles(prev => ({ ...prev, ARIA: { ...prev.ARIA, visible: false } })), 4000);

    const t2 = setTimeout(() => {
      setBubbles(prev => ({ ...prev, ARIA: { text: AGENT_DIALOGUE.TASK_ACTIVE.ARIA[10], visible: true } }));
      setTimeout(() => setBubbles(prev => ({ ...prev, ARIA: { ...prev.ARIA, visible: false } })), 4000);
    }, 10000);

    const t3 = setTimeout(() => {
      setBubbles(prev => ({ ...prev, ARIA: { text: AGENT_DIALOGUE.TASK_ACTIVE.ARIA.mid, visible: true } }));
      setTimeout(() => setBubbles(prev => ({ ...prev, ARIA: { ...prev.ARIA, visible: false } })), 4000);
    }, 40000);

    return () => { clearTimeout(t2); clearTimeout(t3); };
  }, [ariaTaskAssignedAt]);

  // Track KAEL and ZENO task starts and ends
  useEffect(() => {
    localAgents.forEach(agent => {
      const upperName = agent.name.toUpperCase();
      const prevTask = prevTasksRef.current[upperName];
      const currentTask = agent.task;

      if (prevTask === null && currentTask === undefined) {
        prevTasksRef.current[upperName] = null;
        return;
      }

      if (!prevTask && currentTask) {
        // Task started
        if (upperName === 'KAEL') {
          setBubbles(prev => ({ ...prev, KAEL: { text: AGENT_DIALOGUE.TASK_ACTIVE.KAEL.start, visible: true } }));
          setTimeout(() => setBubbles(prev => ({ ...prev, KAEL: { ...prev.KAEL, visible: false } })), 4000);

          setTimeout(() => {
            setBubbles(prev => ({ ...prev, KAEL: { text: AGENT_DIALOGUE.TASK_ACTIVE.KAEL.mid, visible: true } }));
            setTimeout(() => setBubbles(prev => ({ ...prev, KAEL: { ...prev.KAEL, visible: false } })), 4000);
          }, 20000);

          setTimeout(() => {
            setBubbles(prev => ({ ...prev, KAEL: { text: AGENT_DIALOGUE.TASK_ACTIVE.KAEL.near_done, visible: true } }));
            setTimeout(() => setBubbles(prev => ({ ...prev, KAEL: { ...prev.KAEL, visible: false } })), 4000);
          }, 50000);
        } else if (upperName === 'ZENO') {
          setBubbles(prev => ({ ...prev, ZENO: { text: AGENT_DIALOGUE.TASK_ACTIVE.ZENO.start, visible: true } }));
          setTimeout(() => setBubbles(prev => ({ ...prev, ZENO: { ...prev.ZENO, visible: false } })), 4000);

          setTimeout(() => {
            setBubbles(prev => ({ ...prev, ZENO: { text: AGENT_DIALOGUE.TASK_ACTIVE.ZENO.mid, visible: true } }));
            setTimeout(() => setBubbles(prev => ({ ...prev, ZENO: { ...prev.ZENO, visible: false } })), 4000);
          }, 25000);

          setTimeout(() => {
            setBubbles(prev => ({ ...prev, ZENO: { text: AGENT_DIALOGUE.TASK_ACTIVE.ZENO.near_done, visible: true } }));
            setTimeout(() => setBubbles(prev => ({ ...prev, ZENO: { ...prev.ZENO, visible: false } })), 4000);
          }, 45000);
        }
      } else if (prevTask && !currentTask) {
        // Task completed
        if (upperName === 'ARIA') {
           setBubbles(prev => ({ ...prev, ARIA: { text: AGENT_DIALOGUE.TASK_ACTIVE.ARIA.done, visible: true } }));
           setTimeout(() => setBubbles(prev => ({ ...prev, ARIA: { ...prev.ARIA, visible: false } })), 4000);
        }
      }

      prevTasksRef.current[upperName] = currentTask;
    });
  }, [localAgents]);

  // PHILOSOPHICAL
  useEffect(() => {
    if (!philosophicalAt) return;
    setBubbles(prev => ({ ...prev, KAEL: { text: philosophicalText || AGENT_DIALOGUE.PHILOSOPHICAL.KAEL, visible: true } }));
    const hide = setTimeout(() => {
      setBubbles(prev => ({ ...prev, KAEL: { ...prev.KAEL, visible: false } }));
    }, 5000);
    return () => clearTimeout(hide);
  }, [philosophicalAt, philosophicalText]);

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

  // Clock Sound Hook for Phase 2
  useEffect(() => {
    const handleTick = () => {
      if (soundEngine) {
        soundEngine.playClockTick();
      } else if (window.__workroom_sound) {
        window.__workroom_sound.playClockTick();
      }
    };
    window.__workroom_clockTick = handleTick;
    return () => {
      delete window.__workroom_clockTick;
    };
  }, [soundEngine]);


  // ── Territory-based movement is now handled inside AgentDot itself ──
  // Each agent self-manages waypoints via AGENT_TERRITORIES; no external nudge needed.

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: '#0d1117', // Cold dark blue-grey background
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
        <OrthographicCamera makeDefault position={[25, 22, 25]} zoom={38} near={0.1} far={1000} />
        <CameraZoomAnimator freezeZoomRef={freezeZoomRef} isMeetingActive={isMeetingActive} showArchitect={showArchitect} meetingStartedAt={meetingStartedAt} />
        <OrbitControls
          enableRotate={false}
          enablePan={false}
          enableZoom={false}
          target={[0, 0, 0]}
          makeDefault
        />

        {/* ── Lighting ──────────────────────────────────── */}
        {/* Ambient: bright enough to see all furniture clearly */}
        {/* YES path: office warms — cold blue-white becomes warm amber */}
        <ambientLight
          intensity={shadowTerminalAccess ? 1.0 : 4.5}
          color={architectOutcome === 'yes' ? '#ffe8cc' : '#c8d8ff'}
        />
        {/* Directional: from top-right for dramatic shadows */}
        <directionalLight
          position={[10, 20, 10]}
          intensity={shadowTerminalAccess ? 0.8 : 3.0}
          color={architectOutcome === 'yes' ? '#fff0d0' : '#d0e0ff'}
          castShadow
        />
        {/* Second Directional: from opposite angle for balanced visibility */}
        <directionalLight
          position={[-10, 15, -5]}
          intensity={shadowTerminalAccess ? 0.4 : (architectOutcome === 'yes' ? 2.5 : 1.5)}
          color={architectOutcome === 'yes' ? '#ffddaa' : '#b0c8ff'}
        />
        {/* YES path: additional warm fill light */}
        {architectOutcome === 'yes' && (
          <pointLight position={[0, 4, 0]} intensity={3.0} color="#ffcc88" distance={20} />
        )}

        {/* ── Office Architecture ───────────────────────── */}
        <group>
          {/* Main Floor */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[24, 16]} />
            <meshStandardMaterial color="#0f1420" roughness={0.8} metalness={0.2} />
          </mesh>

          {/* Surrounding Walls */}
          <mesh position={[0, 2, -8]} receiveShadow castShadow>
            <boxGeometry args={[24, 4, 0.2]} />
            <meshStandardMaterial color="#1a2035" />
          </mesh>
          {/* Front Wall (Split for door) */}
          <mesh position={[-4, 2, 8]} receiveShadow castShadow>
            <boxGeometry args={[16, 4, 0.2]} />
            <meshStandardMaterial color="#1a2035" />
          </mesh>
          <mesh position={[9, 2, 8]} receiveShadow castShadow>
            <boxGeometry args={[6, 4, 0.2]} />
            <meshStandardMaterial color="#1a2035" />
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
            <meshStandardMaterial color="#1a2035" />
          </mesh>
          <mesh position={[12, 2, 0]} receiveShadow castShadow>
            <boxGeometry args={[0.2, 4, 16]} />
            <meshStandardMaterial color="#1a2035" />
          </mesh>



          <DeskGrid
            agentTerminalContent={agentTerminalContent}
            kaelTerminalLines={terminalContent?.kael}
            zenoTerminalLines={terminalContent?.zeno}
            ariaTerminalLines={terminalContent?.aria}
            ariaCabinLightOff={ariaCabinLightOff || socketAriaCabinLightOff}
            zenoMonitorDark={zenoMonitorDark}
            observerPCFlickering={observerPCFlickering}
            onObserverPCClick={onObserverPCClick}
            onPaperClick={onPaperClick}
            architectOutcome={architectOutcome}
            kaelMonitorBlank={shadowTerminalAccess}
          />
        </group>

        {/* ── Dynamic Agents ────────────────────────────── */}
        {localAgents.map(agent => {
          let overridePos = meetingPositionsRef.current ? meetingPositionsRef.current[agent.name] : null;
          if (!overridePos && agent.name === 'ZENO') {
            if (zenoPreWalkState === 'observer') {
              overridePos = { x: 0, z: 1.5 };
            } else if (zenoPreWalkState === 'kael') {
              overridePos = { x: 1, z: 0 };
            }
          }
          return (
            <AgentDot
              key={agent.id}
              {...agent}
              overrideX={overridePos?.x}
              overrideZ={overridePos?.z}
              isSelected={selectedAgent === agent.id}
              isFrozen={thirdWallAgent === agent.id}
              onClick={() => setSelectedAgent(agent.id === selectedAgent ? null : agent.id)}
            />
          );
        })}


        {/* ── THE ARCHIVIST ─────────────────────────────── */}
        <TheArchivist warmWhite={archivistWarmWhite} doorOpen={archivistDoorOpen} />

        {/* ── THE ARCHITECT FIGURE ─────────────────────── */}
        <ArchitectFigure
          visible={architectFigureVisible}
          isSeated={architectIsSeated}
          onArrivedAtDesk={onArchitectArrivedAtDesk}
          architectOutcome={architectOutcome}
        />

        {/* ── THE INTERN ───────────────────────────────── */}
        <TheIntern
          isMeetingActive={isMeetingActive}
          onDismiss={handleInternDismiss}
        />

        <SpeechBubbleProjector agents={localAgents} bubbleCoords={bubbleCoords} meetingPositionsRef={meetingPositionsRef} isMeetingActive={isMeetingActive} setBubbleCoordsState={setBubbleCoordsState} />

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
      {showTerminal && (
        <TheTerminal onClose={() => {
          onTerminalClose && onTerminalClose();
        }} />
      )}

      {/* ── Speech Bubbles ── */}
      {['ARIA', 'KAEL', 'ZENO'].map(agentName => {
        const agent = localAgents.find(a => a.name === agentName);
        return (
          <SpeechBubble
            key={agentName}
            text={bubbles[agentName]?.text || ''}
            visible={!isMeetingActive && (bubbles[agentName]?.visible || false)}
            agentColor={agent?.color}
            screenX={bubbleCoordsState[agentName]?.screenX || 0}
            screenY={bubbleCoordsState[agentName]?.screenY || 0}
          />
        );
      })}
    </div>
  );
};

export default OfficeCanvas;
