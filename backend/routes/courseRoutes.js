import express from 'express';
import {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseStats
} from '../controllers/courseController.js';
import {
  validateCourseCreation,
  validateCourseUpdate,
  validateObjectId,
  validateSearchQuery
} from '../middleware/validation.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes (with optional authentication for context)
router.get('/', validateSearchQuery, getCourses);
router.get('/:id', validateObjectId, getCourse);
router.get('/:id/stats', validateObjectId, getCourseStats);

// Protected admin routes
router.use(authenticate);
router.use(requireAdmin);

router.post('/', validateCourseCreation, createCourse);
router.put('/:id', validateObjectId, validateCourseUpdate, updateCourse);
router.delete('/:id', validateObjectId, deleteCourse);

export default router;