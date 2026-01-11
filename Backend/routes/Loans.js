const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Loan = require('../models/Loan');
const getNextLoanId = require('../Utils/getNextLoanId');

// =======================
// UPLOAD CONFIG
// =======================
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_, file, cb) => {
    const allowed = /jpeg|jpg|png|pdf|doc|docx/;
    const ok =
      allowed.test(path.extname(file.originalname).toLowerCase()) &&
      allowed.test(file.mimetype);
    cb(ok ? null : new Error('Invalid file type'), ok);
  },
}).single('document');

// =======================
// CREATE LOAN
// =======================
router.post('/', (req, res) => {
  upload(req, res, async err => {
    try {
      if (err) return res.status(400).json({ message: err.message });

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
      } = req.body;

      if (
        !title ||
        !description ||
        !minAmount ||
        !maxAmount ||
        !interestRate ||
        !repaymentPeriod
      ) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const loanId = await getNextLoanId();

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
        documentUrl: req.file ? `/uploads/${req.file.filename}` : '',
      });

      await loan.save();
      res.status(201).json(loan);
    } catch (error) {
      if (req.file) fs.unlinkSync(req.file.path);
      res.status(500).json({ message: 'Server error' });
    }
  });
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
router.put('/:loanId', async (req, res) => {
  const loan = await Loan.findOneAndUpdate(
    { loanId: req.params.loanId },
    req.body,
    { new: true }
  );

  if (!loan) return res.status(404).json({ message: 'Loan not found' });
  res.json(loan);
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
