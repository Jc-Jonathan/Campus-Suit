// Backend/routes/Banners.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Banner = require('../models/Banner'); // Make sure this path is correct

// Verify the Banner model is properly imported
if (!Banner || typeof Banner !== 'function') {
  console.error('Error: Banner model is not properly imported');
  process.exit(1);
}

// POST /api/banners
router.post('/', async (req, res) => {
  try {
    const { imageUrl, screen, position, priority = 1, isActive = true } = req.body;

    if (!imageUrl || !screen || !position) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: imageUrl, screen, and position are required'
      });
    }
     // CHECK IF BANNER ALREADY EXISTS
         const existingBanner = await Banner.findOne({
          screen: screen.toUpperCase(),
           position: position.toUpperCase(),
            });

        if (existingBanner) {
          return res.status(409).json({
             success: false,
           message:
      'Banner already exists for this screen and position. Please delete it first.',
        });
}

    // Create banner using the model
    const banner = new Banner({
      imageUrl,
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

    // Only filter active banners for user app
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
    console.error('Update error:', err);
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
    const banner = await Banner.findByIdAndDelete(req.params.id);

    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    res.json({ success: true, message: 'Banner deleted successfully' });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete banner',
      error: err.message,
    });
  }
});


module.exports = router;