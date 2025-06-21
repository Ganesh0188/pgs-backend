const express = require('express');
const multer = require('multer');
const router = express.Router();
const {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
getResidentDashboard,
  createPayment,
  getUserProfileByResidentId,
  updateUserProfileByResidentId,
  getPaymentSummaryAndHistory,
  getUserNotificationsAndPaymentDue,
  getCombinedHostelInfoByHostelId,
  bookRoom,
  // getHostelDetailsByHostelId,
  getHostelsListForUser,
  getPreviousStaysByUserId
  

} = require('../../controllers/user-controllers/userController');

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

router.post('/', uploadFields, createUser);
router.get('/', getUsers);

router.put('/:id', uploadFields, updateUser);
router.delete('/:id', deleteUser);
router.get('/:id/dashboard', getResidentDashboard);

router.post('/:id/payments', createPayment);

// Get resident profile using residentId
router.get('/profile/:residentId', getUserProfileByResidentId);

// Update resident profile
router.put('/profile/:residentId', updateUserProfileByResidentId);
// / Combined summary + history API
router.get('/summary/:residentId', getPaymentSummaryAndHistory);

router.get('/:residentId/notifications', getUserNotificationsAndPaymentDue);
router.get('/hostels/:hostelId', getCombinedHostelInfoByHostelId);

router.post('/:userId/bookings', bookRoom);


// router.get('/details/:hostelId', getHostelDetailsByHostelId);

router.get('/hostels', getHostelsListForUser);
router.get('/:id', getUserById);
router.get('/:userId/previous-stays', getPreviousStaysByUserId); 
module.exports = router;