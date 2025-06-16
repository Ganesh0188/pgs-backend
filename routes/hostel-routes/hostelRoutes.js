const express = require('express');
const router = express.Router();
const multer = require('multer');
const hostelController = require('../../controllers/hostel-controllers/hostelController');
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 5MB limit
    files: 5 // Maximum 10 files
  },
  fileFilter: (req, file, cb) => {
    console.log("file ",file);
    console.log("req ",req);
    
    // Accept only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// console.log(upload);


// Routes
// Dashboard endpoints
router.get('/dashboard/:ownerId', hostelController.getOwnerDashboard);
router.get('/:hostelId/dashboard', hostelController.getHostelDashboard);

// Hostel CRUD operations
router.post('/', upload.array('images', 10), hostelController.createHostel);
router.get('/', hostelController.getAllHostels);
router.get('/:id', hostelController.getHostelById);
router.put('/:id', hostelController.updateHostel);
// / Route to get rooms by hostel ID
// router.get('/:hostelId/rooms', hostelDetailsController.getRoomsByHostelId);

// Route to get hostel amenities and location
// router.get('/:hostelId/details', hostelDetailsController.getHostelAmenitiesAndLocation);

// router.get('/:hostelId/min-price', hostelminimumprice.getMinimumPrice);
// router.post('/request', bookingController.requestBooking);





module.exports = router;