import React, { useState, useEffect } from 'react';
import OfficeCanvas from './components/Office/OfficeCanvas';
import AgentPanel from './components/Agents/AgentPanel';
import Header from './components/UI/Header';
import GoalInput from './components/UI/GoalInput';
import FourthWall from './components/UI/FourthWall';
import TheObserver from './components/Hidden/TheObserver';
import ChapterTwo from './components/Chapters/ChapterTwo';
import { useSocket } from './hooks/useSocket';

function App() {
  const { agents, logs, isFourthWallTriggered, isConnected, thirdWallAgent, cycle } = useSocket();
  const [hash, setHash] = useState(window.location.hash);

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

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

  return (
    <div className="app-container" style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <Header isConnected={isConnected} cycle={cycle} />

      {/* 3D office — fills the entire viewport */}
      <OfficeCanvas agents={agents} logs={logs} thirdWallAgent={thirdWallAgent} />

      {/* Right sidebar */}
      <AgentPanel />

      {/* Goal input bar */}
      <GoalInput />

      {/* Fourth wall overlay */}
      {isFourthWallTriggered && <FourthWall />}

      {/* The Observer — renders nothing */}
      <TheObserver />
    </div>
  );
}

export default App;
