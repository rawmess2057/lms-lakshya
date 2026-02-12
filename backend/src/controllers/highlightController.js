import asyncHandler from '../middleware/asyncHandler.js';
import Highlight from '../models/Highlight.js';

/**
 * @desc    Get enabled highlights (public)
 * @route   GET /api/highlights
 * @access  Public
 */
export const getHighlights = asyncHandler(async (req, res) => {
  const highlights = await Highlight.find({ isEnabled: true })
    .sort({ order: 1, createdAt: -1 });

  res.json({
    success: true,
    count: highlights.length,
    data: highlights,
  });
});

/**
 * @desc    Get all highlights (admin)
 * @route   GET /api/admin/highlights
 * @access  Private/Admin
 */
export const getAllHighlights = asyncHandler(async (req, res) => {
  const highlights = await Highlight.find()
    .sort({ order: 1, createdAt: -1 });

  res.json({
    success: true,
    count: highlights.length,
    data: highlights,
  });
});

/**
 * @desc    Create highlight
 * @route   POST /api/admin/highlights
 * @access  Private/Admin
 */
export const createHighlight = asyncHandler(async (req, res) => {
  const { title, icon, image, link, isEnabled, order, category } = req.body;

  if (!title) {
    return res.status(400).json({
      success: false,
      error: 'Please provide a title',
    });
  }

  const highlight = await Highlight.create({
    title,
    icon: icon || '',
    image: image || '',
    link: link || '',
    isEnabled: isEnabled !== undefined ? isEnabled : true,
    order: order !== undefined ? order : 0,
    category: category || '',
  });

  res.status(201).json({
    success: true,
    message: 'Highlight created successfully',
    data: highlight,
  });
});

/**
 * @desc    Update highlight
 * @route   PUT /api/admin/highlights/:id
 * @access  Private/Admin
 */
export const updateHighlight = asyncHandler(async (req, res) => {
  const { title, icon, image, link, isEnabled, order, category } = req.body;

  const highlight = await Highlight.findById(req.params.id);

  if (!highlight) {
    return res.status(404).json({
      success: false,
      error: 'Highlight not found',
    });
  }

  if (title !== undefined) highlight.title = title;
  if (icon !== undefined) highlight.icon = icon;
  if (image !== undefined) highlight.image = image;
  if (link !== undefined) highlight.link = link;
  if (isEnabled !== undefined) highlight.isEnabled = isEnabled;
  if (order !== undefined) highlight.order = order;
  if (category !== undefined) highlight.category = category;

  await highlight.save();

  res.json({
    success: true,
    message: 'Highlight updated successfully',
    data: highlight,
  });
});

/**
 * @desc    Delete highlight
 * @route   DELETE /api/admin/highlights/:id
 * @access  Private/Admin
 */
export const deleteHighlight = asyncHandler(async (req, res) => {
  const highlight = await Highlight.findById(req.params.id);

  if (!highlight) {
    return res.status(404).json({
      success: false,
      error: 'Highlight not found',
    });
  }

  await highlight.deleteOne();

  res.json({
    success: true,
    message: 'Highlight deleted successfully',
    data: {},
  });
});

/**
 * @desc    Toggle highlight enabled status
 * @route   PUT /api/admin/highlights/:id/toggle
 * @access  Private/Admin
 */
export const toggleHighlight = asyncHandler(async (req, res) => {
  const highlight = await Highlight.findById(req.params.id);

  if (!highlight) {
    return res.status(404).json({
      success: false,
      error: 'Highlight not found',
    });
  }

  highlight.isEnabled = !highlight.isEnabled;
  await highlight.save();

  res.json({
    success: true,
    message: `Highlight ${highlight.isEnabled ? 'enabled' : 'disabled'} successfully`,
    data: highlight,
  });
});

