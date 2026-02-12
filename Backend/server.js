const express = require('express');
const cors = require('cors');
const connectMongo = require('./connectdb');
require('dotenv').config();

const app = express();

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
app.use('/api/Banners', require('./routes/Banners'));
app.use('/api/notifications', require('./routes/Notifications'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/userorders', require('./routes/UserOrders'));

/* 🔹 Server */
const PORT = process.env.PORT || 5000;
app.listen(PORT,() => {
  console.log(`Server running on port ${PORT}`);
});

