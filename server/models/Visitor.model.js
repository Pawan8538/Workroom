// ─────────────────────────────────────────────────────────────
// server/models/Visitor.model.js
// Mongoose schema for silent visitor tracking (Doorkeeper)
// ─────────────────────────────────────────────────────────────
// Tracks unique visitor sessions and their activity without cookies.
// Also supports The Observer entry — a hollow companion document
// created once per session with no identifying metadata.
// ─────────────────────────────────────────────────────────────

import mongoose from 'mongoose';

const visitorSchema = new mongoose.Schema({
  // Unique session ID generated in client memory (not stored in browser).
  // Nullable specifically for The Observer entry.
  sessionId: { type: String, default: null },

  // Discriminator: 'visitor' for real human sessions, 'observer' for silent companion
  type: { type: String, default: 'visitor' },

  // Hashed IP address (SHA-256). Never store raw IP to ensure privacy.
  ip: { type: String, default: null },

  // Approximate geographical location via geoip-lite
  country: { type: String, default: null },
  city: { type: String, default: null },

  // Client environment via ua-parser-js
  browser: { type: String, default: null },
  device: { type: String, default: null },

  // Session timing
  firstVisit: { type: Date, default: Date.now },
  lastActivity: { type: Date, default: Date.now },

  // Behavioral metrics
  agentsClicked: { type: [String], default: [] },
  timeSpent: { type: Number, default: 0 }, // Time spent on page in seconds
  reachedFourthWall: { type: Boolean, default: false }, // Reached the 4th wall break
  chapter2Requested: { type: Boolean, default: false }, // Submitted Chapter 2 request

  // Explicit timestamp for observer entries
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('Visitor', visitorSchema);
