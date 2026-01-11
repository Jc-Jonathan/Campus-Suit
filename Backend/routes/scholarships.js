const express = require('express');
const router = express.Router();
const Scholarship = require('../models/scholarship');
const multer = require('multer');
const path = require('path');
const fs = require('fs');


// Create uploads directory if it doesn't exist
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf' || file.mimetype === 'application/msword' || 
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and Word documents are allowed'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
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
router.post('/add', upload.single('courseFile'), async (req, res) => {
  try {
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

    // 3️⃣ Create new scholarship with reused ID
    const scholarship = new Scholarship({
      scholarshipId: nextId,
      title: req.body.title,
      description: req.body.description,
      deadline: req.body.deadline,
      amount: req.body.amount,
      percentage: req.body.percentage,
      courseFileUrl: req.file ? `/uploads/${req.file.filename}` : '',
    });

    await scholarship.save();

    res.status(201).json({
      success: true,
      data: scholarship,
    });
  } catch (error) {
    console.error('Error adding scholarship:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add scholarship',
    });
  }
});




// UPDATE
router.put('/:id', upload.single('courseFile'), async (req, res) => {
  try {
    console.log('Updating scholarship:', req.params.id);
    const updateData = { ...req.body };
    
    if (req.file) {
      // Delete old file if it exists
      const oldScholarship = await Scholarship.findById(req.params.id);
      if (oldScholarship?.courseFileUrl) {
        const oldFilePath = path.join(__dirname, '..', oldScholarship.courseFileUrl);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      updateData.courseFileUrl = `/uploads/${req.file.filename}`;
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

    console.log('Updated scholarship:', updated);
    res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    console.error('Error updating scholarship:', error);
    res.status(500).json({ 
      success: false,
      message: 'Update failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    console.log('Deleting scholarship:', req.params.id);
    const scholarship = await Scholarship.findByIdAndDelete(req.params.id);
    
    if (!scholarship) {
      return res.status(404).json({
        success: false,
        message: 'Scholarship not found'
      });
    }

    // Delete associated file if it exists
    if (scholarship.courseFileUrl) {
      const filePath = path.join(__dirname, '..', scholarship.courseFileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    console.log('Deleted scholarship:', scholarship._id);
    res.json({ 
      success: true,
      message: 'Scholarship deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting scholarship:', error);
    res.status(500).json({ 
      success: false,
      message: 'Delete failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
