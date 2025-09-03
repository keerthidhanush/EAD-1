import Result from '../models/Result.js';
import Student from '../models/Student.js';
import Course from '../models/Course.js';
import Registration from '../models/Registration.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// Get all results with optional filtering and pagination
export const getResults = asyncHandler(async (req, res) => {
  const { search, studentId, courseId, grade, page = 1, limit = 10 } = req.query;
  
  // Build query
  const query = {};
  
  if (studentId) query.studentId = studentId;
  if (courseId) query.courseId = courseId;
  if (grade) query.grade = grade;

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  // Execute query with population
  let resultsQuery = Result.find(query)
    .populate('studentId', 'name studentId email')
    .populate('courseId', 'title code department')
    .populate('assignedBy', 'name email')
    .sort({ assignedAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  // Add search filter if provided
  if (search) {
    resultsQuery = Result.aggregate([
      {
        $lookup: {
          from: 'students',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student'
        }
      },
      {
        $lookup: {
          from: 'courses',
          localField: 'courseId',
          foreignField: '_id',
          as: 'course'
        }
      },
      {
        $match: {
          $or: [
            { 'student.name': { $regex: search, $options: 'i' } },
            { 'student.studentId': { $regex: search, $options: 'i' } },
            { 'course.title': { $regex: search, $options: 'i' } },
            { 'course.code': { $regex: search, $options: 'i' } },
            { grade: { $regex: search, $options: 'i' } }
          ]
        }
      },
      { $sort: { assignedAt: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) }
    ]);
  }

  const results = await resultsQuery;

  // Get total count for pagination
  const total = await Result.countDocuments(query);
  
  res.status(200).json({
    status: 'success',
    data: {
      results,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    }
  });
});

// Get single result by ID
export const getResult = asyncHandler(async (req, res) => {
  const result = await Result.findById(req.params.id)
    .populate('studentId', 'name studentId email')
    .populate('courseId', 'title code department')
    .populate('assignedBy', 'name email');

  if (!result) {
    return res.status(404).json({
      status: 'error',
      message: 'Result not found'
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      result
    }
  });
});

// Create new result (assign grade)
export const createResult = asyncHandler(async (req, res) => {
  const { studentId, courseId, grade, semester, academicYear, comments } = req.body;

  // Verify student exists
  const student = await Student.findById(studentId);
  if (!student || !student.isActive) {
    return res.status(404).json({
      status: 'error',
      message: 'Student not found'
    });
  }

  // Verify course exists
  const course = await Course.findById(courseId);
  if (!course || !course.isActive) {
    return res.status(404).json({
      status: 'error',
      message: 'Course not found'
    });
  }

  // Verify student is registered for the course
  const registration = await Registration.findOne({
    studentId,
    courseId,
    status: 'active'
  });

  if (!registration) {
    return res.status(400).json({
      status: 'error',
      message: 'Student is not registered for this course'
    });
  }

  // Check if result already exists
  const existingResult = await Result.findOne({ studentId, courseId });
  if (existingResult) {
    return res.status(400).json({
      status: 'error',
      message: 'Grade already assigned for this student and course'
    });
  }

  const result = await Result.create({
    studentId,
    courseId,
    grade: grade.toUpperCase(),
    assignedBy: req.user._id,
    semester,
    academicYear,
    comments
  });

  // Update registration status to completed
  registration.status = 'completed';
  await registration.save();

  // Populate the result before sending response
  await result.populate('studentId', 'name studentId email');
  await result.populate('courseId', 'title code department');
  await result.populate('assignedBy', 'name email');

  res.status(201).json({
    status: 'success',
    message: 'Grade assigned successfully',
    data: {
      result
    }
  });
});

// Update result
export const updateResult = asyncHandler(async (req, res) => {
  const { grade, semester, academicYear, comments } = req.body;

  const updateData = { assignedBy: req.user._id };
  if (grade) updateData.grade = grade.toUpperCase();
  if (semester) updateData.semester = semester;
  if (academicYear) updateData.academicYear = academicYear;
  if (comments !== undefined) updateData.comments = comments;

  const result = await Result.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  )
    .populate('studentId', 'name studentId email')
    .populate('courseId', 'title code department')
    .populate('assignedBy', 'name email');

  if (!result) {
    return res.status(404).json({
      status: 'error',
      message: 'Result not found'
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Grade updated successfully',
    data: {
      result
    }
  });
});

// Delete result
export const deleteResult = asyncHandler(async (req, res) => {
  const result = await Result.findById(req.params.id);

  if (!result) {
    return res.status(404).json({
      status: 'error',
      message: 'Result not found'
    });
  }

  // Update corresponding registration status back to active
  await Registration.findOneAndUpdate(
    { studentId: result.studentId, courseId: result.courseId },
    { status: 'active' }
  );

  await Result.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: 'success',
    message: 'Grade deleted successfully'
  });
});

// Get results by student
export const getResultsByStudent = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  const results = await Result.find({ studentId })
    .populate('courseId', 'title code department credits')
    .sort({ assignedAt: -1 });

  // Calculate GPA
  const gpa = await Result.calculateStudentGPA(studentId);

  res.status(200).json({
    status: 'success',
    data: {
      results,
      gpa
    }
  });
});

// Get results by course
export const getResultsByCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const results = await Result.find({ courseId })
    .populate('studentId', 'name studentId email')
    .sort({ assignedAt: -1 });

  // Calculate course statistics
  const gradeDistribution = {};
  let totalGradePoints = 0;

  results.forEach(result => {
    gradeDistribution[result.grade] = (gradeDistribution[result.grade] || 0) + 1;
    totalGradePoints += result.gradePoints;
  });

  const averageGPA = results.length > 0 ? (totalGradePoints / results.length).toFixed(2) : 0;

  res.status(200).json({
    status: 'success',
    data: {
      results,
      statistics: {
        totalStudents: results.length,
        averageGPA,
        gradeDistribution
      }
    }
  });
});

// Bulk assign grades
export const bulkAssignGrades = asyncHandler(async (req, res) => {
  const { results: resultData } = req.body;

  if (!Array.isArray(resultData) || resultData.length === 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Results array is required'
    });
  }

  const createdResults = [];
  const errors = [];

  for (let i = 0; i < resultData.length; i++) {
    try {
      const data = resultData[i];
      
      // Verify registration exists
      const registration = await Registration.findOne({
        studentId: data.studentId,
        courseId: data.courseId,
        status: 'active'
      });

      if (!registration) {
        errors.push({
          index: i,
          data,
          error: 'Student not registered for this course'
        });
        continue;
      }

      // Check if result already exists
      const existingResult = await Result.findOne({
        studentId: data.studentId,
        courseId: data.courseId
      });

      if (existingResult) {
        errors.push({
          index: i,
          data,
          error: 'Grade already assigned'
        });
        continue;
      }

      const result = await Result.create({
        studentId: data.studentId,
        courseId: data.courseId,
        grade: data.grade.toUpperCase(),
        assignedBy: req.user._id,
        semester: data.semester,
        academicYear: data.academicYear,
        comments: data.comments
      });

      // Update registration status
      registration.status = 'completed';
      await registration.save();

      await result.populate('studentId', 'name studentId email');
      await result.populate('courseId', 'title code department');
      
      createdResults.push(result);
    } catch (error) {
      errors.push({
        index: i,
        data: resultData[i],
        error: error.message
      });
    }
  }

  res.status(201).json({
    status: 'success',
    message: `${createdResults.length} grades assigned successfully`,
    data: {
      results: createdResults,
      errors
    }
  });
});