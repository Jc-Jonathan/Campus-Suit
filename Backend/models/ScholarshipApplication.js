const mongoose = require('mongoose');

const ScholarshipApplicationSchema = new mongoose.Schema(
  {
    applicationId: {
      type: Number,
      required: true,
      unique: true,
    },

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
    scholarshipId: {
      type: String,
      required: true,
    },
    scholarshipTitle: {
      type: String,
      required: true,
    },
    //User
     user: {
   type: mongoose.Schema.Types.ObjectId,
   ref: 'User',
     },

     approvedUser: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
     },


    // Application status
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },

    // Document URLs
    nationalIdUrl: String,
    transcriptUrl: String,
    recommendationUrl: String,
    enrollmentProofUrl: String,
    otherDocumentUrl: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  'ScholarshipApplication',
  ScholarshipApplicationSchema
);
