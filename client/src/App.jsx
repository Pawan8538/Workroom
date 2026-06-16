import React, { useState, useEffect, useCallback } from 'react';
import OfficeCanvas from './components/Office/OfficeCanvas';
import AgentPanel from './components/Agents/AgentPanel';
import Header from './components/UI/Header';
import GoalInput from './components/UI/GoalInput';
import FourthWall from './components/UI/FourthWall';
import ChapterTwo from './components/Chapters/ChapterTwo';
import TheObserver from './components/Hidden/TheObserver';
import { useSocket } from './hooks/useSocket';
import GateScene from './components/UI/GateScene';
import { useSoundEngine } from './hooks/useSoundEngine';
import DeliverableScreen from './components/UI/DeliverableScreen';
import Day47Modal from './components/UI/Day47Modal';

function App() {
  const { agents, logs, isFourthWallTriggered, isDeliverableReady, isMeetingActive, isConnected, thirdWallAgent, cycle, meetingStartedAt, ariaTaskAssignedAt, fourthWallAt, philosophicalAt, philosophicalText, terminalContent, socketAriaCabinLightOff, shadowTerminalAccess, socket } = useSocket();
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

  // ── Architect figure states ──
  const [architectFigureVisible, setArchitectFigureVisible] = useState(false);
  const [architectIsSeated, setArchitectIsSeated] = useState(false);
  const [showChapter2RequestForm, setShowChapter2RequestForm] = useState(false);
  const [chapter2Approved, setChapter2Approved] = useState(false);
  // ── KAEL Music State ──
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [musicPaused, setMusicPaused] = useState(false);
  
  // ── Phase 9: Observer Sync State ──
  const [hasThirdWallCompleted, setHasThirdWallCompleted] = useState(false);

  const soundEngine = useSoundEngine();

  // ── Observer Sync: Beam visibility to backend ──
  useEffect(() => {
    if (!socket) return;
    
    const handleVisibilityChange = () => {
      // User is active ONLY if they passed the gate AND the tab is visible
      const isActive = gatePassed && document.visibilityState === 'visible';
      socket.emit('client:visibilityState', { isActive });
      console.log(`[ObserverSync] client:visibilityState -> isActive: ${isActive}`);
    };

    // Trigger immediately when gatePassed changes
    handleVisibilityChange();

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [gatePassed, socket]);

  // Trigger foundation sounds and scattered logs when the gate is passed
  useEffect(() => {
    if (gatePassed) {
      soundEngine.startFoundationSounds();

      const timer47 = setTimeout(() => {
        if (window.__workroom_pushLog) {
          window.__workroom_pushLog({
            agentId: 'ARCHIVIST',
            message: 'Entry updated.',
            type: 'info',
            timestamp: new Date().toISOString()
          });
        }
      }, 47000);

      const timer90 = setTimeout(() => {
        if (window.__workroom_pushLog) {
          window.__workroom_pushLog({
            agentId: '???',
            message: 'still active.',
            type: 'shadow',
            timestamp: new Date().toISOString()
          });
        }
      }, 90000);

      return () => {
        clearTimeout(timer47);
        clearTimeout(timer90);
      };
    }
  }, [gatePassed, soundEngine]);

  // Handle fourth wall silence sequence
  useEffect(() => {
    // Phase 8 logic starts FourthWall sequencer
  }, [isFourthWallTriggered, deliverableFinished]);

  useEffect(() => {
    if (isDeliverableReady && !showDeliverable && !deliverableFinished) {
      setObserverPCFlickering(true);
    }
  }, [isDeliverableReady, showDeliverable, deliverableFinished]);

  // Scattered logs after third wall fires
  useEffect(() => {
    if (thirdWallAgent === 'kael') {
      if (window.__workroom_pushLog) {
        window.__workroom_pushLog({
          agentId: 'ARCHIVIST',
          message: 'Pattern recognized. Continuing observation.',
          type: 'info',
          timestamp: new Date().toISOString()
        });
        window.__workroom_pushLog({
          agentId: '???',
          message: 'monitoring synchronized.',
          type: 'shadow',
          timestamp: new Date().toISOString()
        });
      }
    }
  }, [thirdWallAgent]);

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // ── Unlock Goal Input after Third Wall ──
  useEffect(() => {
    if (!socket) return;
    const handleThirdWallComplete = () => {
      console.log('[App] Third Wall sequence completed. Unlocking Goal Input.');
      setHasThirdWallCompleted(true);
    };
    socket.on('agent:thirdWallComplete', handleThirdWallComplete);
    return () => socket.off('agent:thirdWallComplete', handleThirdWallComplete);
  }, [socket]);

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
    if (isMeetingActive === false && isMeetingActive !== null && gatePassed && hasThirdWallCompleted && !showGoalInput) {
      setTimeout(() => setShowGoalInput(true), 3000);
    }
  }, [isMeetingActive, gatePassed, hasThirdWallCompleted, showGoalInput]);

  // ── Architect summon callback — fired by FourthWall.jsx ──
  const handleArchitectSummon = useCallback(() => {
    console.log('[App] Architect summoned. Showing ArchitectTerminal + figure.');
    // Spawn the 3D figure at the same time the terminal starts
    setArchitectFigureVisible(true);
    setShowArchitect(true);

    if (window.__workroom_pushLog) {
      window.__workroom_pushLog({
        agentId: 'ARCHITECT',
        message: 'All three. Always the same person.',
        type: 'system',
        timestamp: new Date().toISOString()
      });
    }
  }, []);

  // ── Architect figure arrived at desk — show form after 5 seconds ──
  const handleArchitectArrivedAtDesk = () => {
    console.log('[App] Architect arrived at Observer desk.');
    setTimeout(() => {
      setShowChapter2RequestForm(true);
    }, 5000);
  };

  const handleChapter2RequestSubmit = (approved) => {
    setShowChapter2RequestForm(false);
    if (approved) {
      setChapter2Approved(true);
    } else {
      setTimeout(() => {
        setArchitectFigureVisible(false);
        setShowArchitect(false);
      }, 5000);
    }
  };

  // ── Architect close callback — fired by ArchitectFigure.jsx after YES/NO ──
  const handleArchitectClose = (outcome) => {
    console.log('[App] Architect sequence complete. Outcome:', outcome);
    setArchitectOutcome(outcome || 'no');

    if (outcome === 'no') {
      setTimeout(() => {
        setArchitectFigureVisible(false);
        setShowArchitect(false);
      }, 5000);
    }
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

  if (!gatePassed) {
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
        onTerminalClose={() => {
          setShowTerminal(false);
          if (!isFourthWallTriggered && socket) {
            socket.emit('simulation:triggerFourthWall');
          }
        }}
        socketAriaCabinLightOff={socketAriaCabinLightOff}
        shadowTerminalAccess={shadowTerminalAccess}
        showArchitect={showArchitect}
        architectFigureVisible={architectFigureVisible}
        architectIsSeated={architectIsSeated}
        onArchitectArrivedAtDesk={handleArchitectArrivedAtDesk}
        onArchitectClose={handleArchitectClose}
        chapter2Approved={chapter2Approved}
        cycle={cycle}
        isMusicPlaying={isMusicPlaying}
        setIsMusicPlaying={setIsMusicPlaying}
        musicPaused={musicPaused}
        setMusicPaused={setMusicPaused}
        isFourthWallTriggered={isFourthWallTriggered}
      />

      {/* Right sidebar */}
      <AgentPanel agents={agents} logs={logs} />

      {/* Goal input bar */}
      {showGoalInput && <GoalInput socket={socket} isMeetingActive={isMeetingActive} />}

      {/* Fourth wall overlay (Sequencer) — starts only after Deliverable finishes */}
      {isFourthWallTriggered && deliverableFinished && !showArchitect && (
        <FourthWall onArchitectSummon={handleArchitectSummon} />
      )}



      {/* Deliverable screen overlay */}
      {showDeliverable && (
        <DeliverableScreen terminalContent={terminalContent} onClose={handleDeliverableClose} />
      )}

      {/* Day 47 modal */}
      {showDay47Modal && (
        <Day47Modal onClose={() => setShowDay47Modal(false)} />
      )}

      {/* Chapter 2 Authorization Form (End of Chapter 1) */}
      {showChapter2RequestForm && (
        <ChapterTwo onSubmitForm={handleChapter2RequestSubmit} />
      )}

      {/* The Observer — renders nothing */}
      <TheObserver />
    </div>
  );
}

export default App;
