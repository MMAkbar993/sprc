import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  assignment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  submission_text: {
    type: String,
    trim: true
  },
  submission_file: {
    filename: String,
    originalname: String,
    path: String,
    size: Number,
    mimetype: String
  },
  submission_link: {
    type: String,
    trim: true
  },
  submitted_at: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['submitted', 'graded', 'returned', 'late'],
    default: 'submitted'
  },
  grade: {
    marks_obtained: {
      type: Number,
      min: 0
    },
    feedback: {
      type: String,
      trim: true
    },
    graded_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    graded_at: {
      type: Date
    }
  },
  is_late: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound index to ensure one submission per student per assignment
submissionSchema.index({ assignment_id: 1, student_id: 1 }, { unique: true });

// Index for faster queries
submissionSchema.index({ student_id: 1 });
submissionSchema.index({ assignment_id: 1 });
submissionSchema.index({ status: 1 });

// Method to check if submission is late
submissionSchema.methods.checkIfLate = function(dueDate) {
  return this.submitted_at > dueDate;
};

export default mongoose.model('Submission', submissionSchema);
