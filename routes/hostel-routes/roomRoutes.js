const express = require('express');
const router = express.Router();
const roomController = require('../../controllers/hostel-controllers/roomController');

// Room routes
router.post('/', roomController.createRoom);
router.get('/room/:hostelId', roomController.getRoomsByHostel);
router.get('/types/:hostelId', roomController.getRoomTypes);
router.get('/room-types/:hostelId', roomController.getRoomTypesByHostel);
router.get('/available/:hostelId', roomController.getAvailableRooms);


// Room management routes
router.get('/statistics/:hostelId', roomController.getRoomStatistics);
router.get('/search/:hostelId', roomController.searchRooms);
router.patch('/:roomId/status', roomController.updateRoomStatus);

// Room update and delete routes
router.put('/:roomId', roomController.updateRoom);
router.delete('/:roomId', roomController.deleteRoom);


module.exports = router;