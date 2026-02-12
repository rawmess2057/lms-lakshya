import mongoose from 'mongoose';

const teacherProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      default: null,
    },
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      trim: true,
    },
    profilePicture: {
      type: String,
      default: '',
    },
    specialization: {
      type: String,
      required: [true, 'Please add specialization'],
      trim: true,
    },
    experience: {
      type: Number,
      required: [true, 'Please add experience in years'],
      min: 0,
    },
    bio: {
      type: String,
      default: '',
      maxlength: 500,
    },
    qualifications: {
      type: String,
      default: '',
    },
    achievements: {
      type: String,
      default: '',
    },
    socialLinks: {
      linkedin: {
        type: String,
        default: '',
      },
      twitter: {
        type: String,
        default: '',
      },
      website: {
        type: String,
        default: '',
      },
    },
    isFeatured: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
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

const TeacherProfile = mongoose.model('TeacherProfile', teacherProfileSchema);

export default TeacherProfile;

