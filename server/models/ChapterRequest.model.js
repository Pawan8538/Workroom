// ─────────────────────────────────────────────────────────────
// server/models/ChapterRequest.model.js
// Mongoose schema for Chapter 2 access requests
// ─────────────────────────────────────────────────────────────
// Stores access requests submitted by visitors at the Chapter 2 gate.
// Includes full qualification details and approval status.
// ─────────────────────────────────────────────────────────────

import mongoose from 'mongoose';

const chapterRequestSchema = new mongoose.Schema({
  // Applicant details
  name: { type: String, required: true },
  reason: { type: String, required: true },
  linkedinOrTwitter: { type: String, required: true },

  // Session ID associated with the visitor making the request
  sessionId: { type: String, required: true },

  // When the access request was submitted
  submittedAt: { type: Date, default: Date.now },

  // Lifecycle status enum: 'pending', 'approved', 'rejected'
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
});

export default mongoose.model('ChapterRequest', chapterRequestSchema);
