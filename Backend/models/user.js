const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    userId: {
      type: Number,
      unique: true,
      index: true,
    },

    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    country: { type: String, required: true },
    phoneCode: { type: String, required: true }, // +263, +91, etc
    phoneNumber: { type: String, required: true },

    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);

// Check if the model has already been defined
module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
