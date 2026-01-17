const express = require('express');
const cors = require('cors');
const connectMongo = require('./connectdb');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'public', 'uploads');
const loansDir = path.join(uploadsDir, 'loans');

// Create directories if they don't exist
[uploadsDir, loansDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

/* 🔹 Middleware */
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
app.use('/api/loans', require('./routes/Loans'));
app.use('/api/loanApplys', require('./routes/LoanApplys'));
app.use('/api/products', require('./routes/Products'));
app.use('/api/orders', require('./routes/Orders'));
app.use('/api/Banners', require('./routes/Banners'));


/* 🔹 Serve uploaded files */
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Log static file serving configuration
console.log('Serving static files from:', path.join(__dirname, 'public', 'uploads'));

/* 🔹 Server */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
