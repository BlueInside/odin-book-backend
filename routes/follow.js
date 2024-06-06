const express = require('express');
const router = express.Router();

const followersController = require('../controllers/followersController');

router.get('/followers', followersController.getFollowers);
router.get('/following', followersController.getFollowing);

module.exports = router;
