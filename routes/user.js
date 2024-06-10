const express = require('express');
const router = express.Router();
const userController = require('../controllers/usersController');
const {
  getAllUsersValidation,
  getUserValidation,
  getUserPostsValidation,
  getUserLikesValidation,
  updateUserValidation,
  deleteUserValidation,
} = require('../lib/userValidation');
const { authenticateToken } = require('../config/jwt');

router.get('/', getAllUsersValidation(), userController.getAllUsers);

router.get(
  '/:userId',
  authenticateToken,
  getUserValidation(),
  userController.getUser
);

router.get(
  '/:userId/posts',
  getUserPostsValidation(),
  userController.getUserPosts
);

router.get(
  '/:userId/likes',
  getUserLikesValidation(),
  userController.getUserLikes
);

router.put(
  '/:userId',
  authenticateToken,
  updateUserValidation(),
  userController.updateUser
);

router.delete(
  '/:userId',
  authenticateToken,
  deleteUserValidation(),
  userController.deleteUser
);

module.exports = router;
