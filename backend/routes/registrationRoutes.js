import express from 'express';
import {
  getRegistrations,
  getRegistration,
  createRegistration,
  updateRegistration,
  deleteRegistration,
  getRegistrationsByStudent,
  getRegistrationsByCourse,
  bulkRegisterStudents
} from '../controllers/registrationController.js';
import {
  validateRegistration,
  validateObjectId,
  validateSearchQuery
} from '../middleware/validation.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// All registration routes require admin authentication
router.use(authenticate);
router.use(requireAdmin);

// Registration CRUD routes
router.get('/', validateSearchQuery, getRegistrations);
router.get('/:id', validateObjectId, getRegistration);
router.post('/', validateRegistration, createRegistration);
router.put('/:id', validateObjectId, updateRegistration);
router.delete('/:id', validateObjectId, deleteRegistration);

// Specialized routes
router.get('/student/:studentId', validateObjectId, getRegistrationsByStudent);
router.get('/course/:courseId', validateObjectId, getRegistrationsByCourse);
router.post('/bulk', bulkRegisterStudents);

export default router;