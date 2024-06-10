const express = require('express');
const router = express.Router();
const profilesController = require('../controllers/profilesController.js');
const { authenticateToken } = require('../config/jwt.js');

const { getProfileValidation } = require('../lib/profileValidation.js');

router.get(
  '/:userId',
  authenticateToken,
  getProfileValidation(),
  profilesController.getProfile
);
router.put('/', authenticateToken, profilesController.updateProfile);
router.delete('/', profilesController.deleteProfile);

module.exports = router;
