import React, { useState, useEffect } from 'react';
import OfficeCanvas from './components/Office/OfficeCanvas';
import AgentPanel from './components/Agents/AgentPanel';
import Header from './components/UI/Header';
import GoalInput from './components/UI/GoalInput';
import FourthWall from './components/UI/FourthWall';
import ArchitectTerminal from './components/UI/ArchitectTerminal';
import TheObserver from './components/Hidden/TheObserver';
import ChapterTwo from './components/Chapters/ChapterTwo';
import { useSocket } from './hooks/useSocket';
import GateScene from './components/UI/GateScene';
import { useSoundEngine } from './hooks/useSoundEngine';
import DeliverableScreen from './components/UI/DeliverableScreen';
import Day47Modal from './components/UI/Day47Modal';

function App() {
  const { agents, logs, isFourthWallTriggered, isMeetingActive, isConnected, thirdWallAgent, cycle, meetingStartedAt, ariaTaskAssignedAt, fourthWallAt, philosophicalAt, philosophicalText, terminalContent, socketAriaCabinLightOff, shadowTerminalAccess } = useSocket();
  const [hash, setHash] = useState(window.location.hash);
  const [gatePassed, setGatePassed] = useState(false);
  const [showGoalInput, setShowGoalInput] = useState(false);
  const [showArchitect, setShowArchitect] = useState(false);

  // ── Track the Architect outcome to control office brightness ──
  // 'none' = default, 'yes' = brightened, 'no' = normal dark
  const [architectOutcome, setArchitectOutcome] = useState('none');
  
  // Phase 8 states
  const [observerPCFlickering, setObserverPCFlickering] = useState(false);
  const [showDeliverable, setShowDeliverable] = useState(false);
  const [deliverableFinished, setDeliverableFinished] = useState(false);
  const [showDay47Modal, setShowDay47Modal] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);

  const soundEngine = useSoundEngine();

  // Trigger foundation sounds when the gate is passed
  useEffect(() => {
    if (gatePassed) {
      soundEngine.startFoundationSounds();
    }
  }, [gatePassed, soundEngine]);

  // Handle fourth wall silence sequence / stop sounds when triggered
  useEffect(() => {
    // Silence happens ONLY after deliverable finishes (Phase 8 logic)
    if (isFourthWallTriggered && deliverableFinished) {
      soundEngine.stopAllSounds();
    }
  }, [isFourthWallTriggered, deliverableFinished, soundEngine]);
  
  useEffect(() => {
    if (isFourthWallTriggered && !showDeliverable && !deliverableFinished) {
      setObserverPCFlickering(true);
    }
  }, [isFourthWallTriggered, showDeliverable, deliverableFinished]);

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Hidden Observer Hint: Alternate document title every 45s
  useEffect(() => {
    let isWorkroom = true;
    document.title = 'WORKROOM';
    
    const interval = setInterval(() => {
      isWorkroom = !isWorkroom;
      document.title = isWorkroom ? 'WORKROOM' : '██████';
    }, 45000);
    
    return () => {
      clearInterval(interval);
      document.title = 'WORKROOM';
    };
  }, []);

  useEffect(() => {
  if (isMeetingActive === false && isMeetingActive !== null && gatePassed && !showGoalInput) {
    setTimeout(() => setShowGoalInput(true), 3000);
  }
}, [isMeetingActive, gatePassed]);

  // ── Architect summon callback — fired by FourthWall.jsx ──
  const handleArchitectSummon = () => {
    console.log('[App] Architect summoned. Transitioning to ArchitectTerminal.');
    setShowArchitect(true);
  };

  // ── Architect close callback — fired by ArchitectTerminal.jsx ──
  const handleArchitectClose = (outcome) => {
    console.log('[App] Architect sequence complete. Outcome:', outcome);
    setShowArchitect(false);
    setArchitectOutcome(outcome || 'no');
  };

  const handleObserverPCClick = () => {
    if (observerPCFlickering) {
      setObserverPCFlickering(false);
      setShowDeliverable(true);
      // Optional: Play CRT sound here if added to SOUNDS.js later
    }
  };

  const handleDeliverableClose = () => {
    setShowDeliverable(false);
    setDeliverableFinished(true);
    // As per Phase 8G, terminal opens ONLY from Observer PC click -> after deliverable auto-closes
    // Wait, FourthWall silence starts AFTER deliverable. TheTerminal opens when?
    // Let's set showTerminal to true so OfficeCanvas can show it.
    setShowTerminal(true);
  };

  // If visitor navigated to Chapter 2 gate
  if (hash === '#chapter2') {
    return (
      <>
        <ChapterTwo />
        {/* Ensure silent Doorkeeper tracking continues */}
        <TheObserver />
      </>
    );
  }

  if (!gatePassed && hash !== '#chapter2') {
    return <GateScene onComplete={() => {
      console.log('[GateScene] onComplete fired. Switching to main office canvas.');
      setGatePassed(true);
    }} />;
  }

  return (
    <div className="app-container" style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <Header isConnected={isConnected} cycle={cycle} />

      {/* 3D office — fills the entire viewport */}
      <OfficeCanvas
        agents={agents}
        logs={logs}
        thirdWallAgent={thirdWallAgent}
        isMeetingActive={isMeetingActive}
        meetingStartedAt={meetingStartedAt}
        ariaTaskAssignedAt={ariaTaskAssignedAt}
        fourthWallAt={fourthWallAt}
        philosophicalAt={philosophicalAt}
        philosophicalText={philosophicalText}
        terminalContent={terminalContent}
        soundEngine={soundEngine}
        architectOutcome={architectOutcome}
        observerPCFlickering={observerPCFlickering}
        onObserverPCClick={handleObserverPCClick}
        onPaperClick={() => setShowDay47Modal(true)}
        showTerminal={showTerminal}
        onTerminalClose={() => setShowTerminal(false)}
        socketAriaCabinLightOff={socketAriaCabinLightOff}
        shadowTerminalAccess={shadowTerminalAccess}
        showArchitect={showArchitect}
        cycle={cycle}
      />

      {/* Right sidebar */}
      <AgentPanel agents={agents} logs={logs} />

      {/* Goal input bar */}
      {showGoalInput && <GoalInput />}

      {/* Fourth wall overlay (Sequencer) — starts only after Deliverable finishes */}
      {isFourthWallTriggered && deliverableFinished && !showArchitect && (
        <FourthWall onArchitectSummon={handleArchitectSummon} />
      )}

      {/* The Architect — fullscreen terminal overlay */}
      {showArchitect && (
        <ArchitectTerminal onClose={handleArchitectClose} />
      )}

      {/* Deliverable screen overlay */}
      {showDeliverable && (
        <DeliverableScreen terminalContent={terminalContent} onClose={handleDeliverableClose} />
      )}

      {/* Day 47 modal */}
      {showDay47Modal && (
        <Day47Modal onClose={() => setShowDay47Modal(false)} />
      )}

      {/* The Observer — renders nothing */}
      <TheObserver />
    </div>
  );
}

export default App;
