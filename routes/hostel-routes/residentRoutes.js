const express = require('express');
const multer = require('multer');
const router = express.Router();
const residentController= require('../../controllers/hostel-controllers/residentController');

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

// Get available payment methods
router.get('/payment-methods', residentController.getPaymentMethods);

// Get resident statistics for a hostel
router.get('/statistics/:hostelId', residentController.getResidentStatistics);

// Search residents in a hostel
router.get('/search/:hostelId', residentController.searchResidents);

// Get all residents for a hostel
router.get('/hostel/:hostelId', residentController.getResidentsByHostel);

// Create a new resident
router.post('/', uploadFields, residentController.createResident);

// Get residents by room ID
router.get('/room/:roomId', residentController.getResidentsByRoom);

// Get detailed resident information with payment history
router.get('/details/:id', residentController.getResidentDetails);

// Record new payment for a resident
router.post('/:residentId/payments', residentController.recordPayment);

// Get resident by ID
router.get('/:id', residentController.getResidentById);
// Update resident details
router.put('/:id', residentController.updateResident);

// Delete a resident
router.delete('/:id', residentController.deleteResident);

// router.get('/:residentId/dashboard', getResidentDashboard);
// router.get('/:residentId/payments', getResidentPaymentHistory);
// router.post('/:residentId/payments', createPayment);
// router.get('/previous-stays/:userId', residentpreviousstays.getPreviousStays);
// router.get('/summary/:userId', residentsummery.getResidentSummary);
// router.get('/profile/:userId', getresidentController.getResidentProfile);


// router.get('/:residentId/payments/dashboard',residentpaymentdashboard. getResidentPaymentDashboard);
// router.get('/:residentId/payments/history',residentpaymenthistory.getResidentPaymentHistory);
// Add near other routes
// router.get('/:residentId/notifications', residentnotifications.getResidentNotifications);

// router.get('/:residentId/payments/due', paymentduenotification.getPaymentDueNotification);


module.exports = router;
