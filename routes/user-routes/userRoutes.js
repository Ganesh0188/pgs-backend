const express = require('express');
const multer = require('multer');
const router = express.Router();
const userController = require('../../controllers/user-controllers/userController');

// Configure multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 2 // Allow up to 2 files (profile photo and identity document)
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Configure file upload fields
const uploadFields = upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'identityDocImage', maxCount: 1 }
]);

// Create a new user
router.post('/', uploadFields, userController.createUser);

// Get all users
router.get('/', userController.getUsers);

// Get user by ID
router.get('/:id', userController.getUserById);

// Update user
router.put('/:id', uploadFields, userController.updateUser);

// Delete user
router.delete('/:id', userController.deleteUser);

module.exports = router;