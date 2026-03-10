const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage(), // ✅ IMPORTANT
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
  if (
    file.mimetype === 'application/pdf' ||
    file.mimetype.startsWith('image/')
  ) {
    cb(null, true);
  } else {
    cb(new Error('Only images or PDFs allowed'), false);
  }
}
});

module.exports = upload;
