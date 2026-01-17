const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema(
  {
    orderId: { type: Number, unique: true },

    productName: String,
    productImage: String,

    quantity: { type: Number, default: 1 },
    totalPrice: Number,

    email: String,
    phoneNumber: String,
    address: String,

    paymentImage: String, // base64 or image URL
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', OrderSchema);
