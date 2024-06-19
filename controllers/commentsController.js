const asyncHandler = require('express-async-handler');
const Comment = require('../models/comment');

const createComment = asyncHandler(async (req, res, next) => {
  const authorId = req.user.id;
  const { content, postId } = req.body;

  try {
    const comment = new Comment({
      author: authorId,
      post: postId,
      content: content,
    });

    await comment.save();
    res.status(201).json({ message: 'Comment successfully added.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add comment.' });
  }
});

const deleteComment = asyncHandler(async (req, res, next) => {
  res.status(204).send(`DELETE /comments/ not implemented`);
});

module.exports = {
  createComment,
  deleteComment,
};
