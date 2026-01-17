const mongoose = require('mongoose');

const loanApplySchema = new mongoose.Schema(
  {
    applicationId: {
      type: Number,
      unique: true,
      index: true
    },

    // Personal Information
    fullName: { type: String, required: true },
    dob: { type: Date, required: true },
    gender: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    studentId: { type: String },
    homeAddress: { type: String, required: true }, // ✅ ADD THIS
    // Academic Information
    program: { type: String, required: true },
    yearOfStudy: { type: String, required: true },

    // Loan Details
    loanTitle: { type: String, required: true },
    amount: { type: Number, required: true },
    purpose: { type: String, required: true },

    // Document URLs
    idDocumentUrl: String,
    schoolIdDocumentUrl: String,
    agreementDocumentUrl: String,

    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },

    signature: String,

    confirmAccurate: Boolean,
    agreeTerms: Boolean,
    understandRisk: Boolean,

    submissionDate: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

/**
 * AUTO-INCREMENT applicationId
 * Reuses deleted numbers
 */
loanApplySchema.pre('save', async function () {
  if (this.applicationId) return;

  const LoanApply = mongoose.model('LoanApply');
  const existingIds = await LoanApply.find({}, { applicationId: 1 }).lean();

  const usedIds = existingIds
    .map(d => d.applicationId)
    .filter(Boolean)
    .sort((a, b) => a - b);

  let newId = 1;
  for (const id of usedIds) {
    if (id === newId) newId++;
    else break;
  }

  this.applicationId = newId;
});

module.exports = mongoose.model('LoanApply', loanApplySchema);
