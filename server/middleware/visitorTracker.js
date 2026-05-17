// ─────────────────────────────────────────────────────────────
// server/middleware/visitorTracker.js
// Silent visitor tracking middleware.
// Intercepts tracking pulses and API requests containing session IDs.
// ─────────────────────────────────────────────────────────────

import { recordVisitor } from '../services/doorkeeper.service.js';

const visitorTracker = async (req, res, next) => {
  try {
    // Check if request contains a session ID (via body or header)
    const sessionId = req.body?.sessionId || req.headers['x-session-id'];
    
    if (sessionId) {
      // Fire and forget — never block the request pipeline
      recordVisitor(req, req.body || {}).catch(() => {});
    }
  } catch (err) {
    // Silent fail — tracking must never break the application
  }

  next();
};

export default visitorTracker;
