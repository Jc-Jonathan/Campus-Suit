const mongoose = require('mongoose');

const UserOrderSchema = new mongoose.Schema(
  {
    orderId: { type: Number, unique: true },
    
    // Customer information
    name: String,
    email: String,
    phoneNumber: String,
    address: String,
    
    // Array of products in this order
    items: [{
      productName: String,
      productImage: String,
      quantity: Number,
      price: Number, // individual product price
    }],
    
    // Order totals
    subtotal: Number,
    totalAmount: Number,
    
    // Payment proof document URL
    paymentDocumentUrl: String,
    
    // Order status
    status: { type: String, default: 'pending' }, // pending, confirmed, shipped, delivered, cancelled
  },
  { timestamps: true }
);

module.exports = mongoose.model('UserOrder', UserOrderSchema);