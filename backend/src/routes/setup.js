/**
 * One-time Admin Setup Route
 * This allows creating an admin user via API call
 * Should be disabled after first admin is created
 */

import express from 'express';
import User from '../models/User.js';
import asyncHandler from '../middleware/asyncHandler.js';

const router = express.Router();

/**
 * @desc    Create initial admin user (one-time setup)
 * @route   POST /api/setup/create-admin
 * @access  Public (should be disabled after use)
 */
router.post(
  '/create-admin',
  asyncHandler(async (req, res) => {
    const { email, password, secret } = req.body;

    // Simple secret check (change this secret or remove this route after use)
    if (secret !== 'SETUP_SECRET_2026') {
      return res.status(401).json({
        success: false,
        error: 'Invalid setup secret',
      });
    }

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password',
      });
    }

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: email.toLowerCase().trim() });
    
    if (existingAdmin) {
      // Update existing admin
      existingAdmin.password = password;
      existingAdmin.role = 'admin';
      existingAdmin.isActive = true;
      await existingAdmin.save();

      return res.json({
        success: true,
        message: 'Admin user updated successfully',
        data: {
          email: existingAdmin.email,
          role: existingAdmin.role,
        },
      });
    }

    // Create new admin
    const admin = await User.create({
      name: 'Admin User',
      email: email.toLowerCase().trim(),
      password: password,
      role: 'admin',
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      data: {
        email: admin.email,
        role: admin.role,
      },
    });
  })
);

export default router;








