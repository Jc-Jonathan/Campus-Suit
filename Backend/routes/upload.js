const express = require('express');
const multer = require('multer');
const cloudinary = require('../cloudinary');

const router = express.Router();

/**
 * Multer config
 * - memoryStorage (no local files)
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
});

/**
 * POST /api/upload
 * Upload PDF to Cloudinary
 */
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Convert buffer to base64
    const base64File = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    const result = await cloudinary.uploader.upload(base64File, {
      folder: 'notifications',
      resource_type: 'raw', // IMPORTANT for PDFs
      public_id: `notification_${Date.now()}`,
    });

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      fileUrl: result.secure_url,     // ✅ SAVE THIS IN MONGODB
      publicId: result.public_id,     // ✅ USE FOR DELETE
      originalName: req.file.originalname,
    });

  } catch (error) {
    console.error('Cloudinary upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: error.message,
    });
  }
});

module.exports = router;
