import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
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
  type: {
    type: String,
    required: true,
    enum: ['assignment', 'quiz', 'project', 'exam']
  },
  total_marks: {
    type: Number,
    required: true,
    min: 1
  },
  due_date: {
    type: Date,
    required: true
  },
  instructions: {
    type: String,
    trim: true
  },
  attachments: [{
    filename: String,
    url: String,
    size: Number
  }]
}, {
  timestamps: true
});

// Indexes for better performance
assignmentSchema.index({ course_id: 1 });
assignmentSchema.index({ due_date: 1 });
assignmentSchema.index({ type: 1 });

export default mongoose.model('Assignment', assignmentSchema);
