import express from 'express';
import {
  getSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject,
} from '../controllers/subjectController.js';
import upload from '../middleware/upload.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/roles.js';

const router = express.Router();

router.get('/', getSubjects);
router.get('/:id', getSubject);
router.post('/', protect, authorize('admin'), upload.single('image'), createSubject);
router.put('/:id', protect, authorize('admin'), upload.single('image'), updateSubject);
router.delete('/:id', protect, authorize('admin'), deleteSubject);

export default router;

