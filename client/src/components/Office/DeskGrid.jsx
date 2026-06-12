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
        onPointerOver={(e) => { if (onTerminalClick) { e.stopPropagation(); document.body.style.cursor = 'pointer'; } }}
        onPointerOut={(e) => { if (onTerminalClick) { document.body.style.cursor = 'auto'; } }}
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
      <group position={[1.85, 0, 2]} rotation={[0, 0.2, 0]}>
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
      {/* Glass walls on all four sides + door */}
      {/* Front Glass Wall */}
      <mesh position={[0, 1.5, 3]} receiveShadow>
        <boxGeometry args={[8, 3, 0.1]} />
        <meshStandardMaterial color="#3355aa" transparent opacity={0.4} roughness={0.4} metalness={0.9} />
      </mesh>

      {/* Back Glass Wall */}
      <mesh position={[0, 1.5, -3]} receiveShadow>
        <boxGeometry args={[8, 3, 0.1]} />
        <meshStandardMaterial color="#3355aa" transparent opacity={0.4} roughness={0.4} metalness={0.9} />
      </mesh>

      {/* Left Glass Wall */}
      <mesh position={[-4, 1.5, 0]} receiveShadow>
        <boxGeometry args={[0.1, 3, 6]} />
        <meshStandardMaterial color="#3355aa" transparent opacity={0.4} roughness={0.4} metalness={0.9} />
      </mesh>

      {/* Right Glass Wall (partial to leave room for door near clock Z=[-3, -1]) */}
      <mesh position={[4, 1.5, 1]} receiveShadow>
        <boxGeometry args={[0.1, 3, 4]} />
        <meshStandardMaterial color="#3355aa" transparent opacity={0.4} roughness={0.4} metalness={0.9} />
      </mesh>

      {/* Glass Door on Right Wall (half open outwards towards clock) */}
      <group position={[4, 0, -1]} rotation={[0, -Math.PI / 4, 0]}>
        <mesh position={[0, 1.5, -1]} receiveShadow>
          <boxGeometry args={[0.1, 3, 2]} />
          {/* same glass look as walls */}
          <meshStandardMaterial color="#3355aa" transparent opacity={0.4} roughness={0.4} metalness={0.9} />
        </mesh>
      </group>


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

      {/* Left Side Chair */}
      <group position={[-3, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.6, 0.1, 0.6]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.45, -0.28]} castShadow>
          <boxGeometry args={[0.6, 0.8, 0.08]} />
          <meshStandardMaterial color="#1e1e1e" roughness={0.8} />
        </mesh>
      </group>

      {/* Right Side Chair */}
      <group position={[3, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
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
  const graphRef = useRef();
  useFrame(({ clock }) => {
    if (graphRef.current && !isBlank) {
      const t = (clock.getElapsedTime() % 4) / 4; // 0 to 1 over 4 seconds
      graphRef.current.scale.y = 0.1 + t * 0.9;
      // Anchor bottom
      graphRef.current.position.y = -0.15 + (graphRef.current.scale.y * 0.3) / 2;
    }
  });

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
      {/* Animated Graph Bar */}
      {!isBlank && (
        <mesh ref={graphRef} position={[0, -0.15, 0.027]}>
          <planeGeometry args={[0.5, 0.3]} />
          <meshBasicMaterial color="#00ffcc" transparent opacity={0.6} />
        </mesh>
      )}
      <mesh position={[0, -0.2, -0.1]}>
        <boxGeometry args={[0.1, 0.4, 0.1]} />
        <meshStandardMaterial color="#050505" />
      </mesh>
    </group>
  );
};

// ── INTERN DESK ──
const InternDesk = () => {
  return (
    <group position={[-2.5, 0, 7]} scale={0.8}>
      {/* Desk surface */}
      <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 0.1, 1.5]} />
        <meshStandardMaterial color="#888888" roughness={0.6} />
      </mesh>
      {/* Chair fully in */}
      <group position={[0, 0.4, 0.4]}>
        <mesh castShadow>
          <boxGeometry args={[0.6, 0.1, 0.6]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
        <mesh position={[0, 0.45, 0.28]} castShadow>
          <boxGeometry args={[0.6, 0.8, 0.08]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
      </group>
      {/* Coffee cup tipped over */}
      <mesh position={[0.5, 0.76, 0.2]} rotation={[0, 0, 20 * Math.PI / 180]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.12, 16]} />
        <meshStandardMaterial color="#dddddd" />
      </mesh>
      {/* Notebook face down */}
      <mesh position={[-0.4, 0.76, -0.1]} castShadow>
        <boxGeometry args={[0.4, 0.03, 0.5]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
    </group>
  );
};

// ── 3. KAEL DESK ──
const KaelDesk = ({ agentTerminalContent, kaelTerminalLines, isBlank, onSpeakerClick }) => {
  const [scrollLines, setScrollLines] = useState([
    'KAEL-DESK-TERM v0.42',
    '> SYSTEM: IDLE',
    '> AWAITING TASK ASSIGNMENT...'
  ]);
  const [speakerHovered, setSpeakerHovered] = useState(false);
  const [speakerPressed, setSpeakerPressed] = useState(false);
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

      {/* Right Terminal Monitor (Replacing with GraphMonitor as requested) */}
      <GraphMonitor position={[0.6, 1.05, -0.3]} rotation={[0, -0.3, 0]} isBlank={isBlank} />

      {/* Speaker on right side - Interactive */}
      <group
        position={[1.2, 0.81 + (speakerPressed ? -0.01 : 0), -0.2]}
        scale={speakerHovered ? [1.05, 1.05, 1.05] : [1, 1, 1]}
      >
        <mesh
          castShadow
          onPointerDown={(e) => { e.stopPropagation(); setSpeakerPressed(true); }}
          onPointerUp={(e) => { e.stopPropagation(); setSpeakerPressed(false); }}
          onClick={(e) => { e.stopPropagation(); onSpeakerClick && onSpeakerClick(); }}
          onPointerEnter={(e) => {
            e.stopPropagation();
            document.body.style.cursor = 'pointer';
            setSpeakerHovered(true);
          }}
          onPointerLeave={(e) => {
            e.stopPropagation();
            document.body.style.cursor = 'auto';
            setSpeakerHovered(false);
            setSpeakerPressed(false);
          }}
        >
          <boxGeometry args={[0.18, 0.18, 0.18]} />
          <meshStandardMaterial
            color={speakerHovered ? "#2a2a2a" : "#1a1a1a"}
            roughness={0.8}
            emissive={speakerHovered ? "#0a1a0a" : "#000000"}
          />
        </mesh>
        {/* Play/Pause LED Button Indicator */}
        <mesh position={[0, 0.09, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.02, 16]} />
          <meshStandardMaterial
            color="#ff3333"
            emissive="#ff0000"
            emissiveIntensity={speakerHovered ? 2 : 0.5}
          />
        </mesh>
      </group>

      {/* CPU tower under desk */}
      <mesh position={[1.0, 0.35, 0.2]} castShadow receiveShadow>
        <boxGeometry args={[0.3, 0.7, 0.6]} />
        <meshStandardMaterial color="#111111" roughness={0.8} />
      </mesh>

      {/* Empty coffee mug */}
      <mesh position={[0.8, 0.76, 0.2]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.1, 16]} />
        <meshStandardMaterial color="#cccccc" roughness={0.5} />
      </mesh>

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

      {/* Stack of paper */}
      <group position={[-0.6, 0.76, 0.2]} rotation={[0, 0.1, 0]}>
        <mesh position={[0, 0, 0]} castShadow><boxGeometry args={[0.22, 0.005, 0.3]} /><meshStandardMaterial color="#f0f0f0" /></mesh>
        <mesh position={[0.01, 0.006, 0.01]} rotation={[0, -0.05, 0]} castShadow><boxGeometry args={[0.22, 0.005, 0.3]} /><meshStandardMaterial color="#f0f0f0" /></mesh>
        <mesh position={[-0.02, 0.012, 0.02]} rotation={[0, 0.03, 0]} castShadow><boxGeometry args={[0.22, 0.005, 0.3]} /><meshStandardMaterial color="#f0f0f0" /></mesh>
      </group>

      {/* Coffee Cup */}
      <mesh position={[0.6, 0.76, 0.1]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.1, 16]} />
        <meshStandardMaterial color="#eeeeee" />
      </mesh>

      {/* CPU tower under desk */}
      <mesh position={[0.8, 0.35, 0.3]} castShadow receiveShadow>
        <boxGeometry args={[0.3, 0.7, 0.6]} />
        <meshStandardMaterial color="#111111" roughness={0.8} />
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
        onPointerOver={(e) => { if (onClick) { e.stopPropagation(); document.body.style.cursor = 'pointer'; } }}
        onPointerOut={(e) => { if (onClick) { document.body.style.cursor = 'auto'; } }}
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
  const [drawerOpen, setDrawerOpen] = useState(false);

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
      }).catch(() => { });
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

      {/* CPU tower under desk */}
      <mesh position={[1.2, 0.35, 0.4]} castShadow receiveShadow>
        <boxGeometry args={[0.3, 0.7, 0.6]} />
        <meshStandardMaterial color="#111111" roughness={0.8} />
      </mesh>

      {/* Hidden Drawer Handle - Made larger and prominent on front edge */}
      <mesh
        position={[0, 0.62, 0.94]}
        onClick={(e) => { e.stopPropagation(); setDrawerOpen(true); }}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
        onPointerOut={(e) => { document.body.style.cursor = 'auto'; }}
        castShadow
      >
        <boxGeometry args={[0.8, 0.06, 0.08]} />
        <meshStandardMaterial color="#d4af37" roughness={0.4} metalness={0.8} />
      </mesh>

      {/* Notebook */}
      <mesh position={[1.0, 0.76, 0.2]} rotation={[0, 0.2, 0]} castShadow>
        <boxGeometry args={[0.2, 0.01, 0.15]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>

      {/* Pen */}
      <mesh position={[1.0, 0.76, 0.3]} rotation={[0, -0.4, 0]} castShadow>
        <cylinderGeometry args={[0.005, 0.005, 0.12, 8]} />
        <meshStandardMaterial color="#dddddd" />
      </mesh>

      {/* Folder */}
      <group position={[1.3, 0.76, 0.0]} rotation={[-Math.PI / 2, 0, 0.2]}>
        <mesh castShadow>
          <planeGeometry args={[0.25, 0.35]} />
          <meshStandardMaterial color="#d4b483" side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[-0.125, 0, 0.01]} rotation={[0, 10 * Math.PI / 180, 0]} castShadow>
          <planeGeometry args={[0.25, 0.35]} />
          <meshStandardMaterial color="#d4b483" side={THREE.DoubleSide} />
        </mesh>
      </group>

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

      {/* Modal Overlay for Drawer */}
      {drawerOpen && (
        <Html center position={[0, 2, 0]} zIndexRange={[100, 0]}>
          <div style={{
            position: 'fixed',
            inset: 0,
            width: '100vw',
            height: '100vh',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(0,0,0,0.85)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }} onClick={(e) => { e.stopPropagation(); setDrawerOpen(false); }}>
            <div style={{
              backgroundColor: '#eae5d8',
              color: '#1a1a1a',
              padding: '40px',
              maxWidth: '500px',
              fontFamily: 'monospace',
              fontSize: '16px',
              lineHeight: '1.6',
              boxShadow: '0 0 40px rgba(0,0,0,0.6)',
              transform: 'rotate(-2deg)',
              whiteSpace: 'pre-wrap'
            }} onClick={(e) => e.stopPropagation()}>
              WELCOME OBSERVER
            </div>
          </div>
        </Html>
      )}
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

// ── 7. WALL DECORATIONS (Clock) ──
const WallDecorations = ({ architectOutcome }) => {
  return (
    <group>
      {/* Painting removed per user request */}

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

      {/* Framed print removed per user request */}
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

// ── EVOLUTION WALL ──
const evolutionImages = Array.from({ length: 50 }).map((_, i) => {
  let isCenter = false;
  let label = null;
  // A palette of diverse colors for the "images"
  const colors = ['#1a1f2e', '#4f4f4f', '#0055aa', '#e0e0e0', '#2a1a1a', '#446688', '#222222', '#111111', '#888888', '#aa3333'];
  let color = colors[i % colors.length]; // Deterministic so it doesn't flicker

  if (i === 24) { label = "?"; color = '#000000'; isCenter = true; }
  else if (i === 23) { label = "AIZEN"; color = '#1a1a2e'; isCenter = true; }
  else if (i === 25) { label = "AOT"; color = '#4a2a2a'; isCenter = true; }

  return {
    id: i,
    color,
    label,
    isCenter,
    col: i % 10,
    row: Math.floor(i / 10)
  };
});

const EvolutionWall = () => {
  const imageWidth = 1.0;
  const imageHeight = imageWidth * (9 / 16); // 0.5625

  return (
    <group position={[-11.9, 1.5, -0.8]} rotation={[0, Math.PI / 2, 0]} scale={0.8}>
      {/* Main Board Background Frame */}
      <group position={[0, 0.8, 0]}>
        {/* Frame border */}
        <mesh position={[0, 0, -0.01]}>
          <boxGeometry args={[13.2, 4.2, 0.05]} />
          <meshStandardMaterial color="#111111" />
        </mesh>
        {/* Board inner surface */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[13, 4.0, 0.04]} />
          <meshStandardMaterial color="#2a2a30" roughness={0.9} />
        </mesh>
      </group>

      {/* Grid of 50 Images */}
      {evolutionImages.map((img) => {
        const x = -5.4 + img.col * 1.2;
        const y = 2.4 - img.row * 0.7; // Centers around 1.0

        return (
          <group key={img.id} position={[x, y, 0.021]}>
            {/* Outer border / frame of the image */}
            <mesh castShadow>
              <boxGeometry args={[imageWidth + 0.04, imageHeight + 0.04, 0.02]} />
              <meshStandardMaterial color={img.isCenter ? '#ffffff' : '#e0e0e0'} />
            </mesh>

            {/* Inner "Image" plane */}
            <mesh position={[0, 0, 0.011]}>
              <planeGeometry args={[imageWidth, imageHeight]} />
              <meshStandardMaterial color={img.color} roughness={0.4} />
            </mesh>

            {/* Optional label placeholder since we don't have texture files yet */}
            {img.label && (
              <Html transform distanceFactor={8} position={[0, 0, 0.015]} style={{ pointerEvents: 'none' }}>
                <div style={{
                  color: '#ffffff',
                  fontFamily: 'monospace',
                  fontSize: img.label === '?' ? '32px' : '12px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  textShadow: '0 0 4px rgba(0,0,0,0.8)',
                  backfaceVisibility: 'hidden'
                }}>
                  {img.label}
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
};

const DeskGrid = ({ agentTerminalContent, kaelTerminalLines, zenoTerminalLines, ariaTerminalLines, ariaCabinLightOff, zenoMonitorDark, observerPCFlickering, onObserverPCClick, onPaperClick, architectOutcome, kaelMonitorBlank, onSpeakerClick }) => {
  return (
    <group>
      <InternDesk />
      <AriaCabin agentTerminalContent={agentTerminalContent} ariaTerminalLines={ariaTerminalLines} cabinLightOff={ariaCabinLightOff} />
      <MeetingRoom />
      <KaelDesk agentTerminalContent={agentTerminalContent} kaelTerminalLines={kaelTerminalLines} isBlank={kaelMonitorBlank} onSpeakerClick={onSpeakerClick} />
      <ZenoDesk agentTerminalContent={agentTerminalContent} zenoTerminalLines={zenoTerminalLines} monitorDark={zenoMonitorDark} />
      <ObserverDesk observerPCFlickering={observerPCFlickering} onObserverPCClick={onObserverPCClick} onPaperClick={onPaperClick} />
      <WallDecorations architectOutcome={architectOutcome} />
      <EvolutionWall />

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

      {/* Server Room */}
      <group position={[-5, 1.5, 6]}>
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[2, 3, 3]} />
          <meshStandardMaterial color="#000000" transparent opacity={0.6} roughness={0.1} />
        </mesh>
        <pointLight intensity={2.0} color="#ff0044" distance={5} />
        {/* Server Racks inside */}
        <mesh position={[-0.4, -0.5, 0.5]} castShadow>
          <boxGeometry args={[0.6, 2.0, 0.8]} />
          <meshStandardMaterial color="#111" />
        </mesh>
        <mesh position={[0.4, -0.5, -0.5]} castShadow>
          <boxGeometry args={[0.6, 2.0, 0.8]} />
          <meshStandardMaterial color="#111" />
        </mesh>
        {/* Emissive dots */}
        <mesh position={[-0.4, 0.2, 0.9]}>
          <boxGeometry args={[0.05, 0.05, 0.05]} />
          <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={2} />
        </mesh>
      </group>

      {/* Washroom Area */}
      <group position={[-11.9, 0, 6]} rotation={[0, Math.PI / 2, 0]}>
        {/* Door */}
        <mesh position={[0, 1.2, 0.01]}>
          <boxGeometry args={[1.2, 2.4, 0.02]} />
          <meshStandardMaterial color="#1f2229" roughness={0.8} />
        </mesh>
        <Html transform distanceFactor={10} position={[0, 2.0, 0.03]} style={{ pointerEvents: 'none' }}>
          <div style={{ color: '#ffffff', opacity: 0.2, fontFamily: 'monospace', fontSize: '6px', backfaceVisibility: 'hidden' }}>WASHROOM</div>
        </Html>
        {/* Coat Rack */}
        <group position={[1.2, 0, 0.2]}>
          <mesh position={[0, 1.0, 0]} castShadow><cylinderGeometry args={[0.02, 0.04, 2.0, 8]} /><meshStandardMaterial color="#222" /></mesh>
          <mesh position={[0, 0.05, 0]} castShadow><cylinderGeometry args={[0.2, 0.2, 0.1, 16]} /><meshStandardMaterial color="#222" /></mesh>
          <mesh position={[0, 1.8, 0]} rotation={[0, 0.5, 0]} castShadow><cylinderGeometry args={[0.01, 0.01, 0.3, 8]} rotation={[0, 0, Math.PI / 2]} /><meshStandardMaterial color="#222" /></mesh>
          {/* Man's Overcoat on Hanger */}
          <group position={[0, 1.8, 0.1]} rotation={[0, 0.5, 0]}>
            {/* Long Coat Body */}
            <mesh position={[0.1, -0.5, 0]} castShadow><boxGeometry args={[0.3, 1.0, 0.08]} /><meshStandardMaterial color="#2a2e33" roughness={0.9} /></mesh>
            {/* Left Arm */}
            <mesh position={[-0.08, -0.3, 0]} rotation={[0, 0, 0.2]} castShadow><boxGeometry args={[0.1, 0.6, 0.06]} /><meshStandardMaterial color="#2a2e33" roughness={0.9} /></mesh>
            {/* Right Arm */}
            <mesh position={[0.28, -0.3, 0]} rotation={[0, 0, -0.2]} castShadow><boxGeometry args={[0.1, 0.6, 0.06]} /><meshStandardMaterial color="#2a2e33" roughness={0.9} /></mesh>
            {/* Coat Collar */}
            <mesh position={[0.1, -0.05, 0.02]} rotation={[0.2, 0, 0]} castShadow><boxGeometry args={[0.2, 0.1, 0.1]} /><meshStandardMaterial color="#22252a" roughness={0.9} /></mesh>
          </group>
        </group>
      </group>

      {/* Top Left Long Table & Printer (Moved near evolution wall/aria cabin) */}
      <group position={[-10.5, 0, -7.25]}>
        {/* Table */}
        <mesh position={[0, 0.7, 0]} castShadow>
          <boxGeometry args={[3, 0.1, 1.5]} />
          <meshStandardMaterial color="#222" roughness={0.8} />
        </mesh>
        <mesh position={[-1.3, 0.35, 0]} castShadow><boxGeometry args={[0.1, 0.7, 1.3]} /><meshStandardMaterial color="#111" /></mesh>
        <mesh position={[1.3, 0.35, 0]} castShadow><boxGeometry args={[0.1, 0.7, 1.3]} /><meshStandardMaterial color="#111" /></mesh>

        {/* Printer */}
        <group position={[0, 0.85, 0]} rotation={[0, -0.2, 0]}>
          <mesh castShadow><boxGeometry args={[0.8, 0.3, 0.6]} /><meshStandardMaterial color="#3e2723" roughness={0.2} /></mesh>
          <mesh position={[0, -0.05, 0.35]} rotation={[0.2, 0, 0]}><boxGeometry args={[0.6, 0.05, 0.3]} /><meshStandardMaterial color="#333" /></mesh>
          <mesh position={[0, 0.0, 0.35]} rotation={[0.2, 0, 0]}><boxGeometry args={[0.5, 0.01, 0.25]} /><meshStandardMaterial color="#fff" /></mesh>
        </group>

        {/* Bundles of papers & files (Increased Size) */}
        <mesh position={[-0.9, 0.825, -0.2]} rotation={[0, 0.1, 0]} castShadow>
          <boxGeometry args={[0.3, 0.25, 0.4]} />
          <meshStandardMaterial color="#fdfdfd" />
        </mesh>
        <mesh position={[-1.2, 0.78, 0.1]} rotation={[0, -0.2, 0]} castShadow>
          <boxGeometry args={[0.35, 0.06, 0.45]} />
          <meshStandardMaterial color="#4455aa" />
        </mesh>
        <mesh position={[-1.2, 0.82, 0.1]} rotation={[0, -0.15, 0]} castShadow>
          <boxGeometry args={[0.35, 0.04, 0.45]} />
          <meshStandardMaterial color="#cc4444" />
        </mesh>

        {/* Paperweight & spread papers (Increased Size) */}
        <mesh position={[1.0, 0.76, 0.2]} rotation={[-Math.PI / 2, 0, 0.3]} castShadow>
          <planeGeometry args={[0.3, 0.4]} />
          <meshStandardMaterial color="#ffffff" side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[1.1, 0.762, 0.1]} rotation={[-Math.PI / 2, 0, -0.1]} castShadow>
          <planeGeometry args={[0.3, 0.4]} />
          <meshStandardMaterial color="#ffffff" side={THREE.DoubleSide} />
        </mesh>
        {/* Paperweight */}
        <mesh position={[1.05, 0.79, 0.15]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.06, 16]} />
          <meshStandardMaterial color="#88ccff" transparent opacity={0.6} roughness={0.1} />
        </mesh>

        {/* Wall Glass Shelf over Printer */}
        {/* Adjusted Z from -0.65 to -0.45 so its back edge (-0.3) is exactly at local Z=-0.75 (World Z=-8.0) */}
        <group position={[0, 2.0, -0.45]}>
          {/* Glass Board */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[2.5, 0.05, 0.6]} />
            <meshStandardMaterial color="#88aadd" transparent opacity={0.3} metalness={0.8} roughness={0.1} />
          </mesh>
          {/* Shelf Brackets */}
          <mesh position={[-1.0, -0.1, -0.2]}><boxGeometry args={[0.05, 0.2, 0.2]} /><meshStandardMaterial color="#444" /></mesh>
          <mesh position={[1.0, -0.1, -0.2]}><boxGeometry args={[0.05, 0.2, 0.2]} /><meshStandardMaterial color="#444" /></mesh>

          {/* Files on Shelf */}
          <mesh position={[-0.8, 0.15, 0]} rotation={[0, 0.2, 0]} castShadow><boxGeometry args={[0.5, 0.25, 0.3]} /><meshStandardMaterial color="#ccaa88" /></mesh>
          <mesh position={[0, 0.2, -0.1]} rotation={[0, -0.1, 0]} castShadow><boxGeometry args={[0.1, 0.35, 0.3]} /><meshStandardMaterial color="#225588" /></mesh>
          <mesh position={[0.15, 0.2, -0.1]} rotation={[0, -0.05, 0]} castShadow><boxGeometry args={[0.1, 0.35, 0.3]} /><meshStandardMaterial color="#228855" /></mesh>
          <mesh position={[0.8, 0.04, 0.1]} rotation={[0, 0.5, 0]} castShadow><boxGeometry args={[0.4, 0.02, 0.3]} /><meshStandardMaterial color="#fff" /></mesh>

          {/* Unique "Just Used" Interactive File */}
          <mesh
            position={[0.45, 0.2, 0.15]}
            rotation={[0, 0.4, 0.05]}
            castShadow
            onClick={(e) => { e.stopPropagation(); onPaperClick && onPaperClick(); }}
            onPointerEnter={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
            onPointerLeave={(e) => { e.stopPropagation(); document.body.style.cursor = 'auto'; }}
          >
            <boxGeometry args={[0.1, 0.35, 0.3]} />
            <meshStandardMaterial color="#ffbb22" emissive="#ff6600" emissiveIntensity={0.6} roughness={0.2} />
          </mesh>
        </group>
      </group>

      {/* Fire Extinguisher (Moved near Server Room at front wall) */}
      <mesh position={[-3.5, 1.5, 7.8]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.4, 16]} />
        <meshStandardMaterial color="#cc0000" />
      </mesh>

      {/* Vending Machine (Back Right near Clock) */}
      <group position={[9, 1.5, -7.5]}>
        {/* Main Body Shell (Hollow so inside is visible) */}
        {/* Back */}
        <mesh position={[0, 0, -0.35]} castShadow receiveShadow><boxGeometry args={[1.5, 3, 0.1]} /><meshStandardMaterial color="#222222" metalness={0.8} roughness={0.2} /></mesh>
        {/* Left */}
        <mesh position={[-0.7, 0, 0]} castShadow receiveShadow><boxGeometry args={[0.1, 3, 0.8]} /><meshStandardMaterial color="#222222" metalness={0.8} roughness={0.2} /></mesh>
        {/* Right */}
        <mesh position={[0.7, 0, 0]} castShadow receiveShadow><boxGeometry args={[0.1, 3, 0.8]} /><meshStandardMaterial color="#222222" metalness={0.8} roughness={0.2} /></mesh>
        {/* Top */}
        <mesh position={[0, 1.45, 0]} castShadow receiveShadow><boxGeometry args={[1.5, 0.1, 0.8]} /><meshStandardMaterial color="#222222" metalness={0.8} roughness={0.2} /></mesh>
        {/* Bottom */}
        <mesh position={[0, -1.45, 0]} castShadow receiveShadow><boxGeometry args={[1.5, 0.1, 0.8]} /><meshStandardMaterial color="#222222" metalness={0.8} roughness={0.2} /></mesh>
        {/* Glass Front */}
        <mesh position={[0, 0.2, 0.41]} castShadow>
          <boxGeometry args={[1.3, 2.2, 0.05]} />
          <meshStandardMaterial color="#88ccff" transparent opacity={0.1} metalness={0.9} roughness={0.05} />
        </mesh>
        {/* Inner shelves & Items */}
        <group position={[0, 0.2, 0.2]}>
          {[0.8, 0.2, -0.4, -1.0].map((y, i) => (
            <mesh key={`vend-shelf-${i}`} position={[0, y, 0]} castShadow>
              <boxGeometry args={[1.2, 0.05, 0.3]} />
              <meshStandardMaterial color="#111111" />
            </mesh>
          ))}
          {/* Snacks and Drinks (Almost Full) */}
          {[0.8, 0.2, -0.4, -1.0].map((y, rowIdx) => (
            <group key={`vend-row-${rowIdx}`} position={[0, y, 0]}>
              {[-0.4, -0.15, 0.1, 0.35].map((x, colIdx) => {
                const isDrink = rowIdx > 1; // Bottom 2 rows are drinks
                const color = ["#ff3333", "#33ff33", "#3333ff", "#ff9900", "#aa33aa"][(rowIdx * 4 + colIdx) % 5];
                return isDrink ? (
                  <mesh key={`item-${colIdx}`} position={[x, 0.15, 0]} castShadow>
                    <cylinderGeometry args={[0.07, 0.07, 0.25, 12]} />
                    <meshStandardMaterial color={color} metalness={0.5} roughness={0.2} />
                  </mesh>
                ) : (
                  <mesh key={`item-${colIdx}`} position={[x, 0.18, 0]} castShadow>
                    <boxGeometry args={[0.15, 0.25, 0.15]} />
                    <meshStandardMaterial color={color} />
                  </mesh>
                );
              })}
            </group>
          ))}
        </group>
        {/* Coin slot panel */}
        <mesh position={[0.6, 0, 0.42]}>
          <boxGeometry args={[0.15, 0.5, 0.05]} />
          <meshStandardMaterial color="#111111" />
        </mesh>
        {/* Light glow inside so items pop */}
        <pointLight position={[0, 0.5, 0.3]} intensity={3.5} color="#ffffff" distance={4} />
      </group>

      {/* Water Cooler (Top Right Wall) */}
      <group position={[11.2, 1.0, -5]}>
        {/* Base */}
        <mesh castShadow receiveShadow position={[0, -0.5, 0]}>
          <boxGeometry args={[0.5, 1.0, 0.5]} />
          <meshStandardMaterial color="#f0f0f0" roughness={0.5} />
        </mesh>
        {/* Water Jug */}
        <mesh position={[0, 0.3, 0]} castShadow>
          <cylinderGeometry args={[0.22, 0.22, 0.6, 16]} />
          <meshStandardMaterial color="#44aaff" transparent opacity={0.6} roughness={0.1} />
        </mesh>
        {/* Spigots */}
        <mesh position={[-0.1, 0, 0.26]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.02, 0.02, 0.08]} /><meshStandardMaterial color="#ff3333" /></mesh>
        <mesh position={[0.1, 0, 0.26]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.02, 0.02, 0.08]} /><meshStandardMaterial color="#3333ff" /></mesh>
      </group>

      {/* 2 Racks with files near right side wall */}
      {[-2, 0].map((zPos, rackIdx) => (
        <group key={`rack-${rackIdx}`} position={[11.6, 1.5, zPos]}>
          {/* Main frame (Open Posts instead of solid block) */}
          <mesh position={[-0.35, 0, -0.55]} castShadow receiveShadow><boxGeometry args={[0.05, 3.0, 0.05]} /><meshStandardMaterial color="#444" /></mesh>
          <mesh position={[0.35, 0, -0.55]} castShadow receiveShadow><boxGeometry args={[0.05, 3.0, 0.05]} /><meshStandardMaterial color="#444" /></mesh>
          <mesh position={[-0.35, 0, 0.55]} castShadow receiveShadow><boxGeometry args={[0.05, 3.0, 0.05]} /><meshStandardMaterial color="#444" /></mesh>
          <mesh position={[0.35, 0, 0.55]} castShadow receiveShadow><boxGeometry args={[0.05, 3.0, 0.05]} /><meshStandardMaterial color="#444" /></mesh>
          {/* Shelves */}
          {[-1.2, -0.4, 0.4, 1.2].map((y, i) => (
            <group key={`shelf-${rackIdx}-${i}`} position={[0, y, 0]}>
              <mesh castShadow receiveShadow>
                <boxGeometry args={[0.78, 0.05, 1.18]} />
                <meshStandardMaterial color="#666666" />
              </mesh>
              {/* Variety of papers/files/hardware on each shelf */}
              {i % 2 === 0 ? (
                <>
                  <mesh position={[0, 0.15, -0.2]} rotation={[0, 0.1 + i * 0.2, 0]} castShadow>
                    <boxGeometry args={[0.6, 0.25, 0.4]} />
                    <meshStandardMaterial color="#ccaa88" />
                  </mesh>
                  {/* Small stack of registers */}
                  <mesh position={[0.1, 0.1, 0.3]} rotation={[0, -0.2, 0]} castShadow>
                    <boxGeometry args={[0.4, 0.15, 0.3]} />
                    <meshStandardMaterial color="#aa4444" />
                  </mesh>
                  {/* Computer Hardware (e.g. switch or mini PC) */}
                  <mesh position={[-0.2, 0.1, 0.2]} castShadow>
                    <boxGeometry args={[0.2, 0.15, 0.4]} />
                    <meshStandardMaterial color="#222" metalness={0.9} roughness={0.3} />
                  </mesh>
                </>
              ) : (
                <>
                  {/* Row of standing files/binders */}
                  {[0, 1, 2, 3].map(fileIdx => (
                    <mesh key={`file-${fileIdx}`} position={[-0.2 + fileIdx * 0.12, 0.2, -0.3]} castShadow>
                      <boxGeometry args={[0.1, 0.35, 0.4]} />
                      <meshStandardMaterial color={fileIdx % 2 === 0 ? "#225588" : "#228855"} />
                    </mesh>
                  ))}
                  {/* Loose papers */}
                  <mesh position={[0.1, 0.05, 0.3]} rotation={[0, 0.3, 0]} castShadow>
                    <boxGeometry args={[0.4, 0.02, 0.3]} />
                    <meshStandardMaterial color="#ffffff" />
                  </mesh>
                  {/* Another hardware piece (Server unit) */}
                  <mesh position={[0, 0.1, 0]} castShadow>
                    <boxGeometry args={[0.7, 0.15, 0.5]} />
                    <meshStandardMaterial color="#111" metalness={0.8} />
                  </mesh>
                </>
              )}
            </group>
          ))}
        </group>
      ))}

      {/* Fire Exit Sign (Enlarged and lowered by ~30%) */}
      <group position={[11.9, 2.7, 4]}>
        <Html transform distanceFactor={5} position={[-0.03, 0, 0]} rotation={[0, -Math.PI / 2, 0]} style={{ pointerEvents: 'none' }}>
          <div style={{ color: '#00ff00', fontSize: '18px', fontFamily: 'sans-serif', fontWeight: 'bold', textShadow: '0 0 5px #00ff00', backfaceVisibility: 'hidden' }}>EXIT ➔</div>
        </Html>
      </group>

      {/* FIX 6: StorageCorner fully removed */}
    </group>
  );
};

export default DeskGrid;
