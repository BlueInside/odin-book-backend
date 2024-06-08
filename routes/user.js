const express = require('express');
const router = express.Router();
const userController = require('../controllers/usersController');
const {
  getAllUsersValidation,
  getUserValidation,
  getUserPostsValidation,
  getUserLikesValidation,
} = require('../lib/userValidation');

router.get('/', getAllUsersValidation(), userController.getAllUsers);

router.get('/:userId', getUserValidation(), userController.getUser);

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

router.post('/', userController.createUser);

router.put('/:userId', userController.updateUser);

router.delete('/:userId', userController.deleteUser);

module.exports = router;
