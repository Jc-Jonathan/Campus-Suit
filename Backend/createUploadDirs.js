const fs = require('fs');
const path = require('path');

// Define all the upload directories we need
const baseDir = path.join(__dirname, 'public', 'uploads');
const directories = [
  path.join(baseDir, 'notifications'),
  path.join(baseDir, 'documents'),
  path.join(baseDir, 'loans'),
  path.join(baseDir, 'scholarships')
];

// Create each directory if it doesn't exist
directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  } else {
    console.log(`Directory already exists: ${dir}`);
  }
});

console.log('All upload directories are ready!');
