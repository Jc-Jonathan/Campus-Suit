const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const sendEmail = require('../utils/sendEmail');

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
      role: 'user',
    });

    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ===================== LOGIN (JWT FIXED) ===================== */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    // 🔐 CREATE JWT
    const token = jwt.sign(
      {
        id: user._id,
        userId: user.userId,
        email: user.email,
        role: 'user',
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES || '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      userId: user.userId,
      mongoId: user._id.toString(), // Convert MongoDB ObjectId to string
      email: user.email,
      role: 'user',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ===================== FORGOT PASSWORD ===================== */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ message: 'If email exists, code sent' });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetPasswordToken = code;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendEmail(
      email,
      'Password Reset Code',
      `Your password reset code is ${code}. It expires in 10 minutes.`
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

    const user = await User.findOne({
      email,
      resetPasswordToken: code,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired code' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

/* ===================== GET PROFILE ===================== */
router.get('/me/:userId', async (req, res) => {
  try {
    const user = await User.findOne(
      { userId: Number(req.params.userId) },
      { password: 0, resetPasswordToken: 0, resetPasswordExpires: 0, __v: 0 }
    );

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

/* ===================== GET ALL USERS (ADMIN READY) ===================== */
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

module.exports = router;
