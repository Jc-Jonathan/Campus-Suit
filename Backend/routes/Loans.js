const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Loan = require('../models/Loan');
const getNextLoanId = require('../Utils/getNextLoanId');

// Configure multer for parsing FormData without files (like we did for scholarships)
const uploadNone = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// =======================
// CREATE LOAN
// =======================
router.post('/', uploadNone.none(), async (req, res) => {
  try {
    console.log('📝 Creating new loan');
    console.log('📋 Request body:', req.body);
    
    const {
      title,
      description,
      minAmount,
      maxAmount,
      interestRate,
      repaymentPeriod,
      eligibility,
      requiredDocuments,
      applicationDeadline,
      processingTime,
      benefits,
      documentUrl,
      documentPublicId,
    } = req.body;

    if (
      !title ||
      !description ||
      !minAmount ||
      !maxAmount ||
      !interestRate ||
      !repaymentPeriod
    ) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const loanId = await getNextLoanId();

    // Handle Cloudinary URL from frontend
    let documentUrlFinal = documentUrl || '';
    let documentPublicIdFinal = documentPublicId || '';

    console.log('🔍 Received Cloudinary URL:', documentUrlFinal);
    console.log('🆔 Received Public ID:', documentPublicIdFinal);

    const loan = new Loan({
      loanId,
      title,
      description,
      minAmount: Number(minAmount),
      maxAmount: Number(maxAmount),
      interestRate: Number(interestRate),
      repaymentPeriod,
      eligibility: eligibility || '',
      requiredDocuments: requiredDocuments || '',
      applicationDeadline: applicationDeadline || '',
      processingTime: processingTime || '',
      benefits: benefits || '',
      documentUrl: documentUrlFinal,
      documentPublicId: documentPublicIdFinal,
    });

    await loan.save();
    console.log('✅ Loan created successfully with Cloudinary URL');
    res.status(201).json(loan);
  } catch (error) {
    console.error('Error creating loan:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// =======================
// GET ALL LOANS
// =======================
router.get('/', async (_, res) => {
  try {
    const loans = await Loan.find().sort({ loanId: 1 });
    res.json(loans);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// =======================
// GET SINGLE LOAN
// =======================
// In Backend/routes/Loans.js
router.get('/loan/:loanId', async (req, res) => {
  try {
    const loan = await Loan.findOne({ loanId: Number(req.params.loanId) });
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }
    res.json(loan);
  } catch (error) {
    console.error('Error fetching loan:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// =======================
// UPDATE LOAN (NO FILE)
// =======================
router.put('/:loanId', uploadNone.none(), async (req, res) => {
  try {
    console.log(`📝 Updating loan: ${req.params.loanId}`);
    console.log('📋 Request body:', req.body);
    
    const updateData = { ...req.body };
    
    // Handle Cloudinary URL from frontend
    let documentUrlFinal = req.body.documentUrl || '';
    let documentPublicIdFinal = req.body.documentPublicId || '';
    
    if (documentUrlFinal) {
      updateData.documentUrl = documentUrlFinal;
      updateData.documentPublicId = documentPublicIdFinal;
      console.log(`📄 Using Cloudinary URL from frontend: ${documentUrlFinal}`);
      console.log(`🆔 Public ID: ${documentPublicIdFinal}`);
    }

    const loan = await Loan.findOneAndUpdate(
      { loanId: req.params.loanId },
      updateData,
      { new: true }
    );

    if (!loan) return res.status(404).json({ message: 'Loan not found' });
    
    console.log('✅ Loan updated successfully');
    res.json(loan);
  } catch (error) {
    console.error('Error updating loan:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// =======================
// DELETE LOAN
// =======================
router.delete('/:loanId', async (req, res) => {
  const loan = await Loan.findOneAndDelete({ loanId: req.params.loanId });

  if (!loan) return res.status(404).json({ message: 'Loan not found' });

  if (loan.documentUrl) {
    const filePath = path.join(__dirname, '..', loan.documentUrl);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  res.json({ message: 'Loan deleted successfully' });
});

module.exports = router;
