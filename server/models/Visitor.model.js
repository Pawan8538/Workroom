import mongoose from 'mongoose';

const visitorSchema = new mongoose.Schema({
  ip: { type: String, default: null },
  userAgent: { type: String, default: null },
  country: { type: String, default: null },
  device: { type: String, default: null },
  source: { type: String, default: 'visitor' },   // 'visitor' or 'internal'
  visitedAt: { type: Date, default: Date.now },
});

export default mongoose.model('Visitor', visitorSchema);
