import asyncHandler from '../middleware/asyncHandler.js';
import CounsellingLead from '../models/CounsellingLead.js';
import User from '../models/User.js';
import { sendAdminCounsellingRequestNotification } from '../utils/emailService.js';

/**
 * @desc    Submit counselling lead
 * @route   POST /api/counselling/submit
 * @access  Public
 */
export const submitCounsellingLead = asyncHandler(async (req, res) => {
  const { name, phone, institution } = req.body;

  if (!name || !phone || !institution) {
    return res.status(400).json({
      success: false,
      error: 'Please provide name, phone, and institution',
    });
  }

  const lead = await CounsellingLead.create({
    name,
    phone,
    institution,
    status: 'pending',
  });

  // Send admin notification for new counselling request (non-blocking)
  User.find({ role: 'admin', isActive: true })
    .select('email')
    .then((admins) => {
      if (admins.length === 0) {
        console.log('ℹ️  [COUNSELLING] No admin users found to notify about new counselling request');
        return;
      }
      console.log(`📧 [COUNSELLING] Notifying ${admins.length} admin(s) about new counselling request`);
      
      admins.forEach((admin) => {
        sendAdminCounsellingRequestNotification(admin.email, lead)
          .then((result) => {
            if (result.success) {
              console.log(`✅ [COUNSELLING] Admin notification sent successfully to ${admin.email}`);
            } else {
              console.error(`❌ [COUNSELLING] Failed to send admin notification to ${admin.email}: ${result.error}`);
            }
          })
          .catch((error) => {
            console.error(`❌ [COUNSELLING] Error sending admin notification to ${admin.email}:`, error);
          });
      });
    })
    .catch((error) => {
      console.error('❌ [COUNSELLING] Error fetching admin emails:', error);
    });

  res.status(201).json({
    success: true,
    message: 'Counselling request submitted successfully',
    data: lead,
  });
});

/**
 * @desc    Get all counselling leads
 * @route   GET /api/counselling/leads
 * @access  Private/Admin
 */
export const getCounsellingLeads = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 50 } = req.query;

  const query = {};
  if (status) {
    query.status = status;
  }

  const leads = await CounsellingLead.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await CounsellingLead.countDocuments(query);

  res.json({
    success: true,
    count: leads.length,
    total,
    data: leads,
  });
});

/**
 * @desc    Update counselling lead
 * @route   PUT /api/counselling/leads/:id
 * @access  Private/Admin
 */
export const updateCounsellingLead = asyncHandler(async (req, res) => {
  const { status, notes } = req.body;

  const lead = await CounsellingLead.findById(req.params.id);

  if (!lead) {
    return res.status(404).json({
      success: false,
      error: 'Counselling lead not found',
    });
  }

  if (status !== undefined) {
    // Validate status is one of the allowed enum values
    const validStatuses = ['pending', 'contacted', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }
    lead.status = status;
  }
  if (notes !== undefined) {
    lead.notes = notes;
  }

  await lead.save();

  res.json({
    success: true,
    message: 'Counselling lead updated successfully',
    data: lead,
  });
});

