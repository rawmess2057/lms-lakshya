import express from 'express';
import {
  submitCounsellingLead,
  getCounsellingLeads,
  updateCounsellingLead,
} from '../controllers/counsellingController.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/roles.js';

const router = express.Router();

// Public route
router.post('/submit', submitCounsellingLead);

// Admin routes
router.get('/leads', protect, authorize('admin'), getCounsellingLeads);
router.put('/leads/:id', protect, authorize('admin'), updateCounsellingLead);

export default router;

