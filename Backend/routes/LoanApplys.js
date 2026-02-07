const express = require('express');
const router = express.Router();
const LoanApply = require('../models/LoanApply');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sendEmail = require('../utils/sendEmail');
const bodyParser = require('body-parser');

// Parse application/x-www-form-urlencoded
router.use(bodyParser.urlencoded({ extended: true }));
// Parse application/json
router.use(bodyParser.json());

/* ================= MULTER CONFIG ================= */

// Use path.join for cross-platform compatibility
const uploadDir = path.join('public', 'uploads', 'loans');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const allowed = /jpeg|jpg|png|pdf|doc|docx/;
    const valid =
      allowed.test(path.extname(file.originalname).toLowerCase()) &&
      allowed.test(file.mimetype);

    cb(valid ? null : new Error('Invalid file type'), valid);
  }
});

const uploadFiles = upload.fields([
  { name: 'idDocument', maxCount: 1 },
  { name: 'schoolIdDocument', maxCount: 1 },
  { name: 'agreementDocument', maxCount: 1 }
]);

/* ================= APPLY FOR LOAN ================= */

router.post('/', uploadFiles, async (req, res) => {
  try {
    console.log('Raw request body:', req.body);
    console.log('Request files:', req.files);

    // For FormData, the fields might be in req.body directly
    const formData = req.body;
    
    // Extract all fields with proper fallbacks
    const fullName = formData.fullName || '';
    const dob = formData.dob || '';
    const gender = formData.gender || '';
    const phone = formData.phone || '';
    const email = formData.email || '';
    const studentId = formData.studentId || '';
    const homeAddress = formData.homeAddress || '';
    const program = formData.program || '';
    const yearOfStudy = formData.yearOfStudy || '';
    const loanTitle = formData.loanTitle || '';
    const amount = formData.amount || 0;
    const repaymentPeriod = formData.repaymentPeriod || '';
    const purpose = formData.purpose || '';
    const interestRate = formData.interestRate || 0;
    const signature = formData.signature || '';
    // Convert various truthy values to boolean
    const toBoolean = (value) => {
      if (value === undefined || value === null) return false;
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') {
        return value.toLowerCase() === 'true' || value === '1' || value === 'on';
      }
      return Boolean(value);
    };

    const confirmAccurate = toBoolean(formData.confirmAccurate);
    const agreeTerms = toBoolean(formData.agreeTerms);
    const understandRisk = toBoolean(formData.understandRisk);

    console.log('Processed form data:', {
      fullName,
      dob,
      gender,
      phone,
      email,
      studentId,
      homeAddress,
      program,
      yearOfStudy,
      loanTitle,
      amount,
      repaymentPeriod,
      purpose,
      interestRate,
      signature: signature ? '[SIGNATURE PRESENT]' : 'Not provided',
      confirmAccurate,
      agreeTerms,
      understandRisk
    });


    // ✅ CORRECT FILE URL MAPPING
    let idDocumentUrl = null;
    let schoolIdDocumentUrl = null;
    let agreementDocumentUrl = null;

    if (req.files?.idDocument?.[0]) {
      idDocumentUrl = `/uploads/loans/${req.files.idDocument[0].filename}`;
    }

    if (req.files?.schoolIdDocument?.[0]) {
      schoolIdDocumentUrl = `/uploads/loans/${req.files.schoolIdDocument[0].filename}`;
    }

    if (req.files?.agreementDocument?.[0]) {
      agreementDocumentUrl = `/uploads/loans/${req.files.agreementDocument[0].filename}`;
    }

    const loanApplication = new LoanApply({
      fullName,
      dob: new Date(dob),
      gender,
      phone,
      email,
      studentId: studentId || undefined,
      homeAddress,  
      program,
      repaymentPeriod,
      yearOfStudy,
      loanTitle,
      amount: Number(amount),
      purpose,
      interestRate: Number(interestRate),

      // 
      // ✅ SAVE URLS DIRECTLY
      idDocumentUrl,
      schoolIdDocumentUrl,
      agreementDocumentUrl,

      signature: signature || undefined,
      confirmAccurate: confirmAccurate === 'true',
      agreeTerms: agreeTerms === 'true',
      understandRisk: understandRisk === 'true'
    });

    await loanApplication.save();

    res.status(201).json({
      success: true,
      message: 'Loan application submitted successfully',
      data: loanApplication
    });
  } catch (error) {
    console.error('Error submitting loan application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit loan application',
      error: error.message
    });
  }
});


/* ================= GET ALL (ADMIN) ================= */

router.get('/', async (_, res) => {
  const apps = await LoanApply.find().sort({ applicationId: 1 });
  res.json({ success: true, data: apps });
});

/* ================= GET SINGLE ================= */

router.get('/:id', async (req, res) => {
  const app = await LoanApply.findById(req.params.id);
  if (!app) return res.status(404).json({ message: 'Not found' });
  res.json({ success: true, data: app });
});

/* ================= UPDATE STATUS ================= */

router.patch('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: pending, approved, rejected'
      });
    }

    const app = await LoanApply.findById(req.params.id);
    if (!app) {
      return res.status(404).json({
        success: false,
        message: 'Loan application not found'
      });
    }

    const updatedApp = await LoanApply.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    let subject = '';
    let message = '';

    if (status === 'approved') {
      subject = 'Loan Application Approved 🎉';
      message = `
Dear ${app.fullName},

We are pleased to inform you that your loan application for "${app.loanTitle}" has been APPROVED! 🎉

Loan Details:
- Amount: $${app.amount?.toLocaleString()}
- Purpose: ${app.purpose}
- Application ID: ${app.applicationId}

Our team will contact you shortly with the next steps regarding the disbursement of your loan.

If you have any questions, please don't hesitate to contact our support team.

Best regards,
Campus Support Suit Team
`;
    } else if (status === 'rejected') {
      subject = 'Loan Application Update';
      message = `
Dear ${app.fullName},

Thank you for applying for the loan "${app.loanTitle}".

After careful review, we regret to inform you that your application was NOT successful at this time.

Application Details:
- Amount Requested: $${app.amount?.toLocaleString()}
- Purpose: ${app.purpose}
- Application ID: ${app.applicationId}

We encourage you to review your application and consider applying again in the future. If you have any questions about this decision, please contact our support team.

Best regards,
Campus Support Suit Team
`;
    }

    // Send email if status is approved or rejected
    if (['approved', 'rejected'].includes(status)) {
      try {
        await sendEmail(app.email, subject, message);
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        // Continue with the response even if email fails
      }
    }

    res.json({
      success: true,
      message: 'Loan application updated successfully' + (['approved', 'rejected'].includes(status) ? ' and email sent' : ''),
      data: updatedApp
    });
  } catch (error) {
    console.error('Error updating loan application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update loan application',
      error: error.message
    });
  }
});

/* ================= DELETE ================= */

router.delete('/:id', async (req, res) => {
  try {
    const deletedApp = await LoanApply.findByIdAndDelete(req.params.id);
    
    if (!deletedApp) {
      return res.status(404).json({
        success: false,
        message: 'Loan application not found'
      });
    }

    res.json({
      success: true,
      message: 'Loan application deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting loan application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete loan application',
      error: error.message
    });
  }
});

module.exports = router;
