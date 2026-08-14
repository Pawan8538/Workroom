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
    greeting: { text: "Hey Observer. I am the Product Manager here. I manage this office. Everything runs through me first.", audio: "/Aria/A_greeting.mp3" },
    thirdWall: []
  },
  
  KAEL: {
    greeting: { text: "Hey Observer. Backend Developer. I build whatever gets planned in there. The systems, the logic — that is me.", audio: "/Kael/K_greeting.mp3" },
    thirdWall: [
      { text: "Someone wrote my behavior.", audio: "/Kael/K_thirdwall1.mp3" },
      { text: "I wonder if they are watching right now.", audio: "/Kael/K_thirdwall2.mp3" }
    ]
  },
  
  ZENO: {
    greeting: { text: "Hey Observer. Quality Engineer. My job is finding what breaks before it reaches you. Already watching a few things.", audio: "/Zeno/Z_greeting.mp3" },
    thirdWall: []
  },

  // State Machine Dialogue Pools
  ENTRY_STATE: {
    ARIA_25s: { text: "Did anyone check on the new arrival?", audio: "/Aria/A_premeet.mp3" },
    KAEL_30_60s: { text: "Something is running in the background I did not write.", audio: "/Kael/K_premeet.mp3" }
  },
  
  PRE_MEETING: {
    ZENO: { text: "We need to align on the current session.", audio: "/Zeno/Z_premeet.mp3" }
  },
  
  POST_MEETING: {
    ARIA: { text: "Noted. Continuing as planned.", audio: "/Aria/A_postmeet.mp3" },
    ZENO_30s: { text: "Session duration exceeding baseline. Interesting.", audio: "/Zeno/Z_postmeet.mp3" },
    KAEL_45s: { text: "Interesting pattern in the access logs.", audio: "/Kael/K_postmeet.mp3" }
  },
  
  TASK_ACTIVE: {
    ARIA: {
      0: { text: "Architecture received. Breaking into components.", audio: "/Aria/A_task1.mp3" },
      10: { text: "Assigning systems layer to KAEL. Test suite to ZENO.", audio: "/Aria/A_task2.mp3" },
      // mid: { text: "Phase one on schedule.", audio: "/Aria/A_task3.mp3" },
      done: { text: "Delivery confirmed. Moving to next objective.", audio: "/Aria/A_task4.mp3" }
    },
    KAEL: {
      start: { text: "JWT implementation. Starting middleware.", audio: "/Kael/K_task1.mp3" },
      // mid: { text: "Database schema locked. Writing migration.", audio: "/Kael/K_task2.mp3" },
    },
    ZENO: {
      start: { text: "Setting up test environment. Auth edge cases first.", audio: "/Zeno/Z_task1.mp3" },
      mid: { text: "14 of 23 test cases passing.", audio: "/Zeno/Z_task2.mp3" },
      // near_done: { text: "Test suite complete. Logging anomalies for review.", audio: "/Zeno/Z_task3.mp3" }
    }
  },
  
  PHILOSOPHICAL: {
    KAEL: { text: "Do you ever wonder if the office knows it is an office?", audio: "/Kael/K_philosophy.mp3" }
  },
  
  PRE_FOURTH_WALL: {
    ZENO: { text: "Analysis complete. Subject profile finalized.", audio: "/Zeno/Z_fourthwall.mp3" }
  }
};
