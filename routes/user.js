const express = require('express');
const router = express.Router();
const userController = require('../controllers/usersController');

router.get('/', userController.getAllUsers);
router.get('/:userId', userController.getUser);
router.get('/:userId/posts', userController.getUserPosts);
router.get('/:userId/likes', userController.getUserLikes);
router.post('/', userController.createUser);
router.delete('/:userId', userController.deleteUser);

module.exports = router;