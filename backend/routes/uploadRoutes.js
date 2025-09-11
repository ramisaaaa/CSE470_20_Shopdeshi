const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '..', 'upload/images');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_req, file, cb) => cb(null, `image_${Date.now()}${path.extname(file.originalname)}`),
});

const upload = multer({ storage });

router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: 0, message: 'No file uploaded' });
  const imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
  res.json({ success: 1, image_url: imageUrl });
});

module.exports = router;


