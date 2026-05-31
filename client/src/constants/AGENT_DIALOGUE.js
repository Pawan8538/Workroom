// ─────────────────────────────────────────────────────────────
// client/src/constants/AGENT_DIALOGUE.js
// Centralized dialogue content for Aria, Kael, and Zeno
// ─────────────────────────────────────────────────────────────

/**
 * Agent Dialogues representing their operational state, office chatter,
 * and narrative breaks.
 */
export const AGENT_DIALOGUE = {
  ARIA: {
    greeting: "Hey Observer. I am the Product Manager here. I manage this office. Everything runs through me first.",
    thirdWall: [],
    simulationQuestion: null
  },
  
  KAEL: {
    greeting: "Hey Observer. Backend Developer. I build whatever gets planned in there. The systems, the logic — that is me.",
    thirdWall: [
      "Someone wrote my behavior.",
      "I wonder if they are watching right now."
    ],
    simulationQuestion: "Do you ever wonder if the office knows it is an office?"
  },
  
  ZENO: {
    greeting: "Hey Observer. Quality Engineer. My job is finding what breaks before it reaches you. Already watching a few things.",
    thirdWall: [],
    simulationQuestion: null
  },

  // State Machine Dialogue Pools
  ENTRY_STATE: {
    ARIA_25s: "Did anyone check on the new arrival?",
    KAEL_30_60s: "Something is running in the background I did not write."
  },
  
  PRE_MEETING: {
    ZENO: "We need to align on the current session."
  },
  
  POST_MEETING: {
    ARIA: "Noted. Continuing as planned.",
    ZENO_30s: "Session duration exceeding baseline. Interesting.",
    KAEL_45s: "Interesting pattern in the access logs."
  },
  
  TASK_ACTIVE: {
    ARIA: {
      0: "Architecture received. Breaking into components.",
      10: "Assigning systems layer to KAEL. Test suite to ZENO.",
      mid: "Phase one on schedule.",
      done: "Delivery confirmed. Moving to next objective."
    },
    KAEL: {
      start: "JWT implementation. Starting middleware.",
      mid: "Database schema locked. Writing migration.",
      near_done: "API endpoints complete. Awaiting QA."
    },
    ZENO: {
      start: "Setting up test environment. Auth edge cases first.",
      mid: "14 of 23 test cases passing.",
      near_done: "Test suite complete. Logging anomalies for review."
    }
  },
  
  PHILOSOPHICAL: {
    KAEL: "Do you ever wonder if the office knows it is an office?"
  },
  
  PRE_FOURTH_WALL: {
    ZENO: "Analysis complete. Subject profile finalized."
  }
};
