import { body, param, query, validationResult } from 'express-validator';

// Handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  
  next();
};

// Admin validation rules
export const validateAdminRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  handleValidationErrors
];

export const validateAdminLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Student validation rules
export const validateStudentCreation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('studentId')
    .matches(/^S\d{5}$/)
    .withMessage('Student ID must be in format S12345'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  handleValidationErrors
];

export const validateStudentUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  handleValidationErrors
];

export const validateStudentLogin = [
  body('studentId')
    .matches(/^S\d{5}$/)
    .withMessage('Student ID must be in format S12345'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Course validation rules
export const validateCourseCreation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Course title must be between 3 and 200 characters'),
  body('code')
    .matches(/^[A-Z]{2,4}\d{3}$/)
    .withMessage('Course code must be in format like CS101, MATH201'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('credits')
    .optional()
    .isInt({ min: 1, max: 6 })
    .withMessage('Credits must be between 1 and 6'),
  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Department name cannot exceed 100 characters'),
  body('maxEnrollment')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Maximum enrollment must be at least 1'),
  handleValidationErrors
];

export const validateCourseUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Course title must be between 3 and 200 characters'),
  body('code')
    .optional()
    .matches(/^[A-Z]{2,4}\d{3}$/)
    .withMessage('Course code must be in format like CS101, MATH201'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('credits')
    .optional()
    .isInt({ min: 1, max: 6 })
    .withMessage('Credits must be between 1 and 6'),
  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Department name cannot exceed 100 characters'),
  body('maxEnrollment')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Maximum enrollment must be at least 1'),
  handleValidationErrors
];

// Registration validation rules
export const validateRegistration = [
  body('studentId')
    .isMongoId()
    .withMessage('Invalid student ID'),
  body('courseId')
    .isMongoId()
    .withMessage('Invalid course ID'),
  body('semester')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Semester cannot exceed 20 characters'),
  body('academicYear')
    .optional()
    .matches(/^\d{4}-\d{4}$/)
    .withMessage('Academic year must be in format YYYY-YYYY'),
  handleValidationErrors
];

// Result validation rules
export const validateResultCreation = [
  body('studentId')
    .isMongoId()
    .withMessage('Invalid student ID'),
  body('courseId')
    .isMongoId()
    .withMessage('Invalid course ID'),
  body('grade')
    .isIn(['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'])
    .withMessage('Invalid grade. Must be one of: A+, A, A-, B+, B, B-, C+, C, C-, D+, D, F'),
  body('semester')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Semester cannot exceed 20 characters'),
  body('academicYear')
    .optional()
    .matches(/^\d{4}-\d{4}$/)
    .withMessage('Academic year must be in format YYYY-YYYY'),
  body('comments')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comments cannot exceed 500 characters'),
  handleValidationErrors
];

export const validateResultUpdate = [
  body('grade')
    .optional()
    .isIn(['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'])
    .withMessage('Invalid grade. Must be one of: A+, A, A-, B+, B, B-, C+, C, C-, D+, D, F'),
  body('semester')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Semester cannot exceed 20 characters'),
  body('academicYear')
    .optional()
    .matches(/^\d{4}-\d{4}$/)
    .withMessage('Academic year must be in format YYYY-YYYY'),
  body('comments')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comments cannot exceed 500 characters'),
  handleValidationErrors
];

// Parameter validation
export const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  handleValidationErrors
];

// Query validation
export const validateSearchQuery = [
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search query cannot exceed 100 characters'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];