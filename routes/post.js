const express = require('express');
const router = express.Router();
const postsController = require('../controllers/postsController');
const {
  getAllPostsValidation,
  getPostValidation,
  getPostLikesValidation,
  getPostCommentsValidation,
  createPostValidation,
} = require('../lib/postsValidation');
const { authenticateToken } = require('../config/jwt');

router.get(
  '/',
  authenticateToken,
  getAllPostsValidation(),
  postsController.getAllPosts
);

router.get(
  '/:postId',
  authenticateToken,
  getPostValidation(),
  postsController.getPost
);

getPostLikesValidation(),
  router.get(
    '/:postId/likes',
    authenticateToken,
    getPostLikesValidation(),
    postsController.getPostLikes
  );

router.get(
  '/:postId/comments',
  authenticateToken,
  getPostCommentsValidation(),
  postsController.getPostComments
);
router.post(
  '/',
  authenticateToken,
  createPostValidation(),
  postsController.createPost
);
router.put('/', postsController.updatePost);
router.delete('/:postId', postsController.deletePost);

module.exports = router;
