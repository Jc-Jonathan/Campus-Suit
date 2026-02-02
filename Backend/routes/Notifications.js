const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

/* ================= CREATE (ADMIN) ================= */
router.post('/', auth, async (req, res) => {
  try {
    const {
      message,
      type,
      recipients,
      category,
      pdfUrl,
      fileName,
    } = req.body;

    const notification = await Notification.create({
      message,
      category, // 🔥 REQUIRED
      targetType: type,
      targetUsers: type === 'USERS' || type === 'APPROVED_STUDENTS'
        ? recipients
        : [],
      pdfUrl,
      fileName,
    });

    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create notification' });
  }
});


/* ================= GET USER NOTIFICATIONS ================= */
/* ================= GET USER NOTIFICATIONS ================= */
router.get('/user', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { category } = req.query;

    let query = {};

    // ================= FILTER LOGIC =================
    if (category === 'SCHOLARSHIP') {
      // 🔥 Scholarships visible to everyone
      query = { category: 'SCHOLARSHIP' };
    } else if (category === 'ANNOUNCEMENT') {
      // Announcements respect targeting
      query = {
        category: 'ANNOUNCEMENT',
        $or: [
          { targetType: 'ALL' },
          { targetUsers: userId },
        ],
      };
    } else {
      // 🔥 ALL = announcements + scholarships
      query = {
        $or: [
          // Announcements
          {
            category: 'ANNOUNCEMENT',
            $or: [
              { targetType: 'ALL' },
              { targetUsers: userId },
            ],
          },
          // Scholarships (no restriction)
          {
            category: 'SCHOLARSHIP',
          },
        ],
      };
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});







/* ================= UNREAD COUNT ================= */
router.get('/unread-count', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const count = await Notification.countDocuments({
      $or: [
        { targetType: 'ALL' },
        { targetUsers: userId },
      ],
      readBy: { $ne: userId },
    });

    res.json({ count });
  } catch {
    res.status(500).json({ message: 'Failed to get unread count' });
  }
});

/* ================= MARK AS READ ================= */
router.put('/:id/read', auth, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, {
      $addToSet: { readBy: req.user.id },
    });

    res.json({ success: true });
  } catch {
    res.status(500).json({ message: 'Failed to mark as read' });
  }
});

/* ================= UPDATE (ADMIN) ================= */
router.put('/:id', auth, async (req, res) => {
  try {
    const { message, pdfUrl, fileName } = req.body;

    const updated = await Notification.findByIdAndUpdate(
      req.params.id,
      {
        ...(message && { message }),
        ...(pdfUrl && { pdfUrl }),
        ...(fileName && { fileName }),
      },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update notification' });
  }
});

/* ================= ADMIN FETCH ================= */
router.get('/', auth, async (req, res) => {
  const notifications = await Notification.find().sort({ createdAt: -1 });
  res.json(notifications);
});

/* ================= DELETE ================= */
router.delete('/:id', auth, async (req, res) => {
  await Notification.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;
