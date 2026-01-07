const express = require('express');
const cors = require('cors');
const connectMongo = require('./connectdb');
require('dotenv').config();

const app = express();

/* 🔹 Middleware */
// Update CORS configuration in server.js
app.use(cors({
  origin: [
    'http://localhost:19006', 
    'http://192.168.31.130:19006', 
    'exp://192.168.31.130:19000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // 🔴 REQUIRED for form-data

/* 🔹 Connect to MongoDB */
connectMongo();

/* 🔹 Health check */
app.get('/', (req, res) => {
  res.send('Campus Support Suit API is running');
});

/* 🔹 Routes */
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/scholarships', require('./routes/scholarships'));
app.use('/api/scholarshipApplications', require('./routes/scholarshipApplications'));

/* 🔹 Serve uploaded files */
app.use('/uploads', express.static('uploads'));

/* 🔹 Server */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
