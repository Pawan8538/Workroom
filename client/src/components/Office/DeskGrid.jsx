import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { AGENT_TERRITORIES } from '../../constants/OFFICE_LAYOUT';
import * as THREE from 'three';

// Constant positions for elements not tied to a specific agent's 'home'
const MEETING_ROOM_POS = [0, 0, -5];
// Observer desk: Moved further from walls and facing top-left diagonal
const OBSERVER_DESK_POS = [7.0, 0, 3.5];
const STORAGE_CORNER_POS = [8, 0, 6];
const PAINTING_POS = [-4, 2, -7.9];
// Clock position restored to original
const CLOCK_POS = [6, 2.5, -7.85];

// ── THE TERMINAL MONITOR (Reusable Glowing Mesh) ──
const TerminalMonitor = ({ position, rotation = [0, 0, 0], onTerminalClick, emissiveColor = "#222222" }) => {
  const screenMatRef = useRef();

  useFrame(({ clock }) => {
    if (screenMatRef.current) {
      screenMatRef.current.emissiveIntensity = 0.6 + Math.sin(clock.getElapsedTime() * 2) * 0.3;
    }
  });

  return (
    <group position={position}>
      {/* Monitor Body */}
      <mesh 
        onClick={(e) => { e.stopPropagation(); onTerminalClick && onTerminalClick(); }}
        onPointerOver={(e) => { if(onTerminalClick) { e.stopPropagation(); document.body.style.cursor = 'pointer'; } }}
        onPointerOut={(e) => { if(onTerminalClick) { document.body.style.cursor = 'auto'; } }}
        castShadow
      >
        <boxGeometry args={[0.8, 0.5, 0.05]} />
        <meshStandardMaterial color="#050505" roughness={0.4} />
      </mesh>

      {/* Glowing screen — updated to dark grey */}
      <mesh position={[0, 0, 0.026]}>
        <planeGeometry args={[0.75, 0.45]} />
        <meshStandardMaterial
          ref={screenMatRef}
          color={emissiveColor}
          emissive={emissiveColor}
          emissiveIntensity={0.8}
          transparent
          opacity={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Monitor Stand */}
      <mesh position={[0, -0.15, -0.1]}>
        <boxGeometry args={[0.1, 0.3, 0.1]} />
        <meshStandardMaterial color="#050505" />
      </mesh>
    </group>
  );
};

// ── 1. ARIA CABIN ──
const AriaCabin = ({ agentTerminalContent, ariaTerminalLines, cabinLightOff }) => {
  const [archLines, setArchLines] = useState([]);
  const lineIndexRef = useRef(0);

  useEffect(() => {
    if (agentTerminalContent === 'active' && ariaTerminalLines && ariaTerminalLines.length > 0) {
      setArchLines([]);
      lineIndexRef.current = 0;
      const interval = setInterval(() => {
        setArchLines(prev => {
          if (lineIndexRef.current >= ariaTerminalLines.length) {
            clearInterval(interval);
            return prev;
          }
          const nextLine = ariaTerminalLines[lineIndexRef.current];
          lineIndexRef.current += 1;
          return [...prev, nextLine];
        });
      }, 600);
      return () => clearInterval(interval);
    } else {
      setArchLines([]);
    }
  }, [ariaTerminalLines, agentTerminalContent]);

  return (
    // FIX 10: Shifted cabin x from -8 to -7 to prevent top-left out-of-bounds clipping
    <group position={[-7, 0, AGENT_TERRITORIES.ARIA.home.z]}>
      {/* Enclosed walls (back, left, right) - now transparent glass */}
      {/* FIX 10: Offset cabin walls 0.05 inward to prevent z-fighting with outer office wall */}
      <mesh position={[0, 1.5, -1.95]} castShadow receiveShadow>
        <boxGeometry args={[4, 3, 0.2]} />
        <meshStandardMaterial color="#4466aa" transparent opacity={0.12} metalness={0.8} roughness={0.1} />
      </mesh>
      <mesh position={[-1.95, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 3, 4]} />
        <meshStandardMaterial color="#4466aa" transparent opacity={0.12} metalness={0.8} roughness={0.1} />
      </mesh>
      <mesh position={[1.95, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 3, 4]} />
        <meshStandardMaterial color="#4466aa" transparent opacity={0.12} metalness={0.8} roughness={0.1} />
      </mesh>

      {/* Glass front panel */}
      <mesh position={[-0.5, 1.5, 2]} receiveShadow>
        <boxGeometry args={[3, 3, 0.1]} />
        <meshStandardMaterial color="#4466aa" transparent opacity={0.12} roughness={0.1} metalness={0.8} />
      </mesh>

      {/* Door slightly ajar with warm light spilling through gap */}
      <group position={[1.5, 0, 2]} rotation={[0, 0.2, 0]}>
        <mesh position={[0.5, 1.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[1, 3, 0.1]} />
          <meshStandardMaterial color="#1a2035" roughness={0.8} />
        </mesh>
      </group>

      {/* Warm point light inside with amber contrast */}
      <pointLight position={[0, 2, 0]} intensity={cabinLightOff ? 0 : 2.5} color="#ffaa44" distance={6} />

      {/* Architecture Diagram on glass */}
      <Html
        transform
        distanceFactor={6}
        position={[-0.5, 1.5, 1.9]}
        style={{
          width: '280px',
          height: '280px',
          color: '#00ffff',
          fontFamily: 'monospace',
          fontSize: '8px',
          whiteSpace: 'pre',
          textShadow: '0 0 4px #00ffff',
          pointerEvents: 'none'
        }}
      >
        {archLines.join('\n')}
      </Html>

      {/* Desk */}
      <mesh position={[0, 0.7, -1]} castShadow receiveShadow>
        <boxGeometry args={[3, 0.1, 1.5]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.4} metalness={0.6} />
      </mesh>

      {/* Keyboard and Mouse */}
      <mesh position={[0, 0.76, -0.6]} castShadow>
        <boxGeometry args={[0.8, 0.02, 0.3]} />
        <meshStandardMaterial color="#111" roughness={0.8} />
      </mesh>
      <mesh position={[0.6, 0.76, -0.6]} castShadow>
        <boxGeometry args={[0.1, 0.03, 0.15]} />
        <meshStandardMaterial color="#111" roughness={0.8} />
      </mesh>

      {/* Monitor */}
      <group position={[0, 1.0, -1.5]} rotation={[0, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1.2, 0.7, 0.05]} />
          <meshStandardMaterial color="#050505" />
        </mesh>
        <mesh position={[0, 0, 0.026]}>
          <planeGeometry args={[1.1, 0.6]} />
          <meshStandardMaterial color="#00f5ff" emissive="#0088ff" emissiveIntensity={0.8} roughness={0.2} />
        </mesh>
      </group>

      {/* Small plant shape */}
      <group position={[1, 0.85, -1]}>
        {/* Pot */}
        <mesh castShadow>
          <cylinderGeometry args={[0.15, 0.1, 0.2, 8]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        {/* Leaves */}
        <mesh position={[0, 0.2, 0]} castShadow>
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshStandardMaterial color="#2e5c3e" roughness={0.9} />
        </mesh>
      </group>

      {/* Sprint Board */}
      <group position={[0, 1.5, -1.89]}>
        <mesh>
          <boxGeometry args={[2.5, 1.5, 0.02]} />
          <meshStandardMaterial color="#1a2a1a" />
        </mesh>
        {/* Divider lines */}
        <mesh position={[-0.4, 0, 0.015]}><boxGeometry args={[0.02, 1.4, 0.01]} /><meshBasicMaterial color="#333" /></mesh>
        <mesh position={[0.4, 0, 0.015]}><boxGeometry args={[0.02, 1.4, 0.01]} /><meshBasicMaterial color="#333" /></mesh>
        {/* Small box clusters */}
        <mesh position={[-0.8, 0.5, 0.02]}><boxGeometry args={[0.2, 0.15, 0.01]} /><meshBasicMaterial color="#42c5f5" /></mesh>
        <mesh position={[-0.8, 0.2, 0.02]}><boxGeometry args={[0.2, 0.15, 0.01]} /><meshBasicMaterial color="#f5e642" /></mesh>
        <mesh position={[0, 0.3, 0.02]}><boxGeometry args={[0.2, 0.15, 0.01]} /><meshBasicMaterial color="#f59142" /></mesh>
        <mesh position={[0.8, 0.1, 0.02]}><boxGeometry args={[0.2, 0.15, 0.01]} /><meshBasicMaterial color="#42c5f5" /></mesh>
      </group>
    </group>
  );
};

// ── 2. MEETING ROOM ──
const MeetingRoom = () => {
  return (
    <group position={MEETING_ROOM_POS}>
      {/* Glass walls two sides (front and left) */}
      <mesh position={[0, 1.5, 3]} receiveShadow>
        <boxGeometry args={[8, 3, 0.1]} />
        <meshStandardMaterial color="#3355aa" transparent opacity={0.3} roughness={0.1} metalness={0.9} />
      </mesh>
      <mesh position={[-4, 1.5, 0]} receiveShadow>
        <boxGeometry args={[0.1, 3, 6]} />
        <meshStandardMaterial color="#3355aa" transparent opacity={0.3} roughness={0.1} metalness={0.9} />
      </mesh>

      {/* Long table */}
      <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[5, 0.1, 2]} />
        <meshStandardMaterial color="#151515" roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Table Legs */}
      <mesh position={[-2, 0.375, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.75, 8]} />
        <meshStandardMaterial color="#050505" />
      </mesh>
      <mesh position={[2, 0.375, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.75, 8]} />
        <meshStandardMaterial color="#050505" />
      </mesh>

      {/* FIX 5: Chairs placed at correct positions around the table */}
      {/* Observer side (z:+1.5) - ARIA chair and KAEL chair */}
      <group position={[-1.2, 0, 1.5]}>
        <mesh castShadow>
          <boxGeometry args={[0.6, 0.1, 0.6]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.45, 0.28]} castShadow>
          <boxGeometry args={[0.6, 0.8, 0.08]} />
          <meshStandardMaterial color="#1e1e1e" roughness={0.8} />
        </mesh>
      </group>
      <group position={[1.2, 0, 1.5]}>
        <mesh castShadow>
          <boxGeometry args={[0.6, 0.1, 0.6]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.45, 0.28]} castShadow>
          <boxGeometry args={[0.6, 0.8, 0.08]} />
          <meshStandardMaterial color="#1e1e1e" roughness={0.8} />
        </mesh>
      </group>

      {/* Wall side (z:-1.5) - ZENO chair and intern chair */}
      <group position={[-1.2, 0, -1.5]}>
        <mesh castShadow>
          <boxGeometry args={[0.6, 0.1, 0.6]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.45, -0.28]} castShadow>
          <boxGeometry args={[0.6, 0.8, 0.08]} />
          <meshStandardMaterial color="#1e1e1e" roughness={0.8} />
        </mesh>
      </group>
      <group position={[1.2, 0, -1.5]}>
        <mesh castShadow>
          <boxGeometry args={[0.6, 0.1, 0.6]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.45, -0.28]} castShadow>
          <boxGeometry args={[0.6, 0.8, 0.08]} />
          <meshStandardMaterial color="#1e1e1e" roughness={0.8} />
        </mesh>
      </group>

      {/* Warm dim light inside */}
      <pointLight position={[0, 2.5, 0]} intensity={1.5} color="#ffe8cc" distance={10} />
    </group>
  );
};

// ── CODES & TESTS POOLS FOR AGENT TERMINALS ──
// FIX 4: KAEL terminal shows architecture/implementation code (what observer sees in deliverable)
const KAEL_CODE_POOL = [
  "// KAEL: Architecture Implementation",
  "class AuthService {",
  "  async generateToken(userId) {",
  "    return jwt.sign({ id: userId },",
  "      process.env.JWT_SECRET,",
  "      { expiresIn: '24h' }",
  "    );",
  "  }",
  "  async verifyToken(token) {",
  "    return jwt.verify(token,",
  "      process.env.JWT_SECRET",
  "    );",
  "  }",
  "}",
  "// Middleware: protect routes",
  "const authMiddleware = async (req, res, next) => {",
  "  const token = req.headers.authorization;",
  "  if (!token) return res.status(401).json({ error: 'Unauthorized' });",
  "  req.user = await authService.verifyToken(token);",
  "  next();",
  "};",
  "// DB schema locked. Writing migration.",
  "// API endpoints complete. Awaiting QA.",
];

const ZENO_TEST_POOL = [
  "✓ GET /api/health - 200 OK (12ms)",
  "✓ POST /api/goal - 201 Created (145ms)",
  "✓ Socket connection established (5ms)",
  "✓ MERN agent controller online (4ms)",
  "✓ Archivist light controller test passed",
  "✓ Audio oscillator feedback test passed",
  "✓ Zeno Desk component test passed",
  "✓ Kael Desk component test passed",
  "✓ Aria Cabin lighting test passed",
  "✓ Meeting positions override verification success",
  "✓ Database connection handshake - OK",
  "✓ Redundant process clean exit - code 0",
  "✓ Memory leak detector - No issues",
  "✓ Task completion latency simulation test passed"
];

// ── KAEL SECOND MONITOR (Graph Monitor) ──
const GraphMonitor = ({ position, rotation, isBlank }) => {
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow>
        <boxGeometry args={[0.8, 0.5, 0.05]} />
        <meshStandardMaterial color="#050505" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0, 0.026]}>
        <planeGeometry args={[0.75, 0.45]} />
        <meshStandardMaterial color={isBlank ? "#000000" : "#050505"} emissive={isBlank ? "#000000" : "#050508"} roughness={0.2} />
      </mesh>
      <mesh position={[0, -0.2, -0.1]}>
        <boxGeometry args={[0.1, 0.4, 0.1]} />
        <meshStandardMaterial color="#050505" />
      </mesh>
    </group>
  );
};

// ── 3. KAEL DESK ──
const KaelDesk = ({ agentTerminalContent, kaelTerminalLines, isBlank }) => {
  const [scrollLines, setScrollLines] = useState([
    'KAEL-DESK-TERM v0.42',
    '> SYSTEM: IDLE',
    '> AWAITING TASK ASSIGNMENT...'
  ]);
  const lineIndexRef = useRef(0);

  useEffect(() => {
    if (kaelTerminalLines && kaelTerminalLines.length > 0) {
      setScrollLines(['> RECEIVING ARCHITECTURE...', '> IMPLEMENTING CODE...']);
      lineIndexRef.current = 0;
      const interval = setInterval(() => {
        setScrollLines(prev => {
          if (lineIndexRef.current >= kaelTerminalLines.length) {
            clearInterval(interval);
            return prev;
          }
          const nextLine = kaelTerminalLines[lineIndexRef.current];
          lineIndexRef.current += 1;
          const newLines = [...prev, `> ${nextLine}`];
          return newLines.slice(-14);
        });
      }, 400);
      return () => clearInterval(interval);
    } else if (agentTerminalContent === 'active') {
      setScrollLines([
        '> GOAL RECEIVED',
        '> COMPILING AGENT INSTRUCTIONS...',
        '> STARTING BACKEND TASK RUNNER...'
      ]);
      lineIndexRef.current = 0;

      const interval = setInterval(() => {
        setScrollLines(prev => {
          const nextLine = KAEL_CODE_POOL[lineIndexRef.current % KAEL_CODE_POOL.length];
          lineIndexRef.current += 1;
          const newLines = [...prev, `> ${nextLine}`];
          return newLines.slice(-14);
        });
      }, 400);

      return () => clearInterval(interval);
    } else {
      setScrollLines([
        'KAEL-DESK-TERM v0.42',
        '> SYSTEM: IDLE',
        '> AWAITING TASK ASSIGNMENT...'
      ]);
    }
  }, [kaelTerminalLines, agentTerminalContent]);

  return (
    <group position={[AGENT_TERRITORIES.KAEL.home.x, 0, AGENT_TERRITORIES.KAEL.home.z]}>
      {/* Desk Surface */}
      <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
        <boxGeometry args={[3, 0.1, 1.5]} />
        <meshStandardMaterial color="#141e2e" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Left Normal Monitor */}
      <TerminalMonitor position={[-0.8, 1.05, -0.3]} rotation={[0, 0.3, 0]} emissiveColor="#ff4400" />

      {/* Right Terminal Monitor */}
      <TerminalMonitor position={[0.6, 1.05, -0.3]} rotation={[0, -0.3, 0]} emissiveColor="#ff4400" />

      {/* Keyboard shape */}
      <mesh position={[-0.1, 0.76, 0.2]} rotation={[0, -0.1, 0]} castShadow>
        <boxGeometry args={[0.4, 0.02, 0.15]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>

      {/* Mouse */}
      <mesh position={[0.25, 0.76, 0.22]} rotation={[0, -0.1, 0]} castShadow>
        <boxGeometry args={[0.06, 0.02, 0.09]} />
        <meshStandardMaterial color="#222222" roughness={0.8} />
      </mesh>

      {/* Small always-on terminal screen — FIX 4C: only visible when 'working'/active */}
      {agentTerminalContent === 'active' && (
      <group position={[0.2, 0.8, 0.2]} rotation={[-0.2, Math.PI / 4, 0]}>
        <mesh castShadow>
          <planeGeometry args={[1.5, 1.0]} />
          <meshStandardMaterial color="#111111" emissive="#002200" emissiveIntensity={0.8} toneMapped={false} />
        </mesh>
        <Html
          transform
          occlude
          distanceFactor={8}
          position={[0, 0, 0.01]}
          pointerEvents="none"
          renderOrder={2}
        >
          <div style={{
            width: '110px',
            background: '#000000',
            color: '#ffffff',
            fontFamily: 'monospace',
            fontSize: '7px',
            padding: '3px',
            border: 'none',
            lineHeight: '1.4',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            whiteSpace: 'nowrap',
            textShadow: '0 0 3px rgba(0, 255, 0, 0.8)',
            opacity: 0.9,
            pointerEvents: 'none',
          }}>
            {scrollLines.map((line, idx) => (
              <div key={idx} style={{
                width: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                textAlign: 'left',
              }}>
                {line}
              </div>
            ))}
          </div>
        </Html>
      </group>
      )}
    </group>
  );
};

// ── 4. ZENO DESK ──
const ZenoDesk = ({ agentTerminalContent, zenoTerminalLines, monitorDark }) => {
  const [scrollLines, setScrollLines] = useState([
    'ZENO-TEST-RUNNER v1.0.8',
    '> STATUS: READY',
    '> NO ACTIVE TEST RUNS'
  ]);
  const lineIndexRef = useRef(0);

  useEffect(() => {
    if (zenoTerminalLines && zenoTerminalLines.length > 0) {
      setScrollLines(['> GENERATING TEST SUITE...']);
      lineIndexRef.current = 0;
      const interval = setInterval(() => {
        setScrollLines(prev => {
          if (lineIndexRef.current >= zenoTerminalLines.length) {
            clearInterval(interval);
            return prev;
          }
          const nextLine = zenoTerminalLines[lineIndexRef.current];
          lineIndexRef.current += 1;
          const newLines = [...prev, nextLine];
          return newLines.slice(-14);
        });
      }, 400);
      return () => clearInterval(interval);
    } else if (agentTerminalContent === 'active') {
      setScrollLines([
        '> INITIALIZING TEST ENVIRONMENT...',
        '> RUNNING UNIT TESTS...'
      ]);
      lineIndexRef.current = 0;

      const interval = setInterval(() => {
        setScrollLines(prev => {
          const nextLine = ZENO_TEST_POOL[lineIndexRef.current % ZENO_TEST_POOL.length];
          lineIndexRef.current += 1;
          const newLines = [...prev, nextLine];
          return newLines.slice(-14);
        });
      }, 500);

      return () => clearInterval(interval);
    } else {
      setScrollLines([
        'ZENO-TEST-RUNNER v1.0.8',
        '> STATUS: READY',
        '> NO ACTIVE TEST RUNS'
      ]);
    }
  }, [zenoTerminalLines, agentTerminalContent]);

  return (
    <group position={[6, 0, -4]}>
      {/* Desk Surface */}
      <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 0.1, 1.5]} />
        <meshStandardMaterial color="#151f30" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* One monitor */}
      <group position={[0, 1.05, -0.3]}>
        <mesh castShadow>
          <boxGeometry args={[0.8, 0.5, 0.05]} />
          <meshStandardMaterial color="#050505" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0, 0.026]}>
          <planeGeometry args={[0.75, 0.45]} />
          <meshStandardMaterial color="#00f5ff" emissive={monitorDark ? "#000000" : "#0044ff"} emissiveIntensity={monitorDark ? 0 : 0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, -0.2, -0.1]}>
          <boxGeometry args={[0.1, 0.4, 0.1]} />
          <meshStandardMaterial color="#050505" />
        </mesh>

        {/* Small post-it shape on monitor edge */}
        <mesh position={[0.35, -0.2, 0.03]} rotation={[0, 0, 0.1]}>
          <planeGeometry args={[0.1, 0.1]} />
          <meshBasicMaterial color="#ffeb3b" />
        </mesh>
      </group>

      {/* Keyboard */}
      <mesh position={[0, 0.76, 0.3]} castShadow>
        <boxGeometry args={[0.4, 0.02, 0.15]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>

      {/* Mouse */}
      <mesh position={[0.3, 0.76, 0.3]} castShadow>
        <boxGeometry args={[0.06, 0.02, 0.09]} />
        <meshStandardMaterial color="#222222" roughness={0.8} />
      </mesh>

      {/* Small always-on terminal screen — FIX 4C: only visible when 'working'/active */}
      {agentTerminalContent === 'active' && (
      <group position={[-0.4, 0.8, 0.2]} rotation={[-0.2, Math.PI / 4, 0]}>
        <mesh castShadow>
          <planeGeometry args={[1.5, 1.0]} />
          <meshStandardMaterial color="#111111" emissive="#002200" emissiveIntensity={0.8} toneMapped={false} />
        </mesh>
        <Html
          transform
          occlude
          distanceFactor={8}
          position={[0, 0, 0.01]}
          pointerEvents="none"
          renderOrder={2}
        >
          <div style={{
            width: '110px',
            background: '#000000',
            color: '#ffffff',
            fontFamily: 'monospace',
            fontSize: '7px',
            padding: '3px',
            border: 'none',
            lineHeight: '1.4',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            whiteSpace: 'nowrap',
            textShadow: '0 0 3px rgba(0, 255, 0, 0.8)',
            opacity: 0.9,
            pointerEvents: 'none',
          }}>
            {scrollLines.map((line, idx) => (
              <div key={idx} style={{
                width: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                textAlign: 'left',
              }}>
                {line}
              </div>
            ))}
          </div>
        </Html>
      </group>
      )}
    </group>
  );
};

// ── COFFEE CUP ──
const CoffeeCup = ({ position }) => {
  const steamRef = useRef();

  useFrame(({ clock }) => {
    if (steamRef.current) {
      const time = clock.getElapsedTime() * 1.5;
      steamRef.current.position.y = 0.15 + (time % 0.3);
      steamRef.current.scale.setScalar(1 - (time % 0.3) / 0.3);
    }
  });

  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.15, 0.16, 0.01, 12]} />
        <meshStandardMaterial color="#eae5d8" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.06, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.08, 0.12, 12]} />
        <meshStandardMaterial color="#2c1e12" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.115, 0]}>
        <cylinderGeometry args={[0.085, 0.08, 0.01, 12]} />
        <meshStandardMaterial color="#1a0f08" roughness={0.1} />
      </mesh>
      <mesh ref={steamRef} position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.01, 0.02, 0.08, 8]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.2} transparent opacity={0.3} />
      </mesh>
    </group>
  );
};

// ── OBSERVER PC ──
const ObserverPC = ({ position, isFlickering, onClick }) => {
  const screenMatRef = useRef();
  
  useFrame(({ clock }) => {
    if (screenMatRef.current) {
      if (isFlickering) {
        const time = clock.getElapsedTime();
        const cycle = time % 1.5;
        let intensity = 0;
        if (cycle > 0.5 && cycle < 0.6) intensity = 0.3;
        if (cycle > 0.8 && cycle < 1.0) intensity = 0.5;
        screenMatRef.current.emissiveIntensity = intensity;
        screenMatRef.current.emissive.setHex(0xffffff);
      } else {
        screenMatRef.current.emissiveIntensity = 0;
      }
    }
  });

  return (
    <group position={position}>
      <mesh 
        onClick={(e) => { e.stopPropagation(); onClick && onClick(); }}
        onPointerOver={(e) => { if(onClick) { e.stopPropagation(); document.body.style.cursor = 'pointer'; } }}
        onPointerOut={(e) => { if(onClick) { document.body.style.cursor = 'auto'; } }}
        castShadow
      >
        <boxGeometry args={[0.9, 0.6, 0.05]} />
        <meshStandardMaterial color="#050505" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0, 0.026]}>
        <planeGeometry args={[0.85, 0.55]} />
        <meshStandardMaterial
          ref={screenMatRef}
          color="#111111"
          emissive="#000000"
          emissiveIntensity={0}
          roughness={0.2}
        />
      </mesh>
      <mesh position={[0, -0.2, -0.1]}>
        <boxGeometry args={[0.1, 0.4, 0.1]} />
        <meshStandardMaterial color="#050505" />
      </mesh>
    </group>
  );
};

// ── 5. OBSERVER DESK ── (Single PC, right-front corner area)
const ObserverDesk = ({ observerPCFlickering, onObserverPCClick, onPaperClick }) => {
  const [lampLifted, setLampLifted] = useState(false);

  const handleLampClick = (e) => {
    e.stopPropagation();
    setLampLifted(true);
  };

  const handlePaperClick = (e) => {
    e.stopPropagation();
    if (lampLifted) {
      onPaperClick && onPaperClick();
      fetch('/api/doorkeeper/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'paper_found', value: true })
      }).catch(() => {});
    }
  };

  const lampY = lampLifted ? 0.75 + 0.05 : 0.75;

  return (
    <group position={OBSERVER_DESK_POS} rotation={[0, Math.PI / 4, 0]}>
      {/* Single Observer PC — center of desk */}
      <ObserverPC position={[0, 1.0, -0.5]} isFlickering={observerPCFlickering} onClick={onObserverPCClick} />

      {/* Keyboard */}
      <mesh position={[-0.1, 0.76, 0.1]} castShadow>
        <boxGeometry args={[0.4, 0.02, 0.15]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>

      {/* Mouse */}
      <mesh position={[0.3, 0.76, 0.12]} castShadow>
        <boxGeometry args={[0.06, 0.02, 0.09]} />
        <meshStandardMaterial color="#222222" roughness={0.8} />
      </mesh>

      {/* Desk surface — warmer wood tone */}
      <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.5, 0.1, 1.8]} />
        <meshStandardMaterial color="#2a1e12" roughness={0.6} metalness={0.3} />
      </mesh>

      {/* Chair — pulled out slightly */}
      <group position={[0.1, 0.4, 1.3]} rotation={[0, 0.05, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.6, 0.1, 0.6]} />
          <meshStandardMaterial color="#c48b59" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.45, 0.28]} castShadow>
          <boxGeometry args={[0.6, 0.8, 0.08]} />
          <meshStandardMaterial color="#a0724a" roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.12, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.25, 0.15, 8]} />
          <meshStandardMaterial color="#222" metalness={0.6} />
        </mesh>
      </group>

      {/* Lamp — base and stem only, no cone (cone caused phantom triangle shape in scene) */}
      <group
        position={[-1.2, lampY, -0.5]}
        onClick={handleLampClick}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
        onPointerOut={(e) => { document.body.style.cursor = 'auto'; }}
      >
        <mesh castShadow>
          <cylinderGeometry args={[0.15, 0.2, 0.05, 16]} />
          <meshStandardMaterial color="#333" metalness={0.9} />
        </mesh>
        <mesh position={[0, 0.2, 0]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
          <meshStandardMaterial color="#555" metalness={0.9} />
        </mesh>
        {/* Lamp head — flat disc instead of cone to avoid triangle artifact */}
        <mesh position={[0, 0.4, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.12, 0.04, 16]} />
          <meshStandardMaterial color="#222" metalness={0.8} />
        </mesh>
        <pointLight position={[0, 0.3, 0.1]} intensity={1} distance={2} color="#ffcc66" />
      </group>

      {/* Paper under lamp — clickable */}
      <mesh
        position={[-1.0, 0.76, -0.2]}
        rotation={[-Math.PI / 2, 0, 0.2]}
        onClick={handlePaperClick}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
        onPointerOut={(e) => { document.body.style.cursor = 'auto'; }}
      >
        <planeGeometry args={[0.3, 0.4]} />
        <meshStandardMaterial color="#eaeaea" roughness={0.9} />
      </mesh>

      {/* Coffee Cup */}
      <CoffeeCup position={[0.8, 0.76, 0.3]} />
    </group>
  );
};

// ── LIVE CLOCK COMPONENT ──
const ClockComponent = () => {
  const [time, setTime] = useState(() => Date.now() + 47 * 60 * 1000);
  const isStoppedRef = useRef(false);

  useEffect(() => {
    window.__workroom_stopClock = () => {
      isStoppedRef.current = true;
      console.log('[Clock] Clock stopped.');
    };

    const interval = setInterval(() => {
      if (!isStoppedRef.current) {
        setTime(prev => {
          const next = prev + 1000;
          const prevSecs = Math.floor(prev / 1000) % 60;
          const nextSecs = Math.floor(next / 1000) % 60;
          if (nextSecs === 0 && prevSecs !== 0) {
            if (typeof window.__workroom_clockTick === 'function') {
              window.__workroom_clockTick();
            }
          }
          return next;
        });
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      delete window.__workroom_stopClock;
    };
  }, []);

  const date = new Date(time);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  const hourAngle = -(((hours % 12) + minutes / 60) / 12) * 2 * Math.PI;
  const minuteAngle = -((minutes + seconds / 60) / 60) * 2 * Math.PI;
  const secondAngle = -(seconds / 60) * 2 * Math.PI;

  return (
    <group position={CLOCK_POS} rotation={[0, 0, 0]}>
      {/* Clock Face */}
      <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.6, 0.6, 0.1, 32]} />
        <meshStandardMaterial color="#e0e0e0" roughness={0.4} />
      </mesh>
      
      {/* Hour Hand */}
      <group rotation={[0, 0, hourAngle]}>
        <mesh position={[0, 0.15, 0.055]} castShadow>
          <boxGeometry args={[0.04, 0.3, 0.02]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
      </group>

      {/* Minute Hand */}
      <group rotation={[0, 0, minuteAngle]}>
        <mesh position={[0, 0.225, 0.06]} castShadow>
          <boxGeometry args={[0.03, 0.45, 0.02]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
      </group>

      {/* Second Hand */}
      <group rotation={[0, 0, secondAngle]}>
        <mesh position={[0, 0.25, 0.065]}>
          <boxGeometry args={[0.015, 0.5, 0.02]} />
          <meshBasicMaterial color="#ff0044" />
        </mesh>
      </group>

      {/* Center cap */}
      <mesh position={[0, 0, 0.07]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.01, 12]} />
        <meshBasicMaterial color="#111111" />
      </mesh>
    </group>
  );
};

// ── 7. WALL DECORATIONS (Painting, Clock) ──
const WallDecorations = ({ architectOutcome }) => {
  const groupRef = useRef();

  useFrame(() => {
    if (groupRef.current) {
      const targetRot = architectOutcome === 'yes' ? 0 : 0.08;
      groupRef.current.rotation.z += (targetRot - groupRef.current.rotation.z) * 0.05;
    }
  });

  return (
    <group>
      {/* Painting - crooked rotation initially */}
      <group ref={groupRef} position={PAINTING_POS} rotation={[0, 0, 0.08]}>
        <mesh position={[0, 0, -0.02]} castShadow>
          <boxGeometry args={[0.88, 0.64, 0.04]} />
          <meshStandardMaterial color="#111" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[0.8, 0.56]} />
          <meshStandardMaterial color="#eae5d8" roughness={0.9} />
        </mesh>
        {/* Dark Figure Silhouette facing outward */}
        <mesh position={[0, -0.05, 0.015]}>
          <planeGeometry args={[0.3, 0.4]} />
          <meshStandardMaterial color="#08080c" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.15, 0.015]}>
          <circleGeometry args={[0.1, 16]} />
          <meshStandardMaterial color="#08080c" roughness={0.9} />
        </mesh>
        
        {architectOutcome === 'yes' && (
          <Html
            transform
            distanceFactor={8}
            position={[0, -0.4, 0.02]}
          >
            <div style={{
              background: '#eae5d8',
              color: '#1a1a1a',
              padding: '8px',
              fontFamily: 'monospace',
              fontSize: '6px',
              border: '1px solid #111',
              width: '120px',
              textAlign: 'center'
            }}>
              If you want to continue this conversation — leave your details.
            </div>
          </Html>
        )}
      </group>

      {/* Live Clock */}
      <ClockComponent />

      {/* Whiteboard */}
      <group position={[0, 2.5, -7.85]}>
        <mesh castShadow>
          <boxGeometry args={[3.0, 2.0, 0.05]} />
          <meshStandardMaterial color="#e8e8e8" roughness={0.3} />
        </mesh>
        {/* Written content lines */}
        <mesh position={[-0.8, 0.5, 0.026]}><boxGeometry args={[1.0, 0.02, 0.01]} /><meshBasicMaterial color="#444444" /></mesh>
        <mesh position={[-0.6, 0.3, 0.026]}><boxGeometry args={[1.4, 0.02, 0.01]} /><meshBasicMaterial color="#444444" /></mesh>
        <mesh position={[0.2, 0.1, 0.026]}><boxGeometry args={[0.8, 0.02, 0.01]} /><meshBasicMaterial color="#444444" /></mesh>
        <mesh position={[-0.4, -0.2, 0.026]}><boxGeometry args={[1.2, 0.02, 0.01]} /><meshBasicMaterial color="#444444" /></mesh>
        <mesh position={[0.5, -0.4, 0.026]}><boxGeometry args={[0.6, 0.02, 0.01]} /><meshBasicMaterial color="#444444" /></mesh>

        {/* Sticky Notes */}
        <mesh position={[1.0, 0.4, 0.026]} rotation={[0, 0, 0.1]}><boxGeometry args={[0.15, 0.15, 0.01]} /><meshStandardMaterial color="#f5e642" /></mesh>
        <mesh position={[1.2, 0.6, 0.026]} rotation={[0, 0, -0.05]}><boxGeometry args={[0.15, 0.15, 0.01]} /><meshStandardMaterial color="#42c5f5" /></mesh>
        <mesh position={[0.9, 0.7, 0.026]} rotation={[0, 0, 0.2]}><boxGeometry args={[0.15, 0.15, 0.01]} /><meshStandardMaterial color="#f59142" /></mesh>
        <mesh position={[1.3, 0.3, 0.026]} rotation={[0, 0, -0.15]}><boxGeometry args={[0.15, 0.15, 0.01]} /><meshStandardMaterial color="#f5e642" /></mesh>
        <mesh position={[1.1, -0.1, 0.026]} rotation={[0, 0, 0.08]}><boxGeometry args={[0.15, 0.15, 0.01]} /><meshStandardMaterial color="#42c5f5" /></mesh>
      </group>

      {/* Framed Print */}
      <group position={[-11.9, 2.2, -3]} rotation={[0, Math.PI / 2, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1.2, 1.6, 0.04]} />
          <meshStandardMaterial color="#111" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0, 0.021]}>
          <planeGeometry args={[1.0, 1.4]} />
          <meshStandardMaterial color="#eae5d8" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0, 0.022]}>
          <planeGeometry args={[0.6, 0.8]} />
          <meshStandardMaterial color="#08080c" roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
};

// FIX 6: Removed stacked boxes (clutter). Only OBSERVER FILES box kept.
const StorageCorner = () => {
  return (
    <group position={STORAGE_CORNER_POS}>
      {/* Only the OBSERVER FILES box remains */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#5c4a38" roughness={0.9} />
      </mesh>
    </group>
  );
};

const DeskGrid = ({ agentTerminalContent, kaelTerminalLines, zenoTerminalLines, ariaTerminalLines, ariaCabinLightOff, zenoMonitorDark, observerPCFlickering, onObserverPCClick, onPaperClick, architectOutcome, kaelMonitorBlank }) => {
  return (
    <group>
      <AriaCabin agentTerminalContent={agentTerminalContent} ariaTerminalLines={ariaTerminalLines} cabinLightOff={ariaCabinLightOff} />
      <MeetingRoom />
      <KaelDesk agentTerminalContent={agentTerminalContent} kaelTerminalLines={kaelTerminalLines} isBlank={kaelMonitorBlank} />
      <ZenoDesk agentTerminalContent={agentTerminalContent} zenoTerminalLines={zenoTerminalLines} monitorDark={zenoMonitorDark} />
      <ObserverDesk observerPCFlickering={observerPCFlickering} onObserverPCClick={onObserverPCClick} onPaperClick={onPaperClick} />
      <WallDecorations architectOutcome={architectOutcome} />
      
      {/* ── Bookshelf / Cabinet at [8, 0, -4] ── */}
      <mesh position={[8, 1.0, -4]} castShadow receiveShadow>
        <boxGeometry args={[1, 2, 0.5]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
      </mesh>

      {/* ── Meeting Room Header Frame — FIX 7: now has MEETING ROOM text ── */}
      <mesh position={[0, 3.2, -2.2]} castShadow>
        <boxGeometry args={[2.5, 0.4, 0.1]} />
        <meshStandardMaterial color="#1a2035" emissive="#cccccc" emissiveIntensity={0.4} />
      </mesh>
      <Html
        transform
        distanceFactor={10}
        position={[0, 3.2, -2.14]}
        style={{ pointerEvents: 'none' }}
      >
        <div style={{
          color: '#ffffff',
          fontFamily: 'monospace',
          fontSize: '7px',
          letterSpacing: '2px',
          fontWeight: 'bold',
          textShadow: '0 0 6px rgba(255,255,255,0.8)',
          whiteSpace: 'nowrap',
          userSelect: 'none',
        }}>
          MEETING ROOM
        </div>
      </Html>

      {/* ── Archivist Red Glow ── */}
      <group position={[-8, 1.5, 6]}>
        <pointLight intensity={4.0} color="#ff0044" distance={10} />
        <pointLight intensity={2.0} color="#ff2200" distance={10} />
      </group>
      {/* FIX 6: StorageCorner fully removed */}
    </group>
  );
};

export default DeskGrid;
