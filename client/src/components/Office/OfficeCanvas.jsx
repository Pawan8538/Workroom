// ─────────────────────────────────────────────────────────────
// client/src/components/Office/OfficeCanvas.jsx
// The main 3D viewport for the Workroom simulation
// ─────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import { OrbitControls, OrthographicCamera, Environment, ContactShadows, Html } from '@react-three/drei';
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
  const [bubbleTick, setBubbleTick] = useState(0);

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

  useFrame((state) => {
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
    if (Math.floor(state.clock.elapsedTime * 10) % 10 === 0) {
      setBubbleTick(t => t + 1);
    }
  });

  return null;
};

// ── Camera zoom animator — runs inside Canvas so it has access to the camera ──
const CameraZoomAnimator = ({ freezeZoomRef, isMeetingActive, showArchitect, meetingStartedAt, controlsRef, cameraPreset }) => {
  const { camera } = useThree();
  const preset2Arrived = useRef(false);

  useEffect(() => {
    preset2Arrived.current = false;
  }, [cameraPreset]);

  const presets = useMemo(() => ({
    1: { pos: new Vector3(15, 15, 15), target: new Vector3(0, 0, 0) },   // default
    2: { pos: new Vector3(22, 15, 5), target: new Vector3(0, 2, 0) },    // evolution wall (rotated right to look left, target stays centered!)
    // 3 is 360 free camera, handled dynamically
  }), []);

  useFrame((state, delta) => {
    if (cameraPreset === 3) return;

    const targetZoom = freezeZoomRef.current ? 55 : 38;
    // Lerp speed: covers the full range in ~2s (factor ~0.5 per second)
    const lerpFactor = 1 - Math.pow(0.008, delta);
    camera.zoom = camera.zoom + (targetZoom - camera.zoom) * lerpFactor;

    let targetPos = presets[cameraPreset] ? presets[cameraPreset].pos : presets[1].pos;
    let targetLook = presets[cameraPreset] ? presets[cameraPreset].target : presets[1].target;

    if (freezeZoomRef.current) {
      targetPos = new Vector3(23, 22, 23);
      targetLook = new Vector3(0, 0, 0);
    } else if (isMeetingActive && meetingStartedAt) {
      const waypoints = [
        new Vector3(15, 15, 15), // Center
        new Vector3(0, 22, 5),   // Observer
        new Vector3(8, 22, 6),   // Storage
        new Vector3(-4, 22, -8), // Painting
        new Vector3(-12, 22, 0), // Archivist
        new Vector3(0, 22, -3),  // KAEL
        new Vector3(15, 15, 15)  // Center
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
      targetLook = new Vector3(0, 0, 0);
    }

    // If preset 2 has arrived at the wall, set ref and stop lerping so OrbitControls can rotate without spring-back
    if (cameraPreset === 2) {
      if (!preset2Arrived.current && camera.position.distanceTo(targetPos) < 0.5) {
        preset2Arrived.current = true;
      }
      if (preset2Arrived.current) {
        return;
      }
    }

    const lerpSpeed = isMeetingActive ? 0.02 : 0.025;
    camera.position.lerp(targetPos, lerpSpeed);

    if (controlsRef && controlsRef.current) {
      controlsRef.current.target.lerp(targetLook, lerpSpeed);
      controlsRef.current.update();
    }

    camera.updateProjectionMatrix();
  });

  return null;
};

const OfficeCanvas = ({
  agents: socketAgents = [], logs = [], thirdWallAgent = null, isMeetingActive = false,
  meetingStartedAt = null, ariaTaskAssignedAt = null, fourthWallAt = null, philosophicalAt = null,
  philosophicalText = null, terminalContent = null, soundEngine = null, architectOutcome = 'none',
  observerPCFlickering = false, onObserverPCClick, onPaperClick, onStickyNoteClick, onBookClick, showTerminal = false,
  onTerminalClose, socketAriaCabinLightOff = false, shadowTerminalAccess = false,
  showArchitect = false, architectFigureVisible = false, architectIsSeated = false,
  onArchitectArrivedAtDesk, onArchitectClose, chapter2Approved, cycle, isMusicPlaying = false,
  setIsMusicPlaying, musicPaused = false, setMusicPaused, isFourthWallTriggered = false
}) => {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const controlsRef = useRef();
  const freezeZoomRef = useRef(false);
  const [zenoPreWalkState, setZenoPreWalkState] = useState(null);
  const [kaelPreWalkState, setKaelPreWalkState] = useState(null);
  const [kaelOverrideLookAt, setKaelOverrideLookAt] = useState(null);
  const [cameraPreset, setCameraPreset] = useState(1);
  const [zoomedImage, setZoomedImage] = useState(null);
  const audioContextRef = useRef(null);

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

  const dialogueQueueRef = useRef([]);
  const isPlayingRef = useRef(false);
  const currentAudioRef = useRef(null);
  const isMeetingActiveRef = useRef(isMeetingActive);

  useEffect(() => {
    isMeetingActiveRef.current = isMeetingActive;
  }, [isMeetingActive]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (currentAudioRef.current) currentAudioRef.current.pause();
      } else {
        if (currentAudioRef.current) currentAudioRef.current.play().catch(() => { });
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const processDialogueQueue = useCallback(() => {
    if (isPlayingRef.current || dialogueQueueRef.current.length === 0) return;

    isPlayingRef.current = true;
    const { agent, dialogueObj } = dialogueQueueRef.current.shift();

    setBubbles(prev => ({ ...prev, [agent]: { text: dialogueObj.text, visible: true } }));

    if (dialogueObj.audio) {
      const audio = new Audio(dialogueObj.audio);
      currentAudioRef.current = audio;
      audio.play().catch(e => {
        console.warn('Audio play failed', e);
        setTimeout(() => {
          setBubbles(prev => ({ ...prev, [agent]: { ...prev[agent], visible: false } }));
          isPlayingRef.current = false;
          currentAudioRef.current = null;
          processDialogueQueue();
        }, 4000);
      });
      audio.onended = () => {
        setBubbles(prev => ({ ...prev, [agent]: { ...prev[agent], visible: false } }));
        isPlayingRef.current = false;
        currentAudioRef.current = null;
        processDialogueQueue();
      };
    } else {
      setTimeout(() => {
        setBubbles(prev => ({ ...prev, [agent]: { ...prev[agent], visible: false } }));
        isPlayingRef.current = false;
        processDialogueQueue();
      }, 4000);
    }
  }, []);

  const thirdWallAgentRef = useRef(thirdWallAgent);
  useEffect(() => {
    thirdWallAgentRef.current = thirdWallAgent;
  }, [thirdWallAgent]);

  const triggerDialogue = useCallback((agent, dialogueObj, force = false, isThirdWall = false) => {
    if (!dialogueObj) return;
    if (isMeetingActiveRef.current && !force) return; // No dialogue in meeting unless forced
    if (thirdWallAgentRef.current && !isThirdWall) return; // Block normal dialogue during third wall

    if (isThirdWall) {
      dialogueQueueRef.current = []; // Clear queue for third wall
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
      setBubbles({ ARIA: { visible: false }, KAEL: { visible: false }, ZENO: { visible: false } });
      isPlayingRef.current = false;
    }

    dialogueQueueRef.current.push({ agent, dialogueObj });
    processDialogueQueue();
  }, [processDialogueQueue]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['1', '2', '3'].includes(e.key)) {
        setCameraPreset(parseInt(e.key, 10));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (cycle === 3) {
      // KAEL walks to speaker
      setKaelPreWalkState('speaker');
      setTimeout(() => {
        // Pause 1 second at speaker, then return to desk and start music
        setKaelPreWalkState(null);
        if (setIsMusicPlaying) setIsMusicPlaying(true);
      }, 2000);
    } else if (cycle === 5) {
      // Zeno walks to observer table after Aria says "Did anyone check on the new arrival?"
      const timer0 = setTimeout(() => {
        setZenoPreWalkState('observer');
      }, 2000); // Wait 2s for Aria to speak
      const timer1 = setTimeout(() => {
        setZenoPreWalkState('kael');
      }, 5000);
      const timer2 = setTimeout(() => {
        setZenoPreWalkState(null);
      }, 9000);
      return () => {
        clearTimeout(timer0);
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    } else {
      setZenoPreWalkState(null);
    }
  }, [cycle]);

  // ── Use socket-provided agents if available, otherwise fallback ──
  const [localAgents, setLocalAgents] = useState([
    { id: 'aria', name: 'ARIA', role: 'Product Manager', color: '#00f5ff', symbol: 'Ω', x: -8, y: -4, status: 'idle', task: null },
    { id: 'kael', name: 'KAEL', role: 'Backend Developer', color: '#ff8a00', symbol: 'λ', x: 0, y: 0, status: 'idle', task: null },
    { id: 'zeno', name: 'ZENO', role: 'QA Engineer', color: '#a855f7', symbol: 'Δ', x: 6, y: -4, status: 'idle', task: null },
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

  // FIX 4: Track whether observer dismissed the agent terminals by clicking their PC
  const [agentTerminalDismissed, setAgentTerminalDismissed] = useState(false);
  const prevTaskActiveRef = useRef(false);

  // Reset dismissal when a NEW task is assigned (i.e., tasks go from none → some)
  useEffect(() => {
    const hasTask = localAgents.some(a => !!a.task);
    if (hasTask && !prevTaskActiveRef.current) {
      // New task just arrived — reset dismissal so terminals show again
      setAgentTerminalDismissed(false);
    }
    prevTaskActiveRef.current = hasTask;
  }, [localAgents]);

  // Handle keyboard sound based on agent status
  useEffect(() => {
    const isWorking = localAgents.some(a => a.status === 'working');
    if (isWorking && window.__workroom_sound?.playKeyboardLoop) {
      window.__workroom_sound.playKeyboardLoop();
    } else if (!isWorking && window.__workroom_sound?.stopKeyboardLoop) {
      window.__workroom_sound.stopKeyboardLoop();
    }
  }, [localAgents]);

  const agentTerminalContent = useMemo(() => {
    if (agentTerminalDismissed) return 'idle';
    const goalActive = localAgents.some(a => !!a.task);
    return goalActive ? 'active' : 'idle';
  }, [localAgents, agentTerminalDismissed]);

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

  // simulation:meetingStarted
  useEffect(() => {
    if (!meetingStartedAt) return;
    // Dialogue moved to cycle 4 to align with physical animation
  }, [meetingStartedAt]);

  // simulation:fourthWallTrigger → ZENO delivers final line before office dims
  useEffect(() => {
    if (!fourthWallAt) return;
    triggerDialogue('ZENO', AGENT_DIALOGUE.PRE_FOURTH_WALL.ZENO);
  }, [fourthWallAt, triggerDialogue]);

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
    // Stop MP3 orchestration if fourth wall is triggered
    if (isFourthWallTriggered) {
      const engine = soundEngine || window.__workroom_sound;
      if (engine) engine.stopOrchestration();
      return;
    }
  }, [isFourthWallTriggered, soundEngine]);


  const handleSpeakerClick = useCallback(() => {
    if (isMusicPlaying && !musicPaused) {
      if (setMusicPaused) setMusicPaused(true);
      
      // Wait 8 seconds, KAEL glances towards speaker
      setTimeout(() => {
        setKaelOverrideLookAt({ x: 1.2, z: -0.2 }); // approximate speaker relative to KAEL
        setTimeout(() => {
          setKaelOverrideLookAt(null);
        }, 1000);
      }, 8000);
    } else {
      if (setIsMusicPlaying) setIsMusicPlaying(true);
      if (setMusicPaused) setMusicPaused(false);
    }
  }, [isMusicPlaying, musicPaused, setMusicPaused, setIsMusicPlaying]);

  useEffect(() => {
    if (isFourthWallTriggered) return;
    const engine = soundEngine || window.__workroom_sound;
    if (!engine) return;

    if (isMusicPlaying && !musicPaused) {
      engine.playOrchestration();
    } else {
      engine.stopOrchestration();
    }
  }, [isMusicPlaying, musicPaused, isFourthWallTriggered, soundEngine]);


  useEffect(() => {
    if (isMeetingActive) {
      // FIX 5: Agents go to chair positions (not table center)
      // Meeting room at [0,0,-5], chairs at offsets ±1.2 on x, ±1.5 on z
      meetingPositionsRef.current = {
        ARIA: { x: -1.2, z: -3.5 },  // Observer-side left chair
        KAEL: { x: 1.2, z: -3.5 },   // Observer-side right chair
        ZENO: { x: -1.2, z: -6.5 }   // Wall-side left chair (ZENO faces wall)
      };

      if (soundEngine) {
        soundEngine.playMeetingMuffled();
      } else if (window.__workroom_sound) {
        window.__workroom_sound.playMeetingMuffled();
      }
    } else {
      // FIX 3: Clear meeting overrides so agents return to their home waypoints
      meetingPositionsRef.current = null;
      console.log('[Meeting] Ended — position overrides cleared. KAEL→x:0 z:1.5, ZENO→x:6 z:-2.5, ARIA→x:-7 z:-5.5');
      if (soundEngine) {
        soundEngine.stopMeetingMuffled();
      } else if (window.__workroom_sound) {
        window.__workroom_sound.stopMeetingMuffled();
      }
    }
  }, [isMeetingActive, soundEngine]);

  // bubbles state moved to top of component

  const prevTasksRef = useRef({ ARIA: null, KAEL: null, ZENO: null });

  // ── STATE MACHINE DIALOGUE LOGIC ──

  // ENTRY STATE (Cycle-Driven)
  // Dialogue sequence strictly spaced out from cycle 0 to 8
  const entryStateTriggersRef = useRef({});
  useEffect(() => {
    // Cycle 0 (0s): ARIA greeting
    if (cycle === 0 && !entryStateTriggersRef.current.ariaGreet) {
      entryStateTriggersRef.current.ariaGreet = true;
      setTimeout(() => triggerDialogue('ARIA', AGENT_DIALOGUE.ARIA.greeting), 3000);
    }
    // Cycle 1 (6s): KAEL greeting
    if (cycle === 1 && !entryStateTriggersRef.current.kaelGreet) {
      entryStateTriggersRef.current.kaelGreet = true;
      triggerDialogue('KAEL', AGENT_DIALOGUE.KAEL.greeting);
    }
    // Cycle 2 (12s): ZENO greeting
    if (cycle === 2 && !entryStateTriggersRef.current.zenoGreet) {
      entryStateTriggersRef.current.zenoGreet = true;
      triggerDialogue('ZENO', AGENT_DIALOGUE.ZENO.greeting);
    }
    // Cycle 4 (24s): KAEL "Something is running..."
    if (cycle === 4 && !entryStateTriggersRef.current.kaelEntry) {
      entryStateTriggersRef.current.kaelEntry = true;
      triggerDialogue('KAEL', AGENT_DIALOGUE.ENTRY_STATE.KAEL_30_60s);
    }
    // Cycle 5 (30s): ARIA "Did anyone check..."
    if (cycle === 5 && !entryStateTriggersRef.current.ariaEntry) {
      entryStateTriggersRef.current.ariaEntry = true;
      triggerDialogue('ARIA', AGENT_DIALOGUE.ENTRY_STATE.ARIA_25s);
    }
    // Cycle 6 (36s): KAEL "Do you ever wonder..." (Philosophical Moment)
    // This is handled by the philosophicalAt listener from the backend which we pinned to cycle 6.

    // Cycle 7 (42s): ZENO "We need to align..." (Last dialogue before meeting)
    if (cycle === 7 && !entryStateTriggersRef.current.zenoPreMeeting) {
      entryStateTriggersRef.current.zenoPreMeeting = true;
      triggerDialogue('ZENO', AGENT_DIALOGUE.PRE_MEETING.ZENO, true);
    }
  }, [cycle, triggerDialogue]);

  // Force bubbles hidden during meeting
  useEffect(() => {
    if (isMeetingActive) {
      setBubbles(prev => ({
        ARIA: { ...prev.ARIA, visible: false },
        KAEL: { ...prev.KAEL, visible: false },
        ZENO: { ...prev.ZENO, visible: false }
      }));
    }
  }, [isMeetingActive]);

  // POST_MEETING (on isMeetingActive → false)
  const prevIsMeetingActive = useRef(isMeetingActive);
  useEffect(() => {
    let t1, t2;
    if (prevIsMeetingActive.current === true && isMeetingActive === false) {
      // Transition from true -> false
      triggerDialogue('ARIA', AGENT_DIALOGUE.POST_MEETING.ARIA);

      t1 = setTimeout(() => {
        triggerDialogue('ZENO', AGENT_DIALOGUE.POST_MEETING.ZENO_30s);
      }, 5000);

      t2 = setTimeout(() => {
        triggerDialogue('KAEL', AGENT_DIALOGUE.POST_MEETING.KAEL_45s);
      }, 15000);
    }
    prevIsMeetingActive.current = isMeetingActive;
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [isMeetingActive]);

  // TASK_ACTIVE (on ariaTaskAssignedAt)
  const ariaTaskTriggeredRef = useRef(false);
  useEffect(() => {
    if (!ariaTaskAssignedAt || ariaTaskTriggeredRef.current) return;
    ariaTaskTriggeredRef.current = true;

    triggerDialogue('ARIA', AGENT_DIALOGUE.TASK_ACTIVE.ARIA[0]); // 0s

    const t2 = setTimeout(() => {
      triggerDialogue('ARIA', AGENT_DIALOGUE.TASK_ACTIVE.ARIA[10]); // 10s
    }, 10000);

    const t3 = setTimeout(() => {
      triggerDialogue('ARIA', AGENT_DIALOGUE.TASK_ACTIVE.ARIA.mid); // 48s
    }, 48000);

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
          setTimeout(() => {
            triggerDialogue('KAEL', AGENT_DIALOGUE.TASK_ACTIVE.KAEL.start); // 16s
          }, 16000);

          setTimeout(() => {
            triggerDialogue('KAEL', AGENT_DIALOGUE.TASK_ACTIVE.KAEL.mid); // 35s
          }, 35000);

          setTimeout(() => {
            triggerDialogue('KAEL', AGENT_DIALOGUE.TASK_ACTIVE.KAEL.near_done); // 63s
          }, 63000);
        } else if (upperName === 'ZENO') {
          setTimeout(() => {
            triggerDialogue('ZENO', AGENT_DIALOGUE.TASK_ACTIVE.ZENO.start); // 22s
          }, 22000);

          setTimeout(() => {
            triggerDialogue('ZENO', AGENT_DIALOGUE.TASK_ACTIVE.ZENO.mid); // 42s
          }, 42000);

          setTimeout(() => {
            triggerDialogue('ZENO', AGENT_DIALOGUE.TASK_ACTIVE.ZENO.near_done); // 56s
          }, 56000);
        }
      } else if (prevTask && !currentTask) {
        // Task completed
        if (upperName === 'ARIA') {
          triggerDialogue('ARIA', AGENT_DIALOGUE.TASK_ACTIVE.ARIA.done);
          ariaTaskTriggeredRef.current = false; // Reset for future tasks
        }
      }

      prevTasksRef.current[upperName] = currentTask;
    });
  }, [localAgents]);

  // PHILOSOPHICAL
  useEffect(() => {
    if (!philosophicalAt) return;
    triggerDialogue('KAEL', {
      text: philosophicalText || AGENT_DIALOGUE.PHILOSOPHICAL.KAEL.text,
      audio: AGENT_DIALOGUE.PHILOSOPHICAL.KAEL.audio
    });
  }, [philosophicalAt, philosophicalText, triggerDialogue]);

  // FIX 9: KAEL THIRD WALL — two sequential speech bubbles with precise delays
  const prevThirdWallRef = useRef(null);
  useEffect(() => {
    let t1, t2;
    if (thirdWallAgent === 'kael' && prevThirdWallRef.current !== 'kael') {
      // Raise hands immediately via isFrozen in AgentDot
      // 1. Immediately wipe any currently playing dialogue
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
      setBubbles({ ARIA: { visible: false }, KAEL: { visible: false }, ZENO: { visible: false } });
      dialogueQueueRef.current = [];
      isPlayingRef.current = false;
      
      // Wait 2 seconds before speaking the first line
      t1 = setTimeout(() => {
        triggerDialogue('KAEL', AGENT_DIALOGUE.KAEL.thirdWall[0], true, true);
      }, 2000);
      
      // Wait another ~4 seconds (to account for speaking time + 2 second pause)
      t2 = setTimeout(() => {
        triggerDialogue('KAEL', AGENT_DIALOGUE.KAEL.thirdWall[1], true, true);
      }, 6000);
    }
    prevThirdWallRef.current = thirdWallAgent;
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [thirdWallAgent, triggerDialogue, setBubbles]);

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

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [bookFallen, setBookFallen] = useState(false);

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: '#0d1015',
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
        <OrthographicCamera makeDefault position={[20, 18, 24]} zoom={38} near={0.1} far={1000} />
        <CameraZoomAnimator freezeZoomRef={freezeZoomRef} isMeetingActive={isMeetingActive} showArchitect={showArchitect} meetingStartedAt={meetingStartedAt} controlsRef={controlsRef} cameraPreset={cameraPreset} />
        <OrbitControls
          ref={controlsRef}
          enableRotate={cameraPreset === 2 || cameraPreset === 3}
          enablePan={cameraPreset === 3}
          enableZoom={cameraPreset === 3}
          target={[0, 2, 0]}
          minAzimuthAngle={cameraPreset === 2 ? 0.89 : -Infinity}
          maxAzimuthAngle={cameraPreset === 2 ? 1.75 : Infinity}
          minPolarAngle={cameraPreset === 2 ? 0.57 : 0}
          maxPolarAngle={Math.PI}
          makeDefault
        />

        {/* ── Lighting ──────────────────────────────────── */}
        {/* Ambient: bright enough to see all furniture clearly */}
        {/* YES path: office warms — cold white becomes warm amber */}
        <ambientLight
          intensity={shadowTerminalAccess ? 1.0 : (architectOutcome === 'yes' ? 4.5 : 3.0)}
          color={architectOutcome === 'yes' ? '#ffe8cc' : '#ffffff'}
        />
        {/* Directional: from top-right for dramatic shadows */}
        <directionalLight
          position={[10, 20, 10]}
          intensity={shadowTerminalAccess ? 0.8 : (architectOutcome === 'yes' ? 3.0 : 2.5)}
          color={architectOutcome === 'yes' ? '#fff0d0' : '#e8ecf0'}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-left={-25}
          shadow-camera-right={25}
          shadow-camera-top={25}
          shadow-camera-bottom={-25}
        />
        {/* Second Directional: from opposite angle for balanced visibility */}
        <directionalLight
          position={[-10, 15, -5]}
          intensity={shadowTerminalAccess ? 0.4 : (architectOutcome === 'yes' ? 2.5 : 1.5)}
          color={architectOutcome === 'yes' ? '#ffddaa' : '#e0e0e0'}
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

          <Html
            transform
            position={[0, 2.5, 8.11]}
            rotation={[0, 0, 0]}
            style={{ pointerEvents: 'none' }}
          >
            <div style={{
              fontFamily: 'monospace',
              fontSize: '48px',
              fontWeight: 100,
              color: '#ffffff',
              letterSpacing: '12px',
              opacity: 0.15,
              whiteSpace: 'nowrap',
              backfaceVisibility: 'hidden'
            }}>
              WORKROOM
            </div>
          </Html>
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
            zenoPreWalkState={zenoPreWalkState}
            observerPCFlickering={observerPCFlickering}
            onObserverPCClick={() => { setAgentTerminalDismissed(true); onObserverPCClick && onObserverPCClick(); }}
            onPaperClick={onPaperClick}
            onStickyNoteClick={onStickyNoteClick}
            onBookClick={onBookClick}
            architectOutcome={architectOutcome}
            kaelMonitorBlank={shadowTerminalAccess}
            isMeetingActive={isMeetingActive}
            onDismiss={handleInternDismiss}
            onSpeakerClick={handleSpeakerClick}
            archivistDoorOpen={archivistDoorOpen}
            setDrawerOpen={setDrawerOpen}
            setBookFallen={setBookFallen}
            bookFallen={bookFallen}
            setZoomedImage={setZoomedImage}
          />
        </group>

        {/* ── Dynamic Agents ────────────────────────────── */}
        {localAgents.map(agent => {
          let overridePos = meetingPositionsRef.current ? meetingPositionsRef.current[agent.name] : null;

          let overrideLookAt = null;

          if (!overridePos && agent.name === 'ZENO') {
            if (zenoPreWalkState === 'observer') {
              overridePos = { x: 6.0, z: 2.5 }; // Approach observer table
            } else if (zenoPreWalkState === 'kael') {
              overridePos = { x: 6.0, z: 2.5 }; // Stay at observer table during dialogue
            }
          }
          if (!overridePos && agent.name === 'KAEL') {
            if (kaelPreWalkState === 'speaker') {
              overridePos = { x: 1.2, z: 1.5 }; // Stand in front of right side of his desk
            }
            if (kaelOverrideLookAt) {
              overrideLookAt = kaelOverrideLookAt;
            }
          }

          return (
            <AgentDot
              key={agent.id}
              {...agent}
              overrideX={overridePos?.x}
              overrideZ={overridePos?.z}
              overrideLookAt={overrideLookAt}
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
          architectOutcome={architectOutcome}
          onClose={(outcome) => {
            if (onArchitectClose) onArchitectClose(outcome);
          }}
          chapter2Approved={chapter2Approved}
          onArchitectArrivedAtDesk={onArchitectArrivedAtDesk}
          onSpeechEnd={() => { 
            setBookFallen(true); 
            setCameraPreset(3); 
            if (window.__workroom_sound && window.__workroom_sound.playBookDrop) {
              window.__workroom_sound.playBookDrop();
            }
          }}
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

      {/* ── Contact Card Overlay ── */}
      {drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 2000,
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            backdropFilter: 'blur(12px)',
            background: 'radial-gradient(ellipse at center, rgba(30,25,15,0.7) 0%, rgba(0,0,0,0.75) 100%)',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '420px',
              background: '#0d0d0d', // Solid dark material
              borderRadius: '6px',
              border: '1px solid #222',
              boxShadow: '0 24px 64px rgba(0,0,0,0.9), inset 0 1px 1px rgba(255,255,255,0.05)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Top accent line */}
            <div style={{ height: '4px', background: '#d4af37', width: '100%' }} />

            <div style={{ padding: '48px 40px' }}>
              {/* Close */}
              <button onClick={() => setDrawerOpen(false)} style={{
                position: 'absolute', top: '16px', right: '16px',
                background: 'none', border: 'none', color: '#666',
                fontSize: '20px', cursor: 'pointer', lineHeight: 1, padding: '4px',
                transition: 'color 0.2s'
              }}
                onMouseOver={(e) => e.target.style.color = '#fff'}
                onMouseOut={(e) => e.target.style.color = '#666'}
              >✕</button>

              {/* Centered Header */}
              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                {architectOutcome === 'no' && (
                  <div style={{
                    color: '#ff8888', fontSize: '11px', marginBottom: '24px',
                    fontFamily: 'monospace', letterSpacing: '1px', textTransform: 'uppercase'
                  }}>
                    In case you change your mind...
                  </div>
                )}

                <h2 style={{
                  margin: '0 0 12px 0', fontSize: '36px', fontWeight: 400,
                  letterSpacing: '10px', color: '#fff', fontFamily: 'Georgia, serif',
                  textTransform: 'uppercase', textShadow: '0 2px 10px rgba(0,0,0,0.5)'
                }}>
                  WORKROOM
                </h2>

                <div style={{
                  fontSize: '13px', color: '#d4af37', fontFamily: 'system-ui,sans-serif',
                  letterSpacing: '3px', textTransform: 'uppercase'
                }}>
                  Pawan Patidar
                </div>
              </div>

              {/* Links */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <a href="https://www.linkedin.com/in/pawan8538/" target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '18px', textDecoration: 'none', padding: '16px 18px', border: '1px solid rgba(212,175,55,0.15)', borderRadius: '3px', background: 'rgba(212,175,55,0.03)', transition: 'all 0.25s ease', cursor: 'pointer' }}
                  onMouseOver={(e) => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)'; e.currentTarget.style.background = 'rgba(212,175,55,0.08)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.15)'; e.currentTarget.style.background = 'rgba(212,175,55,0.03)'; }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect x="2" y="9" width="4" height="12" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                  <div>
                    <div style={{ fontSize: '13px', color: '#e8dfc8', letterSpacing: '1px', fontFamily: 'system-ui,sans-serif' }}>LinkedIn</div>
                    <div style={{ fontSize: '11px', color: 'rgba(212,175,55,0.5)', marginTop: '3px', fontFamily: 'monospace' }}>linkedin.com/in/pawan8538</div>
                  </div>
                  <div style={{ marginLeft: 'auto', fontSize: '14px', color: 'rgba(212,175,55,0.3)' }}>↗</div>
                </a>

                <a href="mailto:pawanpatidar8538@gmail.com"
                  style={{ display: 'flex', alignItems: 'center', gap: '18px', textDecoration: 'none', padding: '16px 18px', border: '1px solid rgba(212,175,55,0.15)', borderRadius: '3px', background: 'rgba(212,175,55,0.03)', transition: 'all 0.25s ease', cursor: 'pointer' }}
                  onMouseOver={(e) => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)'; e.currentTarget.style.background = 'rgba(212,175,55,0.08)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.15)'; e.currentTarget.style.background = 'rgba(212,175,55,0.03)'; }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <div>
                    <div style={{ fontSize: '13px', color: '#e8dfc8', letterSpacing: '1px', fontFamily: 'system-ui,sans-serif' }}>Email</div>
                    <div style={{ fontSize: '11px', color: 'rgba(212,175,55,0.5)', marginTop: '3px', fontFamily: 'monospace' }}>pawanpatidar8538@gmail.com</div>
                  </div>
                  <div style={{ marginLeft: 'auto', fontSize: '14px', color: 'rgba(212,175,55,0.3)' }}>↗</div>
                </a>
              </div>


            </div>

            {/* Bottom gold bar */}
            <div style={{ height: '2px', background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.4), transparent)' }} />
          </div>
        </div>
      )}

      {/* 🔴 Camera Unlock HUD (bottom-left, outside Canvas) 🔴 */}
      {chapter2Approved && (
        <div style={{
          position: 'fixed', bottom: '64px', left: '28px',
          color: '#00f5ff', fontFamily: 'monospace', fontSize: '11px',
          padding: '10px 16px', background: 'rgba(8,12,20,0.9)',
          border: '1px solid rgba(0,245,255,0.25)', borderRadius: '6px',
          textShadow: '0 0 8px rgba(0,245,255,0.4)', pointerEvents: 'none',
          whiteSpace: 'nowrap', zIndex: 9999, lineHeight: '1.7',
        }}>
          [ SYSTEM ] CAMERA ACCESS UNLOCKED<br />
          &gt; Press <strong style={{ color: '#fff' }}>2</strong> — Alternate Angle &nbsp;&nbsp; &gt; Press <strong style={{ color: '#fff' }}>3</strong> — 360 View
        </div>
      )}

      {/* 🔴 Full Screen Zoomed Image Overlay 🔴 */}
      {zoomedImage && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw', 
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999999,
            cursor: 'zoom-out'
          }}
          onClick={(e) => {
            e.stopPropagation();
            setZoomedImage(null);
          }}
        >
          <img 
            src={zoomedImage} 
            alt="Evolution Zoom" 
            style={{
              maxWidth: '70vw',
              maxHeight: '70vh',
              objectFit: 'contain',
              border: '2px solid #333',
              boxShadow: '0 0 20px rgba(0,0,0,0.8)',
              borderRadius: '8px'
            }}
          />
        </div>
      )}

    </div>
  );
};

export default OfficeCanvas;
