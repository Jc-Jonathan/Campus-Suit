const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

// Helper function to create shop notifications
const createShopNotification = async (message) => {
  try {
    await Notification.create({
      message,
      category: 'SHOP',
      targetType: 'ALL',
      targetUsers: [],
    });
    console.log('Shop notification created:', message);
  } catch (error) {
    console.error('Failed to create shop notification:', error);
  }
};

/* ================= CREATE (ADMIN) ================= */
router.post('/', auth, async (req, res) => {
  try {
    const {
      message,
      type,
      recipients,
      category,
    } = req.body;

    const notification = await Notification.create({
      message,
      category, // 🔥 REQUIRED
      targetType: type,
      targetUsers: type === 'USERS' || type === 'APPROVED_STUDENTS'
        ? recipients
        : [],
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
    } else if (category === 'SHOP') {
      // Shop notifications visible to everyone
      query = { category: 'SHOP' };
    } else {
      // 🔥 ALL = announcements + scholarships + shop
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
          // Shop notifications (no restriction)
          {
            category: 'SHOP',
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
    const { message } = req.body;

    const updated = await Notification.findByIdAndUpdate(
      req.params.id,
      {
        ...(message && { message }),
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
