import express from 'express';
import { getHighlights } from '../controllers/highlightController.js';

const router = express.Router();

// Public route
router.get('/', getHighlights);

export default router;

