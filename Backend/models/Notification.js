const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
      trim: true,
    },

    // 🔥 NEW
    category: {
      type: String,
      enum: ['ANNOUNCEMENT', 'SCHOLARSHIP', 'SHOP', 'LOAN'],
      required: true,
    },

    targetType: {
      type: String,
      enum: ['ALL', 'USERS', 'APPROVED_STUDENTS'],
      required: true,
    },

    targetUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    // Email-based filtering for user-specific notifications
    reader: String,
    targetUser: String,

    pdfUrl: String,
    fileName: String,
    
    // Store order details for shop notifications
    orderDetails: {
      orderId: Number,
      customerName: String,
      status: String,
      items: [{
        productName: String,
        productImage: String,
        price: Number,
        quantity: Number
      }],
      totalAmount: Number,
      createdAt: Date
    },

    // Store scholarship details for scholarship notifications
    scholarshipInfo: {
      applicantName: String,
      applicantEmail: String,
      scholarshipName: String,
      courseName: String,
      message: String
    },

    // Store loan details for loan notifications
    loanInfo: {
      applicantName: String,
      applicantEmail: String,
      loanName: String,
      amount: String,
      interestRate: String,
      message: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', NotificationSchema);
