import mongoose from 'mongoose';

const virtualClassroomSchema = new mongoose.Schema({
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  start_time: {
    type: Date,
    required: true
  },
  end_time: {
    type: Date,
    required: true
  },
  meeting_url: {
    type: String,
    trim: true
  },
  meeting_id: {
    type: String,
    trim: true
  },
  password: {
    type: String,
    trim: true
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
virtualClassroomSchema.index({ course_id: 1 });
virtualClassroomSchema.index({ start_time: 1 });
virtualClassroomSchema.index({ is_active: 1 });

export default mongoose.model('VirtualClassroom', virtualClassroomSchema);
