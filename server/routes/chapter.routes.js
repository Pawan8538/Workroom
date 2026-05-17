// ─────────────────────────────────────────────────────────────
// server/routes/chapter.routes.js
// Routes for Chapter 2 waitlist count & access requests
// ─────────────────────────────────────────────────────────────

import express from 'express';
import ChapterRequest from '../models/ChapterRequest.model.js';
import Visitor from '../models/Visitor.model.js';

const router = express.Router();

// ─────────────────────────────────────────────────────────────
// 1. GET /api/chapter2/waitlist-count
// Returns the number of pending requests for Chapter 2 access.
// Polled by the frontend every 30 seconds.
// ─────────────────────────────────────────────────────────────
router.get('/waitlist-count', async (req, res) => {
  try {
    const count = await ChapterRequest.countDocuments({ status: 'pending' });
    res.status(200).json({ count });
  } catch (err) {
    console.error('[ChapterRoutes] Error getting waitlist count:', err);
    res.status(500).json({ error: 'Internal server error', count: 0 });
  }
});

// ─────────────────────────────────────────────────────────────
// 2. POST /api/chapter2/request
// Submits a new request for Chapter 2 access with qualification data.
// Links to the visitor's session ID and updates Doorkeeper metrics.
// ─────────────────────────────────────────────────────────────
router.post('/request', async (req, res) => {
  try {
    const { name, reason, linkedinOrTwitter, sessionId } = req.body;
    if (!name || !reason || !linkedinOrTwitter || !sessionId) {
      return res.status(400).json({ error: 'All qualification fields and session ID are required' });
    }

    // Check if this visitor already has a request
    let request = await ChapterRequest.findOne({ sessionId });
    if (!request) {
      request = await ChapterRequest.create({
        name,
        reason,
        linkedinOrTwitter,
        sessionId,
        status: 'pending',
        submittedAt: new Date()
      });
    }

    // Update Doorkeeper visitor record to reflect the Chapter 2 request
    await Visitor.updateOne({ sessionId, type: 'visitor' }, { $set: { chapter2Requested: true } });

    res.status(200).json({ message: 'Request for Chapter 2 submitted successfully', request });
  } catch (err) {
    console.error('[ChapterRoutes] Error submitting request:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
