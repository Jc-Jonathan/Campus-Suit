const mongoose = require('mongoose');

const LoanSchema = new mongoose.Schema(
  {
    loanId: {
      type: Number,
      unique: true,
      required: true,
    },

    title: { type: String, required: true },
    description: { type: String, required: true },

    minAmount: { type: Number, required: true },
    maxAmount: { type: Number, required: true },
    interestRate: { type: Number, required: true },

    repaymentPeriod: { type: String, required: true },

    eligibility: String,
    requiredDocuments: String,
    applicationDeadline: String,
    processingTime: String,
    benefits: String,

    status: {
      type: String,
      enum: ['active', 'closed'],
      default: 'active',
    },

    // ✅ CLOUDINARY FIELDS
    documentUrl: {
      type: String,
      default: '',
    },
    documentPublicId: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Loan', LoanSchema);
