import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  taskId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  assignedRole: { 
    type: String, 
    required: true, 
    enum: ['PM', 'Backend', 'QA'] 
  },
  priority: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 3 
  },
  estimatedCycles: { type: Number, required: true },
  status: { 
    type: String, 
    default: 'Pending',
    enum: ['Pending', 'In Progress', 'Done', 'Failed']
  },
  goal: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Task', taskSchema);
