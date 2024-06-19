const express = require('express');
const router = express.Router();
const commentsController = require('../controllers/commentsController');
const { authenticateToken } = require('../config/jwt');
const {
  createCommentValidation,
  deleteCommentValidation,
} = require('../lib/commentValidation');

router.post(
  '/comments',
  authenticateToken,
  createCommentValidation(),
  commentsController.createComment
);
router.delete(
  '/comments',
  authenticateToken,
  deleteCommentValidation(),
  commentsController.deleteComment
);

module.exports = router;
