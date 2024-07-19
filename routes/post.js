const express = require('express');
const router = express.Router();
const postsController = require('../controllers/postsController');
const { uploadPostImage } = require('../lib/multer');
const {
  getAllPostsValidation,
  getPostValidation,
  getPostLikesValidation,
  getPostCommentsValidation,
  createPostValidation,
  updatePostValidation,
  deletePostValidation,
} = require('../lib/postsValidation');
const { authenticateToken } = require('../config/jwt');

router.get(
  '/',
  authenticateToken,
  getAllPostsValidation(),
  postsController.getPersonalizedPosts
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
  uploadPostImage,
  createPostValidation(),
  postsController.createPost
);
router.put(
  '/:postId',
  authenticateToken,
  updatePostValidation(),
  postsController.updatePost
);
router.delete(
  '/:postId',
  authenticateToken,
  deletePostValidation(),
  postsController.deletePost
);

module.exports = router;
