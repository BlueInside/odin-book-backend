const express = require('express');
const router = express.Router();
const profilesController = require('../controllers/profilesController.js');

router.get('/', profilesController.getProfile);
router.put('/', profilesController.updateProfile);
router.delete('/', profilesController.deleteProfile);

module.exports = router;
