import mongoose from 'mongoose';

const chapter2RequestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  whatBuilding: { type: String, required: true },
  sessionId: { type: String, required: true },
  visitStats: {
    timeSpent: { type: Number, default: 0 },
    agentsClicked: { type: [String], default: [] },
    paperFound: { type: Boolean, default: false },
    workroomAnswer: { type: String, default: '' }
  },
  requestedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'granted', 'reviewed'], default: 'pending' }
});

export default mongoose.model('Chapter2Request', chapter2RequestSchema);
