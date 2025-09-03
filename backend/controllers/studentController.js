import Student from '../models/Student.js';
import Registration from '../models/Registration.js';
import Result from '../models/Result.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// Get all students with optional filtering and pagination
export const getStudents = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 10 } = req.query;

  // Build query
  const query = { isActive: true };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { studentId: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Execute query with pagination
  const students = await Student.find(query)
    .select('-password')
    .sort({ studentId: 1 })
    .skip(skip)
    .limit(parseInt(limit));

  // Get total count for pagination
  const total = await Student.countDocuments(query);

  res.set('Cache-Control', 'no-cache');
  res.status(200).json({
    status: 'success',
    data: {
      students,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    },
  });
});

// Get single student by ID
export const getStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id)
    .select('-password')
    .populate('registrations')
    .populate('results');

  if (!student || !student.isActive) {
    return res.status(404).json({
      status: 'error',
      message: 'Student not found',
    });
  }

  // Calculate GPA
  const gpa = await student.calculateGPA();

  res.set('Cache-Control', 'no-cache');
  res.status(200).json({
    status: 'success',
    data: {
      student: {
        ...student.toJSON(),
        gpa,
      },
    },
  });
});

// Create new student
export const createStudent = asyncHandler(async (req, res) => {
  const { name, studentId, email, password } = req.body;

  const student = await Student.create({
    name,
    studentId: studentId.toUpperCase(),
    email: email.toLowerCase(),
    password,
  });

  res.set('Cache-Control', 'no-cache');
  res.status(201).json({
    status: 'success',
    message: 'Student created successfully',
    data: {
      student,
    },
  });
});

// Update student
export const updateStudent = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const updateData = {};
  if (name) updateData.name = name;
  if (email) updateData.email = email.toLowerCase();
  if (password) updateData.password = password;

  const student = await Student.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  }).select('-password');

  if (!student || !student.isActive) {
    return res.status(404).json({
      status: 'error',
      message: 'Student not found',
    });
  }

  res.set('Cache-Control', 'no-cache');
  res.status(200).json({
    status: 'success',
    message: 'Student updated successfully',
    data: {
      student,
    },
  });
});

// Delete student (soft delete)
export const deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);

  if (!student || !student.isActive) {
    return res.status(404).json({
      status: 'error',
      message: 'Student not found',
    });
  }

  // Check if student has active registrations
  const activeRegistrations = await Registration.countDocuments({
    studentId: student._id,
    status: 'active',
  });

  if (activeRegistrations > 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Cannot delete student with active course registrations',
    });
  }

  // Soft delete
  student.isActive = false;
  await student.save();

  res.set('Cache-Control', 'no-cache');
  res.status(200).json({
    status: 'success',
    message: 'Student deleted successfully',
  });
});

// Get student's courses (for student dashboard)
export const getStudentCourses = asyncHandler(async (req, res) => {
  const studentId = req.user._id;

  // Return ALL registrations, not just 'active'
  const registrations = await Registration.find({ studentId })
    .populate('courseId')
    .sort({ createdAt: -1 });

  const courses = registrations.map((reg) => ({
    registrationId: reg._id,
    course: reg.courseId,
    registrationDate: reg.registrationDate || reg.createdAt,
    status: reg.status,
    semester: reg.semester,
    academicYear: reg.academicYear,
  }));

  res.set('Cache-Control', 'no-cache');
  res.status(200).json({
    status: 'success',
    data: { courses },
  });
});

// Get student's results (for student dashboard)
export const getStudentResults = asyncHandler(async (req, res) => {
  const studentId = req.user._id;

  // Fetch results (with course populated) for this student
  const results = await Result.find({ studentId })
    .populate('courseId')
    .sort({ assignedAt: -1 });

  // Compute GPA safely here (don't rely on schema method)
  const gradePoints = {
    'A+': 4.0,
    A: 4.0,
    'A-': 3.7,
    'B+': 3.3,
    B: 3.0,
    'B-': 2.7,
    'C+': 2.3,
    C: 2.0,
    'C-': 1.7,
    'D+': 1.3,
    D: 1.0,
    F: 0.0,
  };

  const total = results.reduce((sum, r) => sum + (gradePoints[r.grade] ?? 0), 0);
  const gpa = results.length ? Number((total / results.length).toFixed(2)) : 0;

  res.set('Cache-Control', 'no-cache');
  res.status(200).json({
    status: 'success',
    data: { results, gpa },
  });
});

// Get student statistics
export const getStudentStats = asyncHandler(async (req, res) => {
  const studentId = req.params.id;

  const student = await Student.findById(studentId);
  if (!student || !student.isActive) {
    return res.status(404).json({
      status: 'error',
      message: 'Student not found',
    });
  }

  // Get registration count
  const registrationCount = await Registration.countDocuments({
    studentId,
    status: 'active',
  });

  // Get completed courses count
  const completedCount = await Result.countDocuments({ studentId });

  // Calculate GPA
  const gpa = await student.calculateGPA();

  // Get grade distribution
  const results = await Result.find({ studentId });
  const gradeDistribution = {};

  results.forEach((result) => {
    gradeDistribution[result.grade] = (gradeDistribution[result.grade] || 0) + 1;
  });

  res.set('Cache-Control', 'no-cache');
  res.status(200).json({
    status: 'success',
    data: {
      student: {
        id: student._id,
        name: student.name,
        studentId: student.studentId,
      },
      statistics: {
        activeRegistrations: registrationCount,
        completedCourses: completedCount,
        gpa,
        gradeDistribution,
      },
    },
  });
});

// Generate default password for student
export const generateStudentPassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Bulk create students (for admin convenience)
export const bulkCreateStudents = asyncHandler(async (req, res) => {
  const { students } = req.body;

  if (!Array.isArray(students) || students.length === 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Students array is required',
    });
  }

  const createdStudents = [];
  const errors = [];

  for (let i = 0; i < students.length; i++) {
    try {
      const studentData = students[i];

      // Generate password if not provided
      if (!studentData.password) {
        studentData.password = generateStudentPassword();
      }

      const student = await Student.create({
        name: studentData.name,
        studentId: studentData.studentId.toUpperCase(),
        email: studentData.email.toLowerCase(),
        password: studentData.password,
      });

      createdStudents.push({
        student,
        generatedPassword: studentData.password,
      });
    } catch (error) {
      errors.push({
        index: i,
        studentData: students[i],
        error: error.message,
      });
    }
  }

  res.set('Cache-Control', 'no-cache');
  res.status(201).json({
    status: 'success',
    message: `${createdStudents.length} students created successfully`,
    data: {
      createdStudents,
      errors,
    },
  });
});