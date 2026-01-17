const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/user');
const sendEmail = require('../utils/sendEmail'); // adjust path if needed

/* ===================== AUTO USER ID ===================== */
async function getNextUserId() {
  const users = await User.find({}, { userId: 1, _id: 0 }).sort({ userId: 1 });
  let expectedId = 1;

  for (const user of users) {
    if (user.userId !== expectedId) return expectedId;
    expectedId++;
  }
  return expectedId;
}

/* ===================== SIGNUP ===================== */
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, country, phoneCode, phoneNumber } = req.body;

    if (!name || !email || !password || !country || !phoneCode || !phoneNumber) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await getNextUserId();

    await User.create({
      userId,
      name,
      email,
      password: hashedPassword,
      country,
      phoneCode,
      phoneNumber,
    });

    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

/* ===================== LOGIN ===================== */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    res.json({
  message: 'Login successful',
  userId: user.userId,
  email: user.email,   // ✅ ADD THIS
  role: 'user',
});

  } catch {
    res.status(500).json({ message: 'Server error' });
  }
})

/* ===================== FORGOT PASSWORD (SEND CODE) ===================== */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Security: do not reveal user existence
      return res.json({ message: 'If email exists, code sent' });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetPasswordToken = code;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    await sendEmail(
      email,
      'Password Reset Code',
      `Your password reset code is:\n\n${code}\n\nThis code expires in 10 minutes.`
    );

    res.json({ message: 'Reset code sent to email' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ===================== RESET PASSWORD ===================== */
router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: 'All fields required' });
    }

    const user = await User.findOne({
      email,
      resetPasswordToken: code,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired code' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});


/* ===================== GET PROFILE BY ID ===================== */
router.get('/me/:userId', async (req, res) => {
  try {
    const user = await User.findOne(
      { userId: Number(req.params.userId) },
      {
        password: 0,
        resetPasswordToken: 0,
        resetPasswordExpires: 0,
        __v: 0,
      }
    );

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});
// Get all users (admin only)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, { password: 0, resetPasswordToken: 0, resetPasswordExpires: 0, __v: 0 });
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

module.exports = router;
