const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../config/jwt');
const {
  unfollowValidation,
  followValidation,
} = require('../lib/followValidation');
const followersController = require('../controllers/followersController');

router.get('/followers', authenticateToken, followersController.getFollowers);
router.get('/following', authenticateToken, followersController.getFollowing);
router.post(
  '/follow',
  authenticateToken,
  followValidation(),
  followersController.follow
);
router.delete(
  '/unfollow',
  authenticateToken,
  unfollowValidation(),
  followersController.unfollow
);

module.exports = router;
