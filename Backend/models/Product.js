const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    productId: {
      type: Number,
      unique: true,
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    imageUrl: {
      type: String,
      required: true,
    },

    newPrice: {
      type: Number,
      required: true,
    },

    oldPrice: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', ProductSchema);
