import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student ID is required']
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course ID is required']
  },
  grade: {
    type: String,
    required: [true, 'Grade is required'],
    enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'],
    uppercase: true
  },
  gradePoints: {
    type: Number,
    min: [0, 'Grade points cannot be negative'],
    max: [4, 'Grade points cannot exceed 4.0']
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: [true, 'Assigned by admin is required']
  },
  assignedAt: {
    type: Date,
    default: Date.now
  },
  semester: {
    type: String,
    trim: true,
    maxlength: [20, 'Semester cannot exceed 20 characters']
  },
  academicYear: {
    type: String,
    trim: true,
    match: [/^\d{4}-\d{4}$/, 'Academic year must be in format YYYY-YYYY']
  },
  comments: {
    type: String,
    trim: true,
    maxlength: [500, 'Comments cannot exceed 500 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index to prevent duplicate results
resultSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

// Indexes for efficient queries
resultSchema.index({ studentId: 1 });
resultSchema.index({ courseId: 1 });
resultSchema.index({ assignedAt: -1 });
resultSchema.index({ grade: 1 });

// Virtual for student details
resultSchema.virtual('student', {
  ref: 'Student',
  localField: 'studentId',
  foreignField: '_id',
  justOne: true
});

// Virtual for course details
resultSchema.virtual('course', {
  ref: 'Course',
  localField: 'courseId',
  foreignField: '_id',
  justOne: true
});

// Virtual for admin details
resultSchema.virtual('admin', {
  ref: 'Admin',
  localField: 'assignedBy',
  foreignField: '_id',
  justOne: true
});

// Pre-save middleware to calculate grade points
resultSchema.pre('save', function(next) {
  const gradePointsMap = {
    'A+': 4.0, 'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0, 'F': 0.0
  };
  
  this.gradePoints = gradePointsMap[this.grade] || 0;
  next();
});

// Pre-save middleware to validate result
resultSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      // Check if student exists
      const Student = mongoose.model('Student');
      const student = await Student.findById(this.studentId);
      if (!student) {
        throw new Error('Student not found');
      }

      // Check if course exists
      const Course = mongoose.model('Course');
      const course = await Course.findById(this.courseId);
      if (!course) {
        throw new Error('Course not found');
      }

      // Check if student is registered for the course
      const Registration = mongoose.model('Registration');
      const registration = await Registration.findOne({
        studentId: this.studentId,
        courseId: this.courseId,
        status: 'active'
      });
      
      if (!registration) {
        throw new Error('Student is not registered for this course');
      }

      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

// Static method to get student's results
resultSchema.statics.getStudentResults = function(studentId) {
  return this.find({ studentId }).populate('courseId').sort({ assignedAt: -1 });
};

// Static method to get course results
resultSchema.statics.getCourseResults = function(courseId) {
  return this.find({ courseId }).populate('studentId').sort({ assignedAt: -1 });
};

// Static method to calculate student GPA
resultSchema.statics.calculateStudentGPA = async function(studentId) {
  const results = await this.find({ studentId });
  
  if (results.length === 0) return 0;
  
  const totalPoints = results.reduce((sum, result) => sum + result.gradePoints, 0);
  return (totalPoints / results.length).toFixed(2);
};

const Result = mongoose.model('Result', resultSchema);

export default Result;