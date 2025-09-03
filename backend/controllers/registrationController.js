import Registration from '../models/Registration.js';
import Student from '../models/Student.js';
import Course from '../models/Course.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// Get all registrations with optional filtering and pagination
export const getRegistrations = asyncHandler(async (req, res) => {
  const { search, studentId, courseId, status, page = 1, limit = 10 } = req.query;
  
  // Build query
  const query = {};
  
  if (studentId) query.studentId = studentId;
  if (courseId) query.courseId = courseId;
  if (status) query.status = status;

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  // Execute query with population
  let registrationsQuery = Registration.find(query)
    .populate('studentId', 'name studentId email')
    .populate('courseId', 'title code department')
    .sort({ registrationDate: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  // Add search filter if provided
  if (search) {
    registrationsQuery = Registration.aggregate([
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
            { 'course.code': { $regex: search, $options: 'i' } }
          ]
        }
      },
      { $sort: { registrationDate: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) }
    ]);
  }

  const registrations = await registrationsQuery;

  // Get total count for pagination
  const total = await Registration.countDocuments(query);
  
  res.status(200).json({
    status: 'success',
    data: {
      registrations,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    }
  });
});

// Get single registration by ID
export const getRegistration = asyncHandler(async (req, res) => {
  const registration = await Registration.findById(req.params.id)
    .populate('studentId', 'name studentId email')
    .populate('courseId', 'title code department');

  if (!registration) {
    return res.status(404).json({
      status: 'error',
      message: 'Registration not found'
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      registration
    }
  });
});

// Create new registration
export const createRegistration = asyncHandler(async (req, res) => {
  const { studentId, courseId, semester, academicYear } = req.body;

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

  // Check if student is already registered for this course
  const existingRegistration = await Registration.findOne({
    studentId,
    courseId,
    status: 'active'
  });

  if (existingRegistration) {
    return res.status(400).json({
      status: 'error',
      message: 'Student is already registered for this course'
    });
  }

  // Check if course is full
  const isFull = await course.isFull();
  if (isFull) {
    return res.status(400).json({
      status: 'error',
      message: 'Course is full'
    });
  }

  const registration = await Registration.create({
    studentId,
    courseId,
    semester,
    academicYear
  });

  // Populate the registration before sending response
  await registration.populate('studentId', 'name studentId email');
  await registration.populate('courseId', 'title code department');

  res.status(201).json({
    status: 'success',
    message: 'Student registered successfully',
    data: {
      registration
    }
  });
});

// Update registration status
export const updateRegistration = asyncHandler(async (req, res) => {
  const { status, semester, academicYear } = req.body;

  const updateData = {};
  if (status) updateData.status = status;
  if (semester) updateData.semester = semester;
  if (academicYear) updateData.academicYear = academicYear;

  const registration = await Registration.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  )
    .populate('studentId', 'name studentId email')
    .populate('courseId', 'title code department');

  if (!registration) {
    return res.status(404).json({
      status: 'error',
      message: 'Registration not found'
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Registration updated successfully',
    data: {
      registration
    }
  });
});

// Delete registration (deregister student)
export const deleteRegistration = asyncHandler(async (req, res) => {
  const registration = await Registration.findById(req.params.id);

  if (!registration) {
    return res.status(404).json({
      status: 'error',
      message: 'Registration not found'
    });
  }

  // Check if student has results for this course
  const hasResults = await Result.findOne({
    studentId: registration.studentId,
    courseId: registration.courseId
  });

  if (hasResults) {
    return res.status(400).json({
      status: 'error',
      message: 'Cannot deregister student who has grades assigned for this course'
    });
  }

  await Registration.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: 'success',
    message: 'Student deregistered successfully'
  });
});

// Get registrations by student
export const getRegistrationsByStudent = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  const registrations = await Registration.find({ studentId })
    .populate('courseId', 'title code department credits')
    .sort({ registrationDate: -1 });

  res.status(200).json({
    status: 'success',
    data: {
      registrations
    }
  });
});

// Get registrations by course
export const getRegistrationsByCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const registrations = await Registration.find({ courseId })
    .populate('studentId', 'name studentId email')
    .sort({ registrationDate: -1 });

  res.status(200).json({
    status: 'success',
    data: {
      registrations
    }
  });
});

// Bulk register students for a course
export const bulkRegisterStudents = asyncHandler(async (req, res) => {
  const { courseId, studentIds, semester, academicYear } = req.body;

  if (!Array.isArray(studentIds) || studentIds.length === 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Student IDs array is required'
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

  const registrations = [];
  const errors = [];

  for (let i = 0; i < studentIds.length; i++) {
    try {
      const studentId = studentIds[i];
      
      // Check if student exists
      const student = await Student.findById(studentId);
      if (!student || !student.isActive) {
        errors.push({
          studentId,
          error: 'Student not found'
        });
        continue;
      }

      // Check if already registered
      const existingRegistration = await Registration.findOne({
        studentId,
        courseId,
        status: 'active'
      });

      if (existingRegistration) {
        errors.push({
          studentId,
          error: 'Student already registered for this course'
        });
        continue;
      }

      const registration = await Registration.create({
        studentId,
        courseId,
        semester,
        academicYear
      });

      await registration.populate('studentId', 'name studentId email');
      registrations.push(registration);
    } catch (error) {
      errors.push({
        studentId: studentIds[i],
        error: error.message
      });
    }
  }

  res.status(201).json({
    status: 'success',
    message: `${registrations.length} students registered successfully`,
    data: {
      registrations,
      errors
    }
  });
});