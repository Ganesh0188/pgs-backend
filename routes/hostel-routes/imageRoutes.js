const express = require('express');
const router = express.Router();
const multer = require('multer');
const imageController = require('../../controllers/hostel-controllers/imageController');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 5MB limit
    files: 10 // Maximum 10 files
  },
  fileFilter: (req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});
// console.log("upload ",upload);


// Image routes
router.post('/upload', upload.array('images', 10), imageController.uploadImages);
router.delete('/:hostelId/image', imageController.deleteImage);
router.get('/:hostelId/images', imageController.getImages);

module.exports = router;