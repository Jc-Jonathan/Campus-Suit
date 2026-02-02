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
      enum: ['ANNOUNCEMENT', 'SCHOLARSHIP'],
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

    pdfUrl: String,
    fileName: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', NotificationSchema);
