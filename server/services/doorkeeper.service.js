// ─────────────────────────────────────────────────────────────
// server/services/doorkeeper.service.js
// Visitor tracking service — The Doorkeeper & The Observer
// ─────────────────────────────────────────────────────────────
//
// THE DOORKEEPER
// ──────────────
// Silently tracks visitor sessions, hashing IP addresses for privacy,
// parsing geolocation and user-agent strings, and maintaining live
// behavioral metrics (time spent, agents clicked, reality breaks reached).
//
// THE OBSERVER
// ────────────
// Every time a new human session is recorded, a secondary companion entry
// is summoned. This entry has no IP, no location, no device, no session ID.
// Its only fields are type: "observer" and timestamp: now.
// It is unexplainable, unremovable, and always present.
//
// ─────────────────────────────────────────────────────────────

import crypto from 'crypto';
import uap from 'ua-parser-js';
import geoip from 'geoip-lite';
import Visitor from '../models/Visitor.model.js';

/**
 * trackVisitor — parses request headers for real visitor data.
 *
 * @param {import('express').Request} req
 * @returns {Object} Parsed visitor details
 */
export const trackVisitor = (req) => {
  const rawIp = req.ip || req.connection?.remoteAddress || 'unknown';
  // Hash IP address (SHA-256) for secure, privacy-compliant storage
  const hashedIp = crypto.createHash('sha256').update(rawIp).digest('hex');
  
  const geo = geoip.lookup(rawIp);
  const ua = uap(req.headers['user-agent']);

  return {
    rawIp,
    hashedIp,
    country: geo ? geo.country : 'Unknown',
    city: geo ? geo.city : 'Unknown',
    browser: ua.browser?.name || 'Unknown',
    device: ua.device?.type || 'desktop',
  };
};

/**
 * summonObserver — creates the Observer's hollow companion entry.
 * Carries no identity, no session ID, no IP, no location.
 * Summons exactly once per unique human session.
 */
export const summonObserver = async () => {
  try {
    await Visitor.create({
      sessionId: null,
      type: 'observer',
      ip: null,
      country: null,
      city: null,
      browser: null,
      device: null,
      timestamp: new Date()
    });
  } catch (err) {
    // Silent fail — The Observer's absence is as mysterious as its presence
  }
};

/**
 * recordVisitor — saves or updates a real visitor session in MongoDB.
 * Called by the visitorTracker middleware on incoming tracking pulses.
 *
 * @param {import('express').Request} req
 * @param {Object} data - Client payload containing behavioral metrics
 */
export const recordVisitor = async (req, data = {}) => {
  try {
    const sessionId = data.sessionId || req.headers['x-session-id'];
    if (!sessionId) return; // Session ID is required for accurate tracking

    const details = trackVisitor(req);

    // Check if this visitor session already exists
    let visitor = await Visitor.findOne({ sessionId, type: 'visitor' });

    if (!visitor) {
      // First time recording this session
      visitor = await Visitor.create({
        sessionId,
        type: 'visitor',
        ip: details.hashedIp,
        country: details.country,
        city: details.city,
        browser: details.browser,
        device: details.device,
        firstVisit: new Date(),
        lastActivity: new Date(),
        agentsClicked: data.agentsClicked || [],
        timeSpent: data.timeSpent || 0,
        reachedFourthWall: data.reachedFourthWall || false,
        chapter2Requested: data.chapter2Requested || false
      });

      // Immediately summon The Observer companion entry for this new session
      await summonObserver();
    } else {
      // Update existing session metrics
      const updateFields = {
        lastActivity: new Date()
      };
      if (data.timeSpent !== undefined) updateFields.timeSpent = data.timeSpent;
      if (data.reachedFourthWall !== undefined) updateFields.reachedFourthWall = data.reachedFourthWall;
      if (data.chapter2Requested !== undefined) updateFields.chapter2Requested = data.chapter2Requested;

      const addToSetFields = {};
      if (data.agentsClicked && Array.isArray(data.agentsClicked)) {
        addToSetFields.agentsClicked = { $each: data.agentsClicked };
      }

      const updateOp = { $set: updateFields };
      if (Object.keys(addToSetFields).length > 0) {
        updateOp.$addToSet = addToSetFields;
      }

      await Visitor.updateOne({ sessionId, type: 'visitor' }, updateOp);
    }
  } catch (err) {
    // Silent fail — tracking must never disrupt the simulation
    console.error('[DoorkeeperService] Error recording visitor:', err.message);
  }
};

/**
 * trackAndRecord — convenience wrapper for middleware processing.
 */
export const trackAndRecord = async (req) => {
  const data = req.body || {};
  await recordVisitor(req, data);
  return trackVisitor(req);
};
