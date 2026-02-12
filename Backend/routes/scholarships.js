const express = require('express');
const router = express.Router();
const Scholarship = require('../models/scholarship');
const multer = require('multer');
const cloudinary = require('../cloudinary');

// Configure multer to handle FormData without file storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype === 'application/msword' || 
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and Word documents are allowed'), false);
    }
  },
});

// Separate multer instance for parsing FormData without files
const uploadNone = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// GET ALL SCHOLARSHIPS
router.get('/', async (req, res) => {
  console.log('GET /api/scholarships - Request received');
  try {
    const scholarships = await Scholarship.find({});
    console.log(`Found ${scholarships.length} scholarships`);
    res.json({
      success: true,
      data: scholarships
    });
  } catch (error) {
    console.error('Error fetching scholarships:', error);
    res.status(500).json({
      success: false,
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// GET SINGLE SCHOLARSHIP BY ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    let scholarship;

    // 🔑 If numeric → search by scholarshipId
    if (!isNaN(id)) {
      scholarship = await Scholarship.findOne({
        scholarshipId: Number(id),
      });
    } else {
      // 🔑 Otherwise search by Mongo _id
      scholarship = await Scholarship.findById(id);
    }

    if (!scholarship) {
      return res.status(404).json({
        success: false,
        message: 'Scholarship not found',
      });
    }

    res.json({
      success: true,
      data: scholarship,
    });
  } catch (error) {
    console.error('Error fetching scholarship:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch scholarship',
    });
  }
});


// ADD
router.post('/add', uploadNone.none(), async (req, res) => {
  try {
    console.log('📝 Adding new scholarship');
    console.log('📋 Request body:', req.body);
    
    // Validate required fields
    const { title, description, deadline, amount, percentage } = req.body;
    
    if (!title || !description || !deadline || !amount || !percentage) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, description, deadline, amount, percentage'
      });
    }
    
    if (isNaN(amount) || isNaN(percentage)) {
      return res.status(400).json({
        success: false,
        message: 'Amount and percentage must be valid numbers'
      });
    }
    
    // 1️⃣ Get all existing scholarshipIds
    const existing = await Scholarship.find(
      { scholarshipId: { $exists: true } },
      { scholarshipId: 1, _id: 0 }
    ).sort({ scholarshipId: 1 });

    // 2️⃣ Find the smallest missing ID
    let nextId = 1;
    for (let i = 0; i < existing.length; i++) {
      if (existing[i].scholarshipId !== nextId) {
        break;
      }
      nextId++;
    }

    // 3️⃣ Handle Cloudinary URL from frontend
    let courseFileUrl = req.body.courseFileUrl || '';
    let courseFilePublicId = req.body.courseFilePublicId || '';
    
    console.log('🔍 Received courseFileUrl:', courseFileUrl);
    console.log('🔍 Received courseFilePublicId:', courseFilePublicId);
    
    if (courseFileUrl) {
      console.log(`📄 Using Cloudinary URL from frontend: ${courseFileUrl}`);
      console.log(`🆔 Public ID: ${courseFilePublicId}`);
    } else {
      console.log('⚠️ No courseFileUrl received');
    }

    // 4️⃣ Create new scholarship
    const scholarship = new Scholarship({
      scholarshipId: nextId,
      title: req.body.title,
      description: req.body.description,
      deadline: req.body.deadline,
      amount: req.body.amount,
      percentage: req.body.percentage,
      courseFileUrl: courseFileUrl,
      courseFilePublicId: courseFilePublicId,
    });

    await scholarship.save();

    console.log(`✅ Scholarship created with ID: ${nextId}`);

    res.status(201).json({
      success: true,
      data: scholarship,
    });
  } catch (error) {
    console.error('❌ Error adding scholarship:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add scholarship',
      error: error.message,
    });
  }
});




// UPDATE
router.put('/:id', uploadNone.none(), async (req, res) => {
  try {
    console.log(`📝 Updating scholarship: ${req.params.id}`);
    
    const updateData = { ...req.body };
    
    // Handle Cloudinary URL from frontend
    let courseFileUrl = req.body.courseFileUrl || '';
    let courseFilePublicId = req.body.courseFilePublicId || '';
    
    if (courseFileUrl) {
      console.log(`📄 Using Cloudinary URL from frontend: ${courseFileUrl}`);
      console.log(`🆔 Public ID: ${courseFilePublicId}`);
      
      updateData.courseFileUrl = courseFileUrl;
      updateData.courseFilePublicId = courseFilePublicId;
      
      // Delete old file from Cloudinary if it exists and is different
      const oldScholarship = await Scholarship.findById(req.params.id);
      if (oldScholarship?.courseFilePublicId && oldScholarship.courseFilePublicId !== courseFilePublicId) {
        try {
          await cloudinary.uploader.destroy(oldScholarship.courseFilePublicId);
          console.log(`🗑️ Deleted old file from Cloudinary: ${oldScholarship.courseFilePublicId}`);
        } catch (deleteError) {
          console.warn('⚠️ Failed to delete old file from Cloudinary:', deleteError);
        }
      }
    }

    const updated = await Scholarship.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Scholarship not found'
      });
    }

    console.log(`✅ Scholarship updated: ${req.params.id}`);

    res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    console.error('❌ Error updating scholarship:', error);
    res.status(500).json({ 
      success: false,
      message: 'Update failed',
      error: error.message
    });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    console.log(`🗑️ Deleting scholarship: ${req.params.id}`);
    const scholarship = await Scholarship.findById(req.params.id);
    
    if (!scholarship) {
      return res.status(404).json({
        success: false,
        message: 'Scholarship not found'
      });
    }

    // Delete file from Cloudinary if it exists
    if (scholarship.courseFilePublicId) {
      try {
        await cloudinary.uploader.destroy(scholarship.courseFilePublicId);
        console.log(`🗑️ Deleted file from Cloudinary: ${scholarship.courseFilePublicId}`);
      } catch (deleteError) {
        console.warn('⚠️ Failed to delete file from Cloudinary:', deleteError);
      }
    }

    // Delete scholarship from MongoDB
    await Scholarship.findByIdAndDelete(req.params.id);

    console.log(`✅ Scholarship deleted: ${req.params.id}`);

    res.json({ 
      success: true,
      message: 'Scholarship deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting scholarship:', error);
    res.status(500).json({ 
      success: false,
      message: 'Delete failed',
      error: error.message
    });
  }
});

module.exports = router;
