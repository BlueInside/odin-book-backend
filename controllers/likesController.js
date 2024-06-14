const asyncHandler = require('express-async-handler');
const Like = require('../models/like');
const Post = require('../models/post');

const createLike = asyncHandler(async (req, res, next) => {
  const { postId, userId } = req.body;

  const post = await Post.findById(postId);
  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }

  const existingLike = await Like.findOne({ post: postId, user: userId });
  if (existingLike) {
    return res
      .status(400)
      .json({ message: 'You have already liked this post' });
  }

  const like = new Like({ post: postId, user: userId });
  await like.save();

  await post.incrementLikes();

  res.status(201).json({ message: 'Like created successfully' });
});

const deleteLike = asyncHandler(async (req, res, next) => {
  res.status(204).send(`DELETE /likes/ not implemented`);
});

module.exports = {
  createLike,
  deleteLike,
};
