import express from 'express';
import {
  getTeacherProfiles,
  getTeacherProfile,
  getAllTeacherProfiles,
  createTeacherProfile,
  updateTeacherProfile,
  deleteTeacherProfile,
} from '../controllers/teacherProfileController.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/roles.js';

const router = express.Router();

// Admin routes (must come before /:id to avoid route conflicts)
// Apply middleware to admin routes
router.get('/admin/all', protect, authorize('admin'), getAllTeacherProfiles);
router.post('/admin', protect, authorize('admin'), createTeacherProfile);
router.put('/admin/:id', protect, authorize('admin'), updateTeacherProfile);
router.delete('/admin/:id', protect, authorize('admin'), deleteTeacherProfile);

// Public routes (must come after admin routes)
router.get('/', getTeacherProfiles);
router.get('/:id', getTeacherProfile);

export default router;

