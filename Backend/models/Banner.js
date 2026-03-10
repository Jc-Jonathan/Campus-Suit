const mongoose = require('mongoose');

const BannerSchema = new mongoose.Schema({
  title: String,

  imageUrl: {
    type: String,
    required: true,
  },

  // ✅ NEW: Cloudinary fields
  publicId: {
    type: String,
    required: false,
  },

  screen: {
    type: String,
    enum: [
      'HOME',
      'LOAN_DETAIL',
      'CHECKOUT'
    ],
    required: true,
  },

  position: {
    type: String,
    enum: [
      'CAROUSEL',     // Home top slider
      'HERO',         // Loan detail hero
      'QR_PAYMENT'   // Checkout QR
    ],
    required: true,
  },

  isActive: {
    type: Boolean,
    default: true,
  },

  priority: {
    type: Number,
    default: 1,
  }
}, { timestamps: true });

module.exports = mongoose.model('Banner', BannerSchema);
