const express = require('express');
const router = express.Router();

const UserOrder = require('../models/UserOrder');
const Notification = require('../models/Notification');
const sendEmail = require('../Utils/sendEmail');


// ===============================
// GET NEXT ORDER ID
// ===============================
async function getNextOrderId() {
  try {
    const lastOrder = await UserOrder.findOne({}, {}, { sort: { orderId: -1 } });
    return lastOrder ? lastOrder.orderId + 1 : 1;
  } catch (error) {
    return 1;
  }
}


// ===============================
// CREATE USER ORDER
// ===============================
router.post('/', async (req, res) => {
  try {
    const {
      items,
      subtotal,
      totalAmount,
      name,
      email,
      phoneNumber,
      address,
      paymentDocumentUrl
    } = req.body;

    // ---------------- Validation ----------------
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }

    if (!name || !email || !phoneNumber || !address || !paymentDocumentUrl) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate each item
    for (const item of items) {
      if (!item.productName || !item.productImage || !item.quantity || !item.price) {
        return res.status(400).json({
          message: 'Each item must have productName, productImage, quantity, and price'
        });
      }
    }

    // ---------------- Create Order ----------------
    const orderId = await getNextOrderId();

    const order = await UserOrder.create({
      orderId,
      name: name.trim(),
      items,
      subtotal,
      totalAmount,
      email,
      phoneNumber,
      address: address.trim(),
      paymentDocumentUrl,
      status: 'pending'
    });

    // ---------------- Create Notification ----------------
    await createShopNotification(order, 'pending');

    res.status(201).json({
      message: 'Order placed successfully',
      order: {
        orderId: order.orderId,
        items: order.items,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt
      }
    });

  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({
      message: 'Failed to place order',
      error: err.message
    });
  }
});


// ===============================
// GET ALL ORDERS (ADMIN)
// ===============================
router.get('/', async (req, res) => {
  try {
    const orders = await UserOrder.find({}).sort({ createdAt: -1 });

    res.status(200).json({
      message: 'All orders retrieved successfully',
      orders
    });

  } catch (err) {
    res.status(500).json({
      message: 'Failed to fetch orders',
      error: err.message
    });
  }
});


// ===============================
// GET USER ORDERS BY EMAIL
// ===============================
router.get('/user/:email', async (req, res) => {
  try {
    const orders = await UserOrder.find({ email: req.params.email })
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: 'Orders retrieved successfully',
      orders
    });

  } catch (err) {
    res.status(500).json({
      message: 'Failed to retrieve orders',
      error: err.message
    });
  }
});


// ===============================
// GET ORDER BY ID
// ===============================
router.get('/:orderId', async (req, res) => {
  try {
    const order = await UserOrder.findOne({
      orderId: parseInt(req.params.orderId)
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({
      message: 'Order retrieved successfully',
      order
    });

  } catch (err) {
    res.status(500).json({
      message: 'Failed to retrieve order',
      error: err.message
    });
  }
});


// ===============================
// UPDATE ORDER STATUS
// ===============================
router.patch('/:orderId/status', async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await UserOrder.findOneAndUpdate(
      { orderId: parseInt(req.params.orderId) },
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Send Email (non-blocking failure)
    try {
      const subject = `Order #${order.orderId} status updated to ${status}`;
      const content = `Hello ${order.name},

Your order #${order.orderId} is now ${status.toUpperCase()}.

Total Amount: $${order.totalAmount.toFixed(2)}

Thank you for shopping with us!`;

      await sendEmail(order.email, subject, content);
    } catch (emailError) {
      console.error('Email failed but status updated:', emailError.message);
    }

    // Create Notification
    await createShopNotification(order, status);

    res.status(200).json({
      message: 'Order status updated successfully',
      order: {
        orderId: order.orderId,
        status: order.status
      }
    });

  } catch (err) {
    res.status(500).json({
      message: 'Failed to update order status',
      error: err.message
    });
  }
});


// ===============================
// DELETE ORDER
// ===============================
router.delete('/:orderId', async (req, res) => {
  try {
    const order = await UserOrder.findOneAndDelete({
      orderId: parseInt(req.params.orderId)
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({
      message: 'Order deleted successfully'
    });

  } catch (err) {
    res.status(500).json({
      message: 'Failed to delete order',
      error: err.message
    });
  }
});


// ===============================
// SHOP NOTIFICATION HELPER
// ===============================
async function createShopNotification(order, status) {
  try {
    const message = `Hello ${order.name},

Your order #${order.orderId} has been ${status.toUpperCase()}.

Total Amount: $${order.totalAmount.toFixed(2)}

Tap to view product details.`;

    await Notification.create({
      message,
      category: 'SHOP',
      targetType: 'USERS',  // Use 'USERS' instead of 'USER' to match enum
      targetEmails: [order.email],  // Use targetEmails instead of targetUsers

      orderDetails: {
        orderId: order.orderId,
        customerName: order.name,
        customerEmail: order.email,
        status: status,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,

        items: order.items.map(item => ({
          productName: item.productName,
          productImage: item.productImage,
          price: item.price,
          quantity: item.quantity
        }))
      }
    });

  } catch (error) {
    console.error('Failed to create shop notification:', error.message);
  }
}


module.exports = router;
