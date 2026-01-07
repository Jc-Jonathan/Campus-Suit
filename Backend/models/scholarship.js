const mongoose = require('mongoose');

const scholarshipSchema = new mongoose.Schema({
  scholarshipId: {
    type: Number,
    unique: true,
  },
  title: String,
  description: String,
  deadline: String,
  amount: Number,
  percentage: Number,
  courseFileUrl: String,
});

module.exports = mongoose.model('Scholarship', scholarshipSchema);
