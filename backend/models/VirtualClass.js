import mongoose from 'mongoose';

const virtualClassSchema = new mongoose.Schema({
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  instructor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
  room_id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  scheduled_date: {
    type: Date,
    required: true
  },
  duration_minutes: {
    type: Number,
    required: true,
    default: 90
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  section: {
    type: String,
    trim: true
  },
  max_participants: {
    type: Number,
    default: 100
  },
  is_active: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  meeting_started_at: {
    type: Date
  },
  meeting_ended_at: {
    type: Date
  },
  participants: [{
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joined_at: Date,
    left_at: Date,
    duration_minutes: Number
  }],
  recording_url: {
    type: String
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for better performance
virtualClassSchema.index({ instructor_id: 1 });
virtualClassSchema.index({ semester: 1 });
virtualClassSchema.index({ department: 1 });
virtualClassSchema.index({ scheduled_date: 1 });
virtualClassSchema.index({ status: 1 });

export default mongoose.model('VirtualClass', virtualClassSchema);

