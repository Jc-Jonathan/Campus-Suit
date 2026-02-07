const express = require('express');
const router = express.Router();
const UserOrder = require('../models/UserOrder');
const sendEmail = require('../Utils/sendEmail');
const Notification = require('../models/Notification');

// Function to get next order ID
async function getNextOrderId() {
  try {
    const lastOrder = await UserOrder.findOne({}, {}, { sort: { orderId: -1 } });
    return lastOrder ? lastOrder.orderId + 1 : 1;
  } catch (error) {
    return 1;
  }
}

// CREATE USER ORDER WITH MULTIPLE PRODUCTS
router.post('/', async (req, res) => {
  try {
    const {
      items,           // Array of products: [{productName, productImage, quantity, price}]
      subtotal,        // Subtotal of all items
      totalAmount,     // Final total amount
      name,            // Customer name
      email,
      phoneNumber,
      address,
      paymentDocumentUrl, // URL of uploaded payment proof
    } = req.body;

    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }

    if (!name || name.trim() === '') {
      return res.status(400).json({ 
        message: 'Missing required fields',
        details: {
          name: !name ? 'Name is required' : null
        }
      });
    }

    if (!email || !phoneNumber || !address) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        details: {
          email: !email ? 'Email is required' : null,
          phoneNumber: !phoneNumber ? 'Phone number is required' : null,
          address: !address ? 'Address is required' : null
        }
      });
    }

    if (!paymentDocumentUrl) {
      return res.status(400).json({ 
        message: 'Payment proof document is required',
        details: 'Please upload payment proof before placing order'
      });
    }

    // Validate each item
    for (const item of items) {
      if (!item.productName || !item.productImage || !item.quantity || !item.price) {
        return res.status(400).json({ 
          message: 'Invalid item data',
          details: 'Each item must have productName, productImage, quantity, and price'
        });
      }
    }

    // Get next order ID
    const orderId = await getNextOrderId();

    // Create the order
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

// GET ALL ORDERS (ADMIN)
router.get('/', async (req, res) => {
  try {
    const orders = await UserOrder.find({})
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: 'All orders retrieved successfully',
      orders
    });
  } catch (err) {
    console.error('Get all orders error:', err);
    res.status(500).json({
      message: 'Failed to fetch orders',
      error: err.message
    });
  }
});

// GET USER ORDERS BY EMAIL
router.get('/user/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const orders = await UserOrder.find({ email })
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: 'Orders retrieved successfully',
      orders
    });
  } catch (err) {
    console.error('Get orders error:', err);
    res.status(500).json({ 
      message: 'Failed to retrieve orders',
      error: err.message 
    });
  }
});

// GET ORDER BY ORDER ID
router.get('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await UserOrder.findOne({ orderId: parseInt(orderId) });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({
      message: 'Order retrieved successfully',
      order
    });
  } catch (err) {
    console.error('Get order error:', err);
    res.status(500).json({ 
      message: 'Failed to retrieve order',
      error: err.message 
    });
  }
});

// UPDATE ORDER STATUS
router.patch('/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await UserOrder.findOneAndUpdate(
      { orderId: parseInt(orderId) },
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Send email notification based on status
    try {
      const emailSubject = getOrderStatusEmailSubject(status);
      const emailContent = getOrderStatusEmailContent(order, status);
      
      await sendEmail(order.email, emailSubject, emailContent);
      console.log(`Status update email sent to ${order.email} for order ${orderId}`);
    } catch (emailError) {
      console.error('Failed to send status update email:', emailError.message);
      
      // Handle specific Gmail sending limit error
      if (emailError.code === 'EENVELOPE' && emailError.response.includes('Daily user sending limit exceeded')) {
        console.log('Gmail daily sending limit reached. Email notification skipped but status update succeeded.');
        // Don't fail the status update - just log the issue
      } else {
        // For other email errors, also don't fail the status update but log more details
        console.error('Email service error details:', {
          code: emailError.code,
          response: emailError.response,
          command: emailError.command
        });
      }
    }

    // Create shop notification
    try {
      await createShopNotification(order, status);
    } catch (notificationError) {
      console.error('Failed to create shop notification:', notificationError);
      // Don't fail the status update if notification fails
    }

    res.status(200).json({
      message: 'Order status updated successfully',
      order: {
        orderId: order.orderId,
        status: status
      }
    });
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ 
      message: 'Failed to update order status',
      error: err.message 
    });
  }
});

// Helper functions for email content
function getOrderStatusEmailSubject(status) {
  const subjects = {
    pending: 'Order Status Update: Your Order is Pending',
    confirmed: 'Order Confirmed! Your Order Has Been Confirmed',
    shipped: 'Order Shipped! Your Order is on its Way',
    delivered: 'Order Delivered! Thank You for Your Purchase',
    cancelled: 'Order Cancelled: Your Order Has Been Cancelled'
  };
  return subjects[status] || 'Order Status Update';
}

function getOrderStatusEmailContent(order, status) {
  const customerName = order.name;
  const orderId = order.orderId;
  const orderDate = new Date(order.createdAt).toLocaleDateString();
  
  const statusMessages = {
    pending: `Your order is currently pending review. We will process it shortly and notify you once it's confirmed.\n\nOrder Details:\n• Order ID: ${orderId}\n• Order Date: ${orderDate}\n• Total Amount: $${order.totalAmount.toFixed(2)}\n\nWe appreciate your patience and will keep you updated on the progress of your order.`,
    
    confirmed: `Great news! Your order has been confirmed and is being prepared for shipment.\n\nOrder Details:\n• Order ID: ${orderId}\n• Order Date: ${orderDate}\n• Total Amount: $${order.totalAmount.toFixed(2)}\n\nYour order will be shipped soon. You will receive another notification once it's on its way.\n\nThank you for shopping with Campus Support Suit!`,
    
    shipped: `Your order has been shipped and is on its way to you!\n\nOrder Details:\n• Order ID: ${orderId}\n• Order Date: ${orderDate}\n• Total Amount: $${order.totalAmount.toFixed(2)}\n\nYou can expect your delivery soon. Please keep an eye out for your package.\n\nThank you for your purchase!`,
    
    delivered: `Your order has been successfully delivered! We hope you enjoy your purchase.\n\nOrder Details:\n• Order ID: ${orderId}\n• Order Date: ${orderDate}\n• Total Amount: $${order.totalAmount.toFixed(2)}\n\nThank you for choosing Campus Support Suit! We appreciate your business and hope to see you again soon.\n\nIf you have any questions or concerns about your order, please don't hesitate to contact our support team.`,
    
    cancelled: `We're sorry to inform you that your order has been cancelled.\n\nOrder Details:\n• Order ID: ${orderId}\n• Order Date: ${orderDate}\n• Total Amount: $${order.totalAmount.toFixed(2)}\n\nIf you didn't request this cancellation or have any questions, please contact our support team immediately.\n\nWe apologize for any inconvenience this may cause.`
  };
  
  return `Dear ${customerName},\n\n${statusMessages[status] || `Your order status has been updated to: ${status}.\n\nOrder Details:\n• Order ID: ${orderId}\n• Order Date: ${orderDate}\n• Total Amount: $${order.totalAmount.toFixed(2)}\n\nThank you for your business.`}`;
}

// Helper function to create shop notification
async function createShopNotification(order, status) {
  try {
    // Create personalized message with product summary
    const customerName = order.name;
    const productCount = order.items.length;
    
    let message = `Hello "${customerName}"\nOrder status updated to ${status}`;
    
    // Add "show more" indicator if multiple products
    if (productCount > 1) {
      message += "\n\nTap to view all products and details";
    }
    
    // Create notification with product details embedded
    const notificationData = {
      message,
      category: 'SHOP',
      targetType: 'ALL',
      targetUsers: [],
      // Store order details for frontend display
      orderDetails: {
        orderId: order.orderId,
        customerName: order.name,
        status: status,
        items: order.items,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt
      }
    };
    
    console.log('Creating notification with data:', JSON.stringify(notificationData, null, 2));
    
    const notification = await Notification.create(notificationData);
    
    // Verify the notification was created correctly
    const savedNotification = await Notification.findById(notification._id);
    console.log('Saved notification orderDetails:', JSON.stringify(savedNotification.orderDetails, null, 2));
    
    console.log('Shop notification created:', message);
    return notification;
  } catch (error) {
    console.error('Failed to create shop notification:', error);
  }
}

module.exports = router;
