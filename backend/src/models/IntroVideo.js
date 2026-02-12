import mongoose from 'mongoose';

const introVideoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a video title'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    videoUrl: {
      type: String,
      default: '', // Optional - either videoUrl or bunnyVideoId must be provided
    },
    bunnyVideoId: {
      type: String,
      default: null, // Store Bunny Stream video GUID
    },
    type: {
      type: String,
      enum: ['global', 'course-preview'],
      required: [true, 'Please specify video type'],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      default: null,
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
introVideoSchema.index({ type: 1, isActive: 1 });
introVideoSchema.index({ course: 1, isActive: 1 });

const IntroVideo = mongoose.model('IntroVideo', introVideoSchema);

export default IntroVideo;

