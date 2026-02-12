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
router.get('/user', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { category } = req.query;

    // Get user email from the user object (assuming it's available in req.user)
    const userEmail = req.user.email;

    let query = {};

    // ================= FILTER LOGIC =================
    if (category === 'SCHOLARSHIP') {
      // Scholarships visible to everyone, but filter by email if user-specific
      query = { 
        category: 'SCHOLARSHIP',
        $or: [
          { targetType: 'ALL' },
          { 'scholarshipInfo.applicantEmail': userEmail },
          { reader: userEmail }
        ]
      };
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
      // Shop notifications visible to everyone, but filter by email if user-specific
      query = { 
        category: 'SHOP',
        $or: [
          { targetType: 'ALL' },
          { 'shopInfo.customerEmail': userEmail },
          { targetUser: userEmail }
        ]
      };
    } else if (category === 'LOAN') {
      // Loan notifications visible to everyone, but filter by email if user-specific
      query = { 
        category: 'LOAN',
        $or: [
          { targetType: 'ALL' },
          { 'loanInfo.applicantEmail': userEmail },
          { 'loanInfo.reader': userEmail },
          { reader: userEmail }
        ]
      };
    } else {
      // 🔥 ALL = announcements + scholarships + shop + loans (with email filtering)
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
          // Scholarships (with email filtering)
          {
            category: 'SCHOLARSHIP',
            $or: [
              { targetType: 'ALL' },
              { 'scholarshipInfo.applicantEmail': userEmail },
              { reader: userEmail }
            ]
          },
          // Shop notifications (with email filtering)
          {
            category: 'SHOP',
            $or: [
              { targetType: 'ALL' },
              { 'shopInfo.customerEmail': userEmail },
              { targetUser: userEmail }
            ]
          },
          // Loan notifications (with email filtering)
          {
            category: 'LOAN',
            $or: [
              { targetType: 'ALL' },
              { 'loanInfo.applicantEmail': userEmail },
              { 'loanInfo.reader': userEmail },
              { reader: userEmail }
            ]
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
    const userId = req.user._id || req.user.id;
    const userEmail = req.user.email;

    // Count all notifications user can see (including announcements)
    const unreadCount = await Notification.countDocuments({
      $or: [
        // Announcements - count if user is targeted or it's for ALL
        {
          category: 'ANNOUNCEMENT',
          $or: [
            { targetType: 'ALL' },
            { targetUsers: userId },
          ],
        },
        // Scholarships - only if user's email matches exactly
        {
          category: 'SCHOLARSHIP',
          $or: [
            { 'scholarshipInfo.applicantEmail': userEmail },
            { reader: userEmail }
          ]
        },
        // Shop notifications - only if user's email matches exactly
        {
          category: 'SHOP',
          $or: [
            { 'shopInfo.customerEmail': userEmail },
            { targetUser: userEmail }
          ]
        },
        // Loan notifications - only if user's email matches exactly
        {
          category: 'LOAN',
          $or: [
            { 'loanInfo.applicantEmail': userEmail },
            { 'loanInfo.reader': userEmail },
            { reader: userEmail }
          ]
        }
      ],
      readBy: { $ne: userId }
    });

    res.json({ count: unreadCount });
  } catch (error) {
    console.error('Unread count error:', error);
    res.status(500).json({ message: 'Failed to get unread count' });
  }
});

/* ================= MARK AS READ ================= */
router.put('/:id/read', auth, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, {
      $addToSet: { readBy: req.user._id || req.user.id },
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

// ================= CREATE SCHOLARSHIP NOTIFICATION ================= //
router.post('/scholarship', auth, async (req, res) => {
  try {
    const {
      message,
      category,
      reader,
      scholarshipInfo
    } = req.body;

    // Extract email from scholarshipInfo for user-specific targeting
    const targetEmail = scholarshipInfo?.applicantEmail || reader;
    
    const notification = await Notification.create({
      message,
      category, // 'SCHOLARSHIP'
      targetType: 'ALL', // Use 'ALL' for now since we're filtering by email in frontend
      targetUsers: [], // Keep empty for now, we'll use email-based filtering
      scholarshipInfo,
      // Add reader field for email-based filtering (this is used in frontend filtering)
      ...(targetEmail && { reader: targetEmail })
    });

    res.status(201).json(notification);
    console.log('Scholarship notification created:', notification);
  } catch (error) {
    console.error('Failed to create scholarship notification:', error);
    res.status(500).json({ message: 'Failed to create scholarship notification' });
  }
});

// ================= CREATE LOAN NOTIFICATION ================= //
router.post('/loan', auth, async (req, res) => {
  try {
    const {
      message,
      category,
      reader,
      loanInfo
    } = req.body;

    // Extract email from loanInfo for user-specific targeting
    const targetEmail = loanInfo?.applicantEmail || reader;
    
    const notification = await Notification.create({
      message,
      category, // 'LOAN'
      targetType: targetEmail ? 'ALL' : 'ALL', // Use 'ALL' for now since we're filtering by email in frontend
      targetUsers: [], // Keep empty for now, we'll use email-based filtering
      loanInfo,
      // Add reader field for email-based filtering (this is used in frontend filtering)
      ...(targetEmail && { reader: targetEmail })
    });

    res.status(201).json(notification);
    console.log('Loan notification created:', notification);
  } catch (error) {
    console.error('Failed to create loan notification:', error);
    res.status(500).json({ message: 'Failed to create loan notification' });
  }
});

// ================= CREATE SHOP NOTIFICATION ================= //
router.post('/shop', auth, async (req, res) => {
  try {
    const {
      message,
      category,
      targetUser,
      shopInfo
    } = req.body;

    // Debug: Log received data
    console.log('Received shop notification data:', {
      message,
      category,
      targetUser,
      shopInfo,
      orderItemsCount: shopInfo?.orderItems?.length || 0,
      totalPrice: shopInfo?.totalPrice
    });

    // Extract email from shopInfo for user-specific targeting
    const targetEmail = shopInfo?.customerEmail || targetUser;
    
    const notification = await Notification.create({
      message,
      category, // 'SHOP'
      targetType: 'ALL', // Use 'ALL' for now since we're filtering by email in frontend
      targetUsers: [], // Keep empty for now, we'll use email-based filtering
      shopInfo,
      // Add targetUser field for email-based filtering (this is used in frontend filtering)
      ...(targetEmail && { targetUser: targetEmail })
    });

    res.status(201).json(notification);
    console.log('Shop notification created:', notification);
  } catch (error) {
    console.error('Failed to create shop notification:', error);
    res.status(500).json({ message: 'Failed to create shop notification' });
  }
});

module.exports = router;
