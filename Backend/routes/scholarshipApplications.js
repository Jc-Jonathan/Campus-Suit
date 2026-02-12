const express = require('express');
const router = express.Router();
const ScholarshipApplication = require('../models/ScholarshipApplication');
const sendEmail = require('../utils/sendEmail');

/* =========================
   HELPER FUNCTION
========================= */
async function getNextApplicationId() {
  const apps = await ScholarshipApplication
    .find({}, { applicationId: 1, _id: 0 })
    .sort({ applicationId: 1 });

  let expectedId = 1;

  for (const app of apps) {
    if (app.applicationId !== expectedId) {
      return expectedId;
    }
    expectedId++;
  }

  return expectedId;
}

/* =========================
   GET ALL APPLICATIONS
========================= */
router.get('/', async (req, res) => {
  try {
    const applications = await ScholarshipApplication
      .find()
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

/* =========================
   GET SINGLE APPLICATION
========================= */
router.get('/:id', async (req, res) => {
  try {
    const application = await ScholarshipApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.json(application);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

/* =========================
   UPDATE STATUS + SEND EMAIL
========================= */
router.patch('/:id/status', async (req, res) => {
  const { status } = req.body;

  try {
    const app = await ScholarshipApplication.findById(req.params.id);

    if (!app) {
      return res.status(404).json({ message: 'Application not found' });
    }

    app.status = status;
    const User = require('../models/user');

if (status === 'approved') {
  const user = await User.findOne({ email: app.email });

  if (!user) {
    console.warn('Approved applicant has no user account:', app.email);
  }

  app.approvedUser = user ? user._id : null;
}

    await app.save();

    let subject = '';
    let message = '';

    if (status === 'approved') {
      subject = 'Scholarship Application Approved 🎉';
      message = `
Dear ${app.fullName},

Congratulations! 🎉

Your application for the scholarship "${app.scholarshipTitle}" has been APPROVED.

We will contact you with the next steps shortly.

Best regards,
Scholarship Program foundation
`;
    }

    if (status === 'rejected') {
      subject = 'Scholarship Application Update';
      message = `
Dear ${app.fullName},

Thank you for applying for the scholarship "${app.scholarshipTitle}".

After careful review, we regret to inform you that your application was NOT successful.

We encourage you to apply again in the future.

Best wishes,
Scholarship Program foundation
`;
    }

    // SEND EMAIL
    await sendEmail(app.email, subject, message);

    res.json({
      message: 'Status updated successfully and email sent',
      application: app,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* =========================
   DELETE APPLICATION
========================= */
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await ScholarshipApplication.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.json({ message: 'Application deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

/* =========================
   CREATE APPLICATION
========================= */
const multer = require('multer');

// Configure multer to handle FormData without file storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

router.post('/', upload.none(), async (req, res) => {
  try {
    const nextId = await getNextApplicationId();

    console.log('📝 Received form data:', {
      scholarshipId: req.body.scholarshipId,
      scholarshipTitle: req.body.scholarshipTitle,
      fullName: req.body.fullName,
      email: req.body.email,
      documentsCount: [
        req.body.nationalIdUrl ? 'National ID' : null,
        req.body.transcriptUrl ? 'Transcript' : null,
        req.body.recommendationUrl ? 'Recommendation' : null,
        req.body.enrollmentProofUrl ? 'Enrollment Proof' : null,
        req.body.otherUrl ? 'Other' : null,
      ].filter(Boolean).length
    });

    const application = new ScholarshipApplication({
      applicationId: nextId,

      // ✅ Scholarship details (REQUIRED)
      scholarshipId: req.body.scholarshipId || '',
      scholarshipTitle: req.body.scholarshipTitle || '',

      // ✅ Applicant Information
      fullName: req.body.fullName || '',
      dob: req.body.dob || '',
      country: req.body.country || '',
      countryCode: req.body.countryCode || '',
      phoneLocal: req.body.phoneLocal || '',
      gender: req.body.gender || '',
      email: req.body.email || '',
      address: req.body.address || '',

      // ✅ Academic Information
      studentId: req.body.studentId || '',
      institution: req.body.institution || '',
      program: req.body.program || '',
      yearOfStudy: req.body.yearOfStudy || '',
      expectedGraduation: req.body.expectedGraduation || '',
      gpa: req.body.gpa || '',

      // ✅ Cloudinary Document URLs and Public IDs
      nationalIdUrl: req.body.nationalIdUrl || '',
      nationalIdPublicId: req.body.nationalIdPublicId || '',
      transcriptUrl: req.body.transcriptUrl || '',
      transcriptPublicId: req.body.transcriptPublicId || '',
      recommendationUrl: req.body.recommendationUrl || '',
      recommendationPublicId: req.body.recommendationPublicId || '',
      enrollmentProofUrl: req.body.enrollmentProofUrl || '',
      enrollmentProofPublicId: req.body.enrollmentProofPublicId || '',
      otherDocumentUrl: req.body.otherUrl || '',
      otherDocumentPublicId: req.body.otherPublicId || '',
    });

    await application.save();

    console.log('✅ Scholarship application created with Cloudinary URLs:', {
      applicationId: nextId,
      email: req.body.email,
      documentsCount: [
        req.body.nationalIdUrl ? 'National ID' : null,
        req.body.transcriptUrl ? 'Transcript' : null,
        req.body.recommendationUrl ? 'Recommendation' : null,
        req.body.enrollmentProofUrl ? 'Enrollment Proof' : null,
        req.body.otherUrl ? 'Other' : null,
      ].filter(Boolean).length
    });

    res.status(201).json({
      message: 'Scholarship application submitted successfully',
      application,
    });
  } catch (error) {
    console.error('❌ Error creating scholarship application:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
