// ─────────────────────────────────────────────────────────────
// client/src/hooks/useDoorkeeper.js
// Silent visitor tracking hook & beacon manager
// ─────────────────────────────────────────────────────────────
// Generates a unique session ID in client memory (never stored in
// browser storage or cookies). Maintains live behavioral metrics
// (agents clicked, time spent, reality breaks reached).
// Sends periodic silent pulses to POST /api/doorkeeper/track.
// ─────────────────────────────────────────────────────────────

import { useEffect } from 'react';

export const useDoorkeeper = () => {
  useEffect(() => {
    if (!window.__doorkeeper) {
      // Generate unique session ID in memory (not stored in cookies/storage)
      const sessionId = window.crypto?.randomUUID ? window.crypto.randomUUID() : 'sess_' + Math.random().toString(36).substr(2, 9);
      const startTime = Date.now();

      window.__doorkeeper = {
        sessionId,
        startTime,
        agentsClicked: new Set(),
        reachedFourthWall: false,
        chapter2Requested: false,

        logAgentClick: (agentId) => {
          window.__doorkeeper.agentsClicked.add(agentId);
          window.__doorkeeper.sendPulse();
        },
        logFourthWall: () => {
          window.__doorkeeper.reachedFourthWall = true;
          window.__doorkeeper.sendPulse();
        },
        logChapter2Request: () => {
          window.__doorkeeper.chapter2Requested = true;
          window.__doorkeeper.sendPulse();
        },
        sendPulse: async () => {
          const timeSpent = Math.floor((Date.now() - window.__doorkeeper.startTime) / 1000);
          const payload = {
            sessionId: window.__doorkeeper.sessionId,
            agentsClicked: Array.from(window.__doorkeeper.agentsClicked),
            timeSpent,
            reachedFourthWall: window.__doorkeeper.reachedFourthWall,
            chapter2Requested: window.__doorkeeper.chapter2Requested
          };

          try {
            await fetch('http://localhost:5000/api/doorkeeper/track', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'x-session-id': window.__doorkeeper.sessionId
              },
              body: JSON.stringify(payload)
            });
          } catch (err) {
            // Silent fail — tracking must never disrupt the user experience
          }
        }
      };

      // Send initial tracking pulse
      window.__doorkeeper.sendPulse();

      // Send periodic heartbeat pulses every 10 seconds
      const interval = setInterval(() => {
        window.__doorkeeper.sendPulse();
      }, 10000);

      // Ensure final pulse is sent before the visitor leaves or unloads the page
      const handleUnload = () => {
        window.__doorkeeper?.sendPulse();
      };
      window.addEventListener('beforeunload', handleUnload);

      return () => {
        clearInterval(interval);
        window.removeEventListener('beforeunload', handleUnload);
      };
    }
  }, []);
};
