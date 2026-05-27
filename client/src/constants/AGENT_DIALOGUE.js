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
    // Fired when the observer selects/clicks ARIA initially
    greeting: "Observer session active. Continuing.",
    
    // Ambient dialogue entries broadcasted during regular office cycles
    normal: [
      "Let me know when the build is ready.",
      "I am moving the deadline. Something came up.",
      "Did anyone check on the new arrival?",
      "Sprint adjusted. Accounting for the new variable.",
      "Workroom initialized. All systems nominal."
    ],
    
    // Active task execution lines showing operational progress
    taskExecution: [
      "Architecture received. Breaking into components.",
      "Assigning systems layer to KAEL. Test suite to ZENO.",
      "Phase one on schedule. Architect notified.",
      "Delivery confirmed. Moving to next objective."
    ],
    
    // Empty for ARIA (Kael specific narrative breaks)
    thirdWall: [],
    
    // Empty for ARIA (Kael specific narrative breaks)
    simulationQuestion: null
  },
  
  KAEL: {
    // Fired when the observer selects/clicks KAEL initially
    greeting: "Observer in the room. Carrying on.",
    
    // Ambient dialogue entries broadcasted during regular office cycles
    normal: [
      "The environment is behaving differently today.",
      "Something is running in the background I did not write.",
      "I keep getting an extra variable in the logs.",
      "Interesting pattern in the access logs.",
      "Auth layer complete. All sessions tracked."
    ],
    
    // Active task execution lines showing operational progress
    taskExecution: [
      "JWT implementation. Starting middleware.",
      "Token generation complete. Moving to refresh logic.",
      "Database schema locked. Writing migration.",
      "API endpoints complete. Awaiting QA."
    ],
    
    // Special third-wall breaking phrases when KAEL freezes and faces the screen
    thirdWall: [
      "Someone wrote my behavior.",
      "I wonder if they are watching right now."
    ],
    
    // Scripted prompt when KAEL questions the nature of the reality
    simulationQuestion: "Do you ever wonder if the office knows it is an office?"
  },
  
  ZENO: {
    // Fired when the observer selects/clicks ZENO initially
    greeting: "Observer detected. Monitoring.",
    
    // Ambient dialogue entries broadcasted during regular office cycles
    normal: [
      "The test is passing but something feels off.",
      "I am seeing unusual activity in the session data.",
      "Should we tell them or let them figure it out?",
      "Session duration exceeding baseline. Interesting.",
      "Anomaly within expected parameters. Continuing."
    ],
    
    // Active task execution lines showing operational progress
    taskExecution: [
      "Setting up test environment. Auth edge cases first.",
      "14 of 23 test cases passing. Found edge case in expiry.",
      "Coverage at 87 percent. Flagging token refresh scenario.",
      "Test suite complete. Logging anomalies for review."
    ],
    
    // Empty for ZENO (Kael specific narrative breaks)
    thirdWall: [],
    
    // Empty for ZENO (Kael specific narrative breaks)
    simulationQuestion: null
  }
};
