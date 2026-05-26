import asyncHandler from '../middleware/asyncHandler.js';
import FAQ from '../models/FAQ.js';

export const getFAQs = asyncHandler(async (req, res) => {
  const { category } = req.query;
  const filter = { isPublished: true };
  if (category) {
    filter.category = category;
  }
  const faqs = await FAQ.find(filter).sort({ order: 1, createdAt: -1 });

  res.json({
    success: true,
    count: faqs.length,
    data: faqs,
  });
});

export const getAllFAQs = asyncHandler(async (req, res) => {
  const faqs = await FAQ.find().sort({ order: 1, createdAt: -1 });

  res.json({
    success: true,
    count: faqs.length,
    data: faqs,
  });
});

export const createFAQ = asyncHandler(async (req, res) => {
  const { question, answer, category, isPublished, order } = req.body;

  if (!question || !answer || !category) {
    return res.status(400).json({
      success: false,
      error: 'Please provide question, answer, and category',
    });
  }

  const validCategories = ['civil-engineering', 'license-exams', 'tuition'];
  if (!validCategories.includes(category)) {
    return res.status(400).json({
      success: false,
      error: `Invalid category. Must be one of: ${validCategories.join(', ')}`,
    });
  }

  const faq = await FAQ.create({
    question,
    answer,
    category,
    isPublished: isPublished !== undefined ? isPublished : true,
    order: order !== undefined ? order : 0,
  });

  res.status(201).json({
    success: true,
    message: 'FAQ created successfully',
    data: faq,
  });
});

export const updateFAQ = asyncHandler(async (req, res) => {
  const { question, answer, category, isPublished, order } = req.body;

  const faq = await FAQ.findById(req.params.id);

  if (!faq) {
    return res.status(404).json({
      success: false,
      error: 'FAQ not found',
    });
  }

  if (question !== undefined) faq.question = question;
  if (answer !== undefined) faq.answer = answer;
  if (category !== undefined) {
    const validCategories = ['civil-engineering', 'license-exams', 'tuition'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        error: `Invalid category. Must be one of: ${validCategories.join(', ')}`,
      });
    }
    faq.category = category;
  }
  if (isPublished !== undefined) faq.isPublished = isPublished;
  if (order !== undefined) faq.order = order;

  await faq.save();

  res.json({
    success: true,
    message: 'FAQ updated successfully',
    data: faq,
  });
});

export const deleteFAQ = asyncHandler(async (req, res) => {
  const faq = await FAQ.findById(req.params.id);

  if (!faq) {
    return res.status(404).json({
      success: false,
      error: 'FAQ not found',
    });
  }

  await faq.deleteOne();

  res.json({
    success: true,
    message: 'FAQ deleted successfully',
    data: {},
  });
});

export const toggleFAQ = asyncHandler(async (req, res) => {
  const faq = await FAQ.findById(req.params.id);

  if (!faq) {
    return res.status(404).json({
      success: false,
      error: 'FAQ not found',
    });
  }

  faq.isPublished = !faq.isPublished;
  await faq.save();

  res.json({
    success: true,
    message: `FAQ ${faq.isPublished ? 'published' : 'unpublished'} successfully`,
    data: faq,
  });
});
