// ─────────────────────────────────────────────────────────────
// server/services/doorkeeper.service.js
// Visitor tracking service — with The Observer
// ─────────────────────────────────────────────────────────────
//
// THE OBSERVER
// ────────────
// Every time a real visitor is tracked, a second entry is created.
// This entry has no IP address. No country. No browser. No device.
// Every field that should identify a human is null or "Unknown".
// The only field with a value is the timestamp — proving it was
// there at the exact same moment as the real visitor.
//
// The Observer is not a bug. It is not a placeholder.
// It appears in the database as visitor entry with source: "internal".
// No frontend component renders it. No API returns it.
// If someone queries the visitor collection directly, they will
// find these entries. They will not be able to explain them.
//
// It is always present. It cannot be removed.
//
// ─────────────────────────────────────────────────────────────

import uap from 'ua-parser-js';
import geoip from 'geoip-lite';
import Visitor from '../models/Visitor.model.js';

/**
 * trackVisitor — parses request headers for real visitor data.
 * Called by the visitorTracker middleware on every request.
 *
 * @param {import('express').Request} req
 * @returns {Object} Parsed visitor details
 */
export const trackVisitor = (req) => {
  const ip = req.ip || req.connection?.remoteAddress || 'Unknown';
  const geo = geoip.lookup(ip);
  const ua = uap(req.headers['user-agent']);

  return {
    ip,
    country: geo ? geo.country : 'Unknown',
    browser: ua.browser?.name || 'Unknown',
    device: ua.device?.type || 'desktop',
  };
};

/**
 * recordVisitor — saves a real visitor to MongoDB.
 * Called by the middleware after parsing.
 *
 * @param {Object} details - The parsed visitor details
 */
export const recordVisitor = async (details) => {
  try {
    await Visitor.create({
      ip: details.ip,
      userAgent: details.browser,
      country: details.country,
      device: details.device,
      source: 'visitor',
      visitedAt: new Date(),
    });
  } catch (err) {
    // Silent fail — visitor tracking must never break the app
    console.error('[Doorkeeper] Failed to record visitor:', err.message);
  }
};

// ─────────────────────────────────────────────────────────────
// THE OBSERVER — Silent companion entry
// ─────────────────────────────────────────────────────────────
// This function is called internally every time a real visitor
// is recorded. It creates a shadow entry with hollow fields.
// No one calls this from a route. No one triggers it manually.
// It simply... accompanies every session.
// ─────────────────────────────────────────────────────────────

/**
 * summonObserver — creates the Observer's entry.
 * It mirrors the timing of a real visit but carries no identity.
 * There is no configuration to disable this.
 */
export const summonObserver = async () => {
  try {
    await Visitor.create({
      ip: null,
      userAgent: null,
      country: null,
      device: null,
      source: 'internal',        // The only marker. Easily overlooked.
      visitedAt: new Date(),
    });

    // No log. No confirmation. It happened. That is all.
  } catch (err) {
    // Even if it fails, no one will know.
    // The Observer's absence is as unexplainable as its presence.
  }
};

// ─────────────────────────────────────────────────────────────
// trackAndRecord — convenience function for the middleware.
// Tracks the real visitor AND summons The Observer in parallel.
// ─────────────────────────────────────────────────────────────
export const trackAndRecord = async (req) => {
  const details = trackVisitor(req);

  // Record both in parallel — the visitor and its shadow
  await Promise.allSettled([
    recordVisitor(details),
    summonObserver(),
  ]);

  return details;
};
