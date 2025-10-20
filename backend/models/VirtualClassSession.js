import mongoose from 'mongoose';

const virtualClassSessionSchema = new mongoose.Schema({
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
  scheduled_date: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in minutes
    default: 60
  },
  room_id: {
    type: String,
    required: true,
    unique: true
  },
  meeting_url: {
    type: String
  },
  status: {
    type: String,
    enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  participants: [{
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joined_at: Date,
    left_at: Date,
    duration: Number // minutes
  }],
  recording_url: {
    type: String
  },
  attendance_marked: {
    type: Boolean,
    default: false
  },
  session_notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes (room_id already has unique: true which creates an index automatically)
virtualClassSessionSchema.index({ course_id: 1 });
virtualClassSessionSchema.index({ instructor_id: 1 });
virtualClassSessionSchema.index({ scheduled_date: 1 });
virtualClassSessionSchema.index({ status: 1 });

// Method to check if session is active
virtualClassSessionSchema.methods.isActive = function() {
  const now = new Date();
  const scheduledTime = new Date(this.scheduled_date);
  const endTime = new Date(scheduledTime.getTime() + this.duration * 60000);
  
  return now >= scheduledTime && now <= endTime && this.status !== 'completed';
};

// Method to add participant
virtualClassSessionSchema.methods.addParticipant = function(userId) {
  const existing = this.participants.find(p => p.user_id.toString() === userId.toString());
  
  if (!existing) {
    this.participants.push({
      user_id: userId,
      joined_at: new Date()
    });
  }
  
  return this.save();
};

export default mongoose.model('VirtualClassSession', virtualClassSessionSchema);

