const express = require('express');
const router = express.Router();
const profilesController = require('../controllers/profilesController.js');
const { authenticateToken } = require('../config/jwt.js');

const {
  getProfileValidation,
  updateProfileValidation,
  createProfileValidation,
  deleteProfileValidation,
} = require('../lib/profileValidation.js');

router.get(
  '/:userId',
  authenticateToken,
  getProfileValidation(),
  profilesController.getProfile
);

router.post(
  '/',
  authenticateToken,
  createProfileValidation(),
  profilesController.createProfile
);

router.put(
  '/:profileId',
  authenticateToken,
  updateProfileValidation(),
  profilesController.updateProfile
);

router.delete(
  '/:profileId',
  authenticateToken,
  deleteProfileValidation(),
  profilesController.deleteProfile
);

module.exports = router;
