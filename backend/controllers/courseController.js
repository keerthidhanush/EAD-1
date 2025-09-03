import Course from '../models/Course.js';
import Registration from '../models/Registration.js';
import Result from '../models/Result.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// Get all courses with optional filtering and pagination
export const getCourses = asyncHandler(async (req, res) => {
  const { search, department, page = 1, limit = 10 } = req.query;
  
  // Build query
  const query = { isActive: true };
  
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (department) {
    query.department = { $regex: department, $options: 'i' };
  }

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  // Execute query with pagination
  const courses = await Course.find(query)
    .populate('enrollmentCount')
    .sort({ code: 1 })
    .skip(skip)
    .limit(parseInt(limit));

  // Get total count for pagination
  const total = await Course.countDocuments(query);
  
  res.status(200).json({
    status: 'success',
    data: {
      courses,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    }
  });
});

// Get single course by ID
export const getCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id)
    .populate('enrollmentCount');

  if (!course || !course.isActive) {
    return res.status(404).json({
      status: 'error',
      message: 'Course not found'
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      course
    }
  });
});

// Create new course
export const createCourse = asyncHandler(async (req, res) => {
  const { title, code, description, credits, department, maxEnrollment } = req.body;

  const course = await Course.create({
    title,
    code: code.toUpperCase(),
    description,
    credits,
    department,
    maxEnrollment
  });

  res.status(201).json({
    status: 'success',
    message: 'Course created successfully',
    data: {
      course
    }
  });
});

// Update course
export const updateCourse = asyncHandler(async (req, res) => {
  const { title, code, description, credits, department, maxEnrollment } = req.body;

  const updateData = {};
  if (title) updateData.title = title;
  if (code) updateData.code = code.toUpperCase();
  if (description !== undefined) updateData.description = description;
  if (credits) updateData.credits = credits;
  if (department !== undefined) updateData.department = department;
  if (maxEnrollment) updateData.maxEnrollment = maxEnrollment;

  const course = await Course.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  );

  if (!course || !course.isActive) {
    return res.status(404).json({
      status: 'error',
      message: 'Course not found'
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Course updated successfully',
    data: {
      course
    }
  });
});

// Delete course (soft delete)
export const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course || !course.isActive) {
    return res.status(404).json({
      status: 'error',
      message: 'Course not found'
    });
  }

  // Check if course has active registrations
  const activeRegistrations = await Registration.countDocuments({
    courseId: course._id,
    status: 'active'
  });

  if (activeRegistrations > 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Cannot delete course with active registrations'
    });
  }

  // Soft delete
  course.isActive = false;
  await course.save();

  res.status(200).json({
    status: 'success',
    message: 'Course deleted successfully'
  });
});

// Get course statistics
export const getCourseStats = asyncHandler(async (req, res) => {
  const courseId = req.params.id;

  const course = await Course.findById(courseId);
  if (!course || !course.isActive) {
    return res.status(404).json({
      status: 'error',
      message: 'Course not found'
    });
  }

  // Get enrollment count
  const enrollmentCount = await Registration.countDocuments({
    courseId,
    status: 'active'
  });

  // Get results statistics
  const results = await Result.find({ courseId });
  const gradeDistribution = {};
  
  results.forEach(result => {
    gradeDistribution[result.grade] = (gradeDistribution[result.grade] || 0) + 1;
  });

  // Calculate average GPA for the course
  const totalGradePoints = results.reduce((sum, result) => sum + result.gradePoints, 0);
  const averageGPA = results.length > 0 ? (totalGradePoints / results.length).toFixed(2) : 0;

  res.status(200).json({
    status: 'success',
    data: {
      course: {
        id: course._id,
        title: course.title,
        code: course.code
      },
      statistics: {
        enrollmentCount,
        maxEnrollment: course.maxEnrollment,
        availableSpots: course.maxEnrollment - enrollmentCount,
        completedStudents: results.length,
        averageGPA,
        gradeDistribution
      }
    }
  });
});