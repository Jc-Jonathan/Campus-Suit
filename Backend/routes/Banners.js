// Backend/routes/Banners.js
const express = require('express');
const multer = require('multer');
const cloudinary = require('../cloudinary');
const router = express.Router();
const Banner = require('../models/Banner');

// ✅ NEW: Multer config for banner uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB for banner images
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// ✅ NEW: Upload banner image to Cloudinary
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    console.log('📤 Banner Upload Request Received');
    console.log('File info:', req.file ? {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    } : 'No file');

    if (!req.file) {
      console.log('❌ No file uploaded');
      return res.status(400).json({ message: 'No image uploaded' });
    }

    // Convert buffer to base64
    const base64File = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    console.log('📤 Uploading to Cloudinary...');

    const result = await cloudinary.uploader.upload(base64File, {
      folder: 'banners',
      resource_type: 'image',
      public_id: `banner_${Date.now()}`,
      transformation: [
        { width: 1200, height: 400, crop: 'fill' }, // Optimize for banner size
      ]
    });

    console.log('✅ Cloudinary Upload Success:', {
      publicId: result.public_id,
      url: result.secure_url,
      folder: result.folder
    });

    res.status(200).json({
      success: true,
      message: 'Banner image uploaded successfully',
      imageUrl: result.secure_url,     // ✅ SAVE THIS IN MONGODB
      publicId: result.public_id,     // ✅ USE FOR DELETE
      originalName: req.file.originalname,
    });

  } catch (error) {
    console.error('❌ Cloudinary banner upload error:', error);
    console.error('Full error details:', JSON.stringify(error, null, 2));
    res.status(500).json({
      success: false,
      message: 'Banner upload failed',
      error: error.message,
    });
  }
});

// POST /api/banners
router.post('/', async (req, res) => {
  try {
    const { imageUrl, publicId, screen, position, priority = 1, isActive = true } = req.body;

    if (!imageUrl || !screen || !position) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: imageUrl, screen, and position are required'
      });
    }

    // ✅ DUPLICATE CHECK (screen + position + priority)
    const existingBanner = await Banner.findOne({
      screen: screen.toUpperCase(),
      position: position.toUpperCase(),
      priority: Number(priority),
    });

    if (existingBanner) {
      return res.status(409).json({
        success: false,
        message:
          'Banner already exists for this screen, position, and priority. Please delete it first.',
      });
    }

    const banner = new Banner({
      imageUrl,
      publicId, // ✅ SAVE CLOUDINARY PUBLIC_ID
      screen: screen.toUpperCase(),
      position: position.toUpperCase(),
      priority: Number(priority),
      isActive: isActive !== false,
    });

    await banner.save();

    res.status(201).json({
      success: true,
      data: banner
    });
  } catch (err) {
    console.error('Banner create error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to create banner',
      error: err.message
    });
  }
});

// GET /api/banners
router.get('/', async (req, res) => {
  try {
    const { screen, position, admin } = req.query;

    const query = {};
    if (!admin) query.isActive = true;
    if (screen) query.screen = screen.toUpperCase();
    if (position) query.position = position.toUpperCase();

    const banners = await Banner.find(query)
      .sort({ priority: 1, createdAt: -1 });

    res.json({
      success: true,
      count: banners.length,
      data: banners,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch banners',
      error: err.message,
    });
  }
});

// PUT /api/banners/:id
router.put('/:id', async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      screen: req.body.screen?.toUpperCase(),
      position: req.body.position?.toUpperCase(),
      priority: Number(req.body.priority),
      isActive: req.body.isActive !== false,
    };

    const banner = await Banner.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    res.json({ success: true, data: banner });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to update banner',
      error: err.message,
    });
  }
});

// DELETE /api/banners/:id
router.delete('/:id', async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    // ✅ DELETE FROM CLOUDINARY if publicId exists
    if (banner.publicId) {
      try {
        await cloudinary.uploader.destroy(banner.publicId, {
          resource_type: 'image',
        });
        console.log('Deleted banner image from Cloudinary:', banner.publicId);
      } catch (cloudinaryError) {
        console.error('Failed to delete from Cloudinary:', cloudinaryError);
        // Continue with MongoDB deletion even if Cloudinary fails
      }
    }

    // Delete from MongoDB
    await Banner.findByIdAndDelete(req.params.id);

    res.json({ 
      success: true, 
      message: 'Banner deleted successfully',
      deletedFromCloudinary: !!banner.publicId 
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete banner',
      error: err.message,
    });
  }
});

module.exports = router;
