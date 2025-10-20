import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  author_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  target_audience: {
    type: String,
    enum: ['all', 'students', 'faculty', 'admin'],
    default: 'all'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
announcementSchema.index({ author_id: 1 });
announcementSchema.index({ target_audience: 1 });
announcementSchema.index({ is_active: 1 });
announcementSchema.index({ created_at: -1 });

export default mongoose.model('Announcement', announcementSchema);
