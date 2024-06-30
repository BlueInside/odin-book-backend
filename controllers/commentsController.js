const asyncHandler = require('express-async-handler');
const Comment = require('../models/comment');
const Post = require('../models/post');

const createComment = asyncHandler(async (req, res, next) => {
  const authorId = req.user.id;
  const { content, postId } = req.body;

  try {
    const comment = new Comment({
      author: authorId,
      post: postId,
      content: content,
    });

    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({ message: 'Post not found.' });
      return;
    }
    post.comments.push(comment._id);

    await post.save();
    await comment.save();

    res
      .status(201)
      .json({ message: 'Comment successfully added.', comment: comment });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add comment.' });
  }
});

const deleteComment = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const { postId, commentId } = req.body;

  const existingComment = await Comment.findById(commentId);

  if (!existingComment) {
    return res.status(404).json({ message: 'Comment not found.' });
  }

  if (
    existingComment.author.toString() !== userId &&
    req.user.role !== 'admin'
  ) {
    return res
      .status(403)
      .json({ message: 'Not authorized to delete this comment.' });
  }

  await Comment.findByIdAndDelete(commentId);
  await Post.findByIdAndUpdate(postId, { $pull: { comments: commentId } });

  res.status(200).json({ message: 'Comment deleted successfully.' });
});

module.exports = {
  createComment,
  deleteComment,
};
