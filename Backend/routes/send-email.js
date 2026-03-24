const express = require('express');
const router = express.Router();
const sendEmail = require('../Utils/sendEmail');

/* =========================
   SEND EMAIL ENDPOINT
========================= */
router.post('/', async (req, res) => {
  try {
    const { to, subject, message, type } = req.body;
    
    console.log('📧 Email request received:', { to, subject: subject?.substring(0, 50) + '...', type });

    if (!to || !subject || !message) {
      return res.status(400).json({ 
        message: 'Missing required fields: to, subject, message' 
      });
    }

    await sendEmail(to, subject, message);
    
    console.log('✅ Email sent successfully to:', to);
    res.json({ 
      message: 'Email sent successfully',
      to: to 
    });

  } catch (error) {
    console.error('❌ Email sending error:', error);
    res.status(500).json({ 
      message: 'Failed to send email',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
