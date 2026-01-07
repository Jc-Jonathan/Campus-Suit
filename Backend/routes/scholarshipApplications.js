const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const ScholarshipApplication = require('../models/ScholarshipApplication');

// Ensure uploads folder exists
const uploadPath = path.join(__dirname, '../uploads/documents');

// Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// POST — submit scholarship application
router.post(
  '/',
  upload.fields([
    { name: 'nationalId', maxCount: 1 },
    { name: 'transcript', maxCount: 1 },
    { name: 'recommendation', maxCount: 1 },
    { name: 'enrollmentProof', maxCount: 1 },
    { name: 'other', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const files = req.files || {};

      const application = new ScholarshipApplication({
        ...req.body,
        documents: {
          nationalId: files.nationalId?.[0]?.path || '',
          transcript: files.transcript?.[0]?.path || '',
          recommendation: files.recommendation?.[0]?.path || '',
          enrollmentProof: files.enrollmentProof?.[0]?.path || '',
          other: files.other?.[0]?.path || '',
        },
      });

      await application.save();

      res.status(201).json({
        message: 'Scholarship application submitted successfully',
        application,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;
