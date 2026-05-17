import mongoose from 'mongoose';

const agentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: String,
  status: { type: String, default: 'Idle' },
  position: {
    x: Number,
    y: Number,
    z: Number
  }
});

export default mongoose.model('Agent', agentSchema);
