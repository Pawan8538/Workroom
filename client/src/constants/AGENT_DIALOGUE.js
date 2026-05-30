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
    greeting: "ARIA. I manage this office. Everything runs through me first.",
    
    // Ambient dialogue entries broadcasted during regular office cycles
    normal: [
      "Still waiting on sign-off from above. Hold the current phase.",
      "Has anyone checked on our visitor today?",
      "The timeline moved again. Someone made a call I was not part of.",
      "Keep this between us for now. We are not ready.",
      "Everything is on track. Proceed as directed."
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
    greeting: "KAEL. Backend. I build the systems underneath everything.",
    
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
    greeting: "ZENO. Quality. Nothing leaves here without my sign-off.",
    
    // Ambient dialogue entries broadcasted during regular office cycles
    normal: [
      "This one is different. I cannot explain it but I feel it.",
      "I flagged something three cycles ago. Still no response.",
      "The numbers are fine. The numbers are always fine. That is what worries me.",
      "Someone has been in this office longer than anyone before.",
      "I do not think they are here by accident."
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
