import mongoose from 'mongoose';

const highlightSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
    },
    icon: {
      type: String,
      default: '',
      trim: true,
    },
    image: {
      type: String,
      default: '',
      trim: true,
    },
    link: {
      type: String,
      default: '',
      trim: true,
    },
    isEnabled: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      enum: ['announcement', 'result', 'event', 'update', ''],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
highlightSchema.index({ isEnabled: 1, order: 1 });

const Highlight = mongoose.model('Highlight', highlightSchema);

export default Highlight;

