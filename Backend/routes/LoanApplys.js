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

// Configure multer for parsing FormData without files (like we did for scholarships)
const uploadNone = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

/* ================= APPLY FOR LOAN ================= */

router.post('/', uploadNone.none(), async (req, res) => {
  try {
    console.log('📝 Processing loan application');
    console.log('📋 Request body:', req.body);

    // Extract all fields with proper fallbacks
    const fullName = req.body.fullName || '';
    const dob = req.body.dob || '';
    const gender = req.body.gender || '';
    const phone = req.body.phone || '';
    const email = req.body.email || '';
    const studentId = req.body.studentId || '';
    const homeAddress = req.body.homeAddress || '';
    const program = req.body.program || '';
    const yearOfStudy = req.body.yearOfStudy || '';
    const loanTitle = req.body.loanTitle || '';
    const amount = req.body.amount || 0;
    const repaymentPeriod = req.body.repaymentPeriod || '';
    const purpose = req.body.purpose || '';
    const interestRate = req.body.interestRate || 0;
    const signature = req.body.signature || '';

    // Handle Cloudinary URLs from frontend
    let idDocumentUrl = req.body.idDocumentUrl || null;
    let idDocumentPublicId = req.body.idDocumentPublicId || '';
    let schoolIdDocumentUrl = req.body.schoolIdDocumentUrl || null;
    let schoolIdDocumentPublicId = req.body.schoolIdDocumentPublicId || '';
    let agreementDocumentUrl = req.body.agreementDocumentUrl || null;
    let agreementDocumentPublicId = req.body.agreementDocumentPublicId || '';

    console.log('🔍 Received Cloudinary URLs:');
    console.log('  National ID:', idDocumentUrl);
    console.log('  School ID:', schoolIdDocumentUrl);
    console.log('  Agreement:', agreementDocumentUrl);

    // Convert various truthy values to boolean
    const toBoolean = (value) => {
      if (value === undefined || value === null) return false;
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') {
        return value.toLowerCase() === 'true' || value === '1' || value === 'on';
      }
      return Boolean(value);
    };

    const confirmAccurate = toBoolean(req.body.confirmAccurate);
    const agreeTerms = toBoolean(req.body.agreeTerms);
    const understandRisk = toBoolean(req.body.understandRisk);

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
      understandRisk,
      idDocumentUrl,
      schoolIdDocumentUrl,
      agreementDocumentUrl
    });

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
      // ✅ SAVE CLOUDINARY URLS
      idDocumentUrl,
      idDocumentPublicId,
      schoolIdDocumentUrl,
      schoolIdDocumentPublicId,
      agreementDocumentUrl,
      agreementDocumentPublicId,

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
