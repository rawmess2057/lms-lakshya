import mongoose from 'mongoose';

const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, 'Please add a question'],
      trim: true,
    },
    answer: {
      type: String,
      required: [true, 'Please add an answer'],
    },
    category: {
      type: String,
      enum: ['civil-engineering', 'license-exams', 'tuition'],
      required: [true, 'Please select a category'],
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const FAQ = mongoose.model('FAQ', faqSchema);

export default FAQ;
