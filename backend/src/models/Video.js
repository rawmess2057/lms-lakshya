import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema(
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
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Please add a course'],
    },
    videoUrl: {
      type: String,
      default: '', // Optional - either videoUrl or bunnyVideoId must be provided
    },
    bunnyVideoId: {
      type: String,
      default: null, // Store Bunny Stream video GUID
    },
    videoSource: {
      type: String,
      enum: ['youtube', 'vimeo', 'drive', 'bunny', 'external', 'other'],
      default: 'external',
    },
    duration: {
      type: Number, // in seconds
      default: 0,
    },
    order: {
      type: Number,
      default: 0,
    },
    isPreview: {
      type: Boolean,
      default: false,
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

const Video = mongoose.model('Video', videoSchema);

export default Video;

