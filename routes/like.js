const express = require('express');
const router = express.Router();
const likesController = require('../controllers/likesController');
const { authenticateToken } = require('../config/jwt');
const {
  createLikeValidation,
  deleteLikeValidation,
} = require('../lib/likeValidation');

router.post(
  '/',
  authenticateToken,
  createLikeValidation(),
  likesController.createLike
);

router.delete(
  '/',
  authenticateToken,
  deleteLikeValidation(),
  likesController.deleteLike
);

module.exports = router;
