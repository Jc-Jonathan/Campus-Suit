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
    // Allow both PDFs and images for products
    if (file.mimetype === 'application/pdf' || 
        file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and image files are allowed'), false);
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
      folder: 'Addloan',
      resource_type: 'raw', // IMPORTANT for PDFs
      public_id: `loan_${Date.now()}`,
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

/**
 * POST /api/upload/product
 * Upload Product Image to Cloudinary
 */
router.post('/product', upload.single('file'), async (req, res) => {
  try {
    console.log('📤 Product upload request received');
    console.log('📁 File info:', {
      originalname: req.file?.originalname,
      mimetype: req.file?.mimetype,
      size: req.file?.size
    });

    if (!req.file) {
      console.log('❌ No file in request');
      return res.status(400).json({ 
        success: false,
        message: 'No file uploaded' 
      });
    }

    // Convert buffer to base64
    const base64File = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    console.log('📤 Uploading to Cloudinary folder: products');

    const result = await cloudinary.uploader.upload(base64File, {
      folder: 'products',
      resource_type: 'image', // IMPORTANT for images
      public_id: `product_${Date.now()}`,
    });

    console.log('✅ Product image uploaded to Cloudinary:', result.secure_url);
    console.log('🆔 Public ID:', result.public_id);

    const responseData = {
      success: true,
      message: 'Product image uploaded successfully',
      fileUrl: result.secure_url,     // ✅ SAVE THIS IN MONGODB
      publicId: result.public_id,     // ✅ USE FOR DELETE
      originalName: req.file.originalname,
    };

    console.log('📤 Sending response:', responseData);

    res.status(200).json(responseData);

  } catch (error) {
    console.error('❌ Cloudinary upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Product image upload failed',
      error: error.message,
    });
  }
});

/**
 * POST /api/upload/paymentproof
 * Upload Payment Proof to Cloudinary
 */
router.post('/paymentproof', upload.single('file'), async (req, res) => {
  try {
    console.log('📤 Payment proof upload request received');
    console.log('📁 File info:', {
      originalname: req.file?.originalname,
      mimetype: req.file?.mimetype,
      size: req.file?.size
    });

    if (!req.file) {
      console.log('❌ No file in request');
      return res.status(400).json({ 
        success: false,
        message: 'No file uploaded' 
      });
    }

    // Convert buffer to base64
    const base64File = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    console.log('📤 Uploading to Cloudinary folder: paymentproof');

    const result = await cloudinary.uploader.upload(base64File, {
      folder: 'paymentproof',
      resource_type: 'image', // IMPORTANT for images
      public_id: `payment_${Date.now()}`,
    });

    console.log('✅ Payment proof uploaded to Cloudinary:', result.secure_url);
    console.log('🆔 Public ID:', result.public_id);

    const responseData = {
      success: true,
      message: 'Payment proof uploaded successfully',
      fileUrl: result.secure_url,     // ✅ SAVE THIS IN MONGODB
      publicId: result.public_id,     // ✅ USE FOR DELETE
      originalName: req.file.originalname,
    };

    console.log('📤 Sending response:', responseData);

    res.status(200).json(responseData);

  } catch (error) {
    console.error('❌ Cloudinary upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment proof upload failed',
      error: error.message,
    });
  }
});

module.exports = router;
