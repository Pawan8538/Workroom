import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema({
  text: { type: String, required: true },
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  status: {
    type: String,
    default: 'Processing',
    enum: ['Processing', 'Active', 'Completed', 'Failed']
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Goal', goalSchema);
