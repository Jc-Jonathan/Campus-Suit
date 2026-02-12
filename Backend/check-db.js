const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect('mongodb://localhost:27017/campus-support')
  .then(() => {
    console.log('Connected to MongoDB');
    
    const Notification = require('./models/Notification');
    
    // Check for misspelled categories
    Notification.find({ category: 'ANNOUNCEMENT' })
      .then(notifications => {
        console.log('Found ANNOUNCEMENT (correct):', notifications.length);
      })
      .catch(err => console.error('Error finding ANNOUNCEMENT:', err));
    
    Notification.find({ category: 'ANNOUNCEMENT' })
      .then(notifications => {
        console.log('Found ANNOUNCEMENT (misspelled):', notifications.length);
        if (notifications.length > 0) {
          console.log('Sample misspelled notification:', JSON.stringify(notifications[0], null, 2));
        }
      })
      .catch(err => console.error('Error finding ANNOUNCEMENT:', err));
    
    setTimeout(() => process.exit(0), 2000);
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });
