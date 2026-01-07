const mongoose = require('mongoose');

const ScholarshipApplicationSchema = new mongoose.Schema(
  {
    // Applicant Information
    fullName: String,
    dob: String,
    country: String,
    countryCode: String,
    phoneLocal: String,
    gender: String,
    email: String,
    address: String,

    // Academic Information
    studentId: String,
    institution: String,
    program: String,
    yearOfStudy: String,
    expectedGraduation: String,
    gpa: String,

    // Scholarship Details
    scholarshipName: String,
    appliedBefore: String,
    reason: String,
    financialNeed: String,

    // Documents (file paths)
    documents: {
      nationalId: String,
      transcript: String,
      recommendation: String,
      enrollmentProof: String,
      other: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  'ScholarshipApplication',
  ScholarshipApplicationSchema
);
