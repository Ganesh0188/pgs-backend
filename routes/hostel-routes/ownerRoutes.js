const express = require('express');
const router = express.Router();
const ownerController = require('../../controllers/hostel-controllers/ownerController');

// Routes
router.post('/', ownerController.createOwner);
router.get('/', ownerController.getAllOwners);
router.get('/:id', ownerController.getOwnerById);
router.put('/:id', ownerController.updateOwner);
router.delete('/:id', ownerController.deleteOwner);

module.exports = router;
