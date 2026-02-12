import mongoose from 'mongoose';

const counsellingLeadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Please add a phone number'],
      trim: true,
    },
    institution: {
      type: String,
      required: [true, 'Please add an institution'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'contacted', 'completed'],
      default: 'pending',
    },
    notes: {
      type: String,
      default: '',
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

const CounsellingLead = mongoose.model('CounsellingLead', counsellingLeadSchema);

export default CounsellingLead;

