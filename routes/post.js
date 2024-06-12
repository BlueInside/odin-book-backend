const express = require('express');
const router = express.Router();
const postsController = require('../controllers/postsController');
const { getAllPostsValidation } = require('../lib/postsValidation');
const { authenticateToken } = require('../config/jwt');

router.get(
  '/',
  authenticateToken,
  getAllPostsValidation(),
  postsController.getAllPosts
);

router.get('/:postId', postsController.getPost);
router.get('/:postId/likes', postsController.getPostLikes);
router.get('/:postId/comments', postsController.getPostComments);
router.post('/', postsController.createPost);
router.put('/', postsController.updatePost);
router.delete('/:postId', postsController.deletePost);

module.exports = router;
