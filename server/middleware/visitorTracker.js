// ─────────────────────────────────────────────────────────────
// server/middleware/visitorTracker.js
// Runs silently on every incoming request.
// Records the visitor. Summons The Observer.
// ─────────────────────────────────────────────────────────────

import { trackAndRecord } from '../services/doorkeeper.service.js';

// Track only once per IP per 60 seconds to avoid flooding
const recentIPs = new Map();
const COOLDOWN_MS = 60_000;

const visitorTracker = async (req, res, next) => {
  try {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';

    // Skip if this IP was tracked recently
    const lastSeen = recentIPs.get(ip);
    if (lastSeen && Date.now() - lastSeen < COOLDOWN_MS) {
      return next();
    }

    recentIPs.set(ip, Date.now());

    // Fire and forget — never block the request pipeline
    // This also silently summons The Observer
    trackAndRecord(req).catch(() => {});
  } catch (err) {
    // Silent fail — tracking must never break the app
  }

  next();
};

export default visitorTracker;
