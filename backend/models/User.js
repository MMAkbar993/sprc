import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password_hash: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    enum: ['student', 'faculty', 'admin'],
    default: 'student'
  },
  avatar_url: {
    type: String,
    default: null
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  date_of_birth: {
    type: Date
  },
  blood_group: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  nationality: {
    type: String,
    default: 'Pakistani',
    trim: true
  },
  religion: {
    type: String,
    default: 'Islam',
    trim: true
  },
  emergency_contact: {
    type: String,
    trim: true
  },
  guardian_name: {
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

// Index for better performance (email already has unique: true which creates an index)
userSchema.index({ role: 1 });

// Virtual for student data
userSchema.virtual('student', {
  ref: 'Student',
  localField: '_id',
  foreignField: 'user_id',
  justOne: true
});

// Virtual for faculty data
userSchema.virtual('faculty', {
  ref: 'Faculty',
  localField: '_id',
  foreignField: 'user_id',
  justOne: true
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

export default mongoose.model('User', userSchema);
