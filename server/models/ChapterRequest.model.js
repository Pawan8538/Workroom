import mongoose from 'mongoose';

const chapterRequestSchema = new mongoose.Schema({
  userId: String,
  requestedAt: { type: Date, default: Date.now },
  status: { type: String, default: 'Pending' }
});

export default mongoose.model('ChapterRequest', chapterRequestSchema);
