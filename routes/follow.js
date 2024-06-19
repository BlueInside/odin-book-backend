const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../config/jwt');

const followersController = require('../controllers/followersController');

router.get('/followers', authenticateToken, followersController.getFollowers);
router.get('/following', authenticateToken, followersController.getFollowing);

module.exports = router;
