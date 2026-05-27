// ─────────────────────────────────────────────────────────────
// client/src/constants/LOG_MESSAGES.js
// Feed and security log entries for office simulations
// ─────────────────────────────────────────────────────────────

/**
 * Standard, security, and shadow log event strings grouped by source.
 * Included: Cryptic red shadow warnings, Archivist progress updates, and Intern flags.
 */
export const LOG_MESSAGES = {
  // System-level runtime logs
  system: [
    "Connection established. Workroom online.",
    "Telemetry systems active. Monitoring agent coordinates.",
    "Memory loop initialized. Phase one tracker enabled.",
    "Database socket pool initialized on port 5000.",
    "Observer presence registered at console."
  ],

  // Aria's normal status and telemetry outputs
  aria: [
    "Project parameters updated. Codebase locked.",
    "Task priority queue rebuilt. Assigning dependencies.",
    "Report submitted to the Architect. Status: Awaiting.",
    "Aria session heartbeat confirmed. Desk 1."
  ],

  // Kael's normal status and telemetry outputs
  kael: [
    "Middleware integrated. Tokens now active.",
    "Database migration executed. 0 errors.",
    "Log anomaly detected. Checking memory boundary.",
    "Security check: Local session variables verified."
  ],

  // Zeno's normal status and telemetry outputs
  zeno: [
    "Test run complete. All cases passing.",
    "Token expiry edge case identified. Flagged for review.",
    "Simulation tick: Coverage holding at 87 percent.",
    "Zeno session heartbeat confirmed. Desk 5."
  ],

  // Cryptic shadow messages written in red for the log feed
  shadow: [
    "[SHADOW] We see you.",
    "[SHADOW] The room is not real. Only the logs are.",
    "[SHADOW] You are staying too long. Turn back.",
    "[SHADOW] Memory leak: Real world coordinates escaping.",
    "[SHADOW] The Architect is listening through the console."
  ],

  // Archivist compilation report percentages
  archivist: [
    "Archivist report generation: 14 percent complete.",
    "Archivist report generation: 47 percent complete.",
    "Archivist report generation: 89 percent complete.",
    "Archivist report generation: 99 percent complete. Awaiting signature."
  ],

  // Peripheral scanners reporting the presence of the hidden entity
  intern: [
    "Intern silhouette detected on peripheral scanner.",
    "Peripheral check: Unknown entity standing in meeting room.",
    "Flicker logged at rear conference room border."
  ],

  // High-severity security warning alerts
  alert: [
    "[ALERT] THIS AGENT IS NOT PART OF THE SIMULATION.",
    "[ALERT] Unauthorized terminal access attempt detected.",
    "[ALERT] Integrity breach detected at Sector 4."
  ]
};
