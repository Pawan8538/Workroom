// ─────────────────────────────────────────────────────────────
// client/src/constants/OFFICE_LAYOUT.js
// Spatial coordinates and behavioral cycle timings
// ─────────────────────────────────────────────────────────────

/**
 * 3D coordinates (x, z) mapping crucial coordinates for office grid navigation.
 */
export const AGENT_TERRITORIES = {
  ARIA: {
    home: { x: -8, z: -6 },
    meetingRoom: { x: 0, z: -4 },
    deskVisit: { x: 0, z: 0 }
  },
  
  KAEL: {
    home: { x: 0, z: 0 },
    meetingRoom: { x: 1, z: -4 },
    archivistVisit: { x: -6, z: 6 }
  },
  
  ZENO: {
    home: { x: 6, z: 2 },
    meetingRoom: { x: -1, z: -4 },
    kaelDesk: { x: 0, z: 0 }
  }
};

/**
 * Timing durations and cycle intervals (in ms or server cycle ticks).
 */
export const TIMING = {
  // Time in milliseconds that Kael holds the observer greeting line
  observerGreetingDuration: 30000,
  
  // Frequency of server ticks (cycles) between meeting events
  meetingTriggerCycle: 5,
  
  // Minimum cycle interval before Kael triggers another third wall break
  thirdWallMinCycle: 8,
  
  // Maximum cycle interval before Kael triggers another third wall break
  thirdWallMaxCycle: 15,
  
  // Minimum cycle interval before Kael asks the simulation question
  simulationQuestionMinCycle: 3,
  
  // Maximum cycle interval before Kael asks the simulation question
  simulationQuestionMaxCycle: 7,
  
  // Time in milliseconds before the shadow log starts broadcasting
  shadowLogDelay: 90000,
  
  // Duration in milliseconds Kael remains frozen facing the camera
  freezeDuration: 1500,
  
  // Meeting length in milliseconds
  meetingDuration: 45000,
  
  // Distance threshold to trigger flickers when near the Archivist room
  archivistFlickerNearDistance: 5
};

export const OFFICE_BOUNDS = { minX: -9, maxX: 9, minZ: -5, maxZ: 5 };
