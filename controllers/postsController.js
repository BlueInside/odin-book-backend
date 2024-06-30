const asyncHandler = require('express-async-handler');
const Post = require('../models/post');
const Like = require('../models/like');
const Comment = require('../models/comment');
const Follow = require('../models/follow');

const getPersonalizedPosts = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const userId = req.user.id;

  const follows = await Follow.find({ follower: userId }, 'followed');
  const followedIds = follows.map((follow) => follow.followed);

  const allRelevantUserIds = [userId, ...followedIds];

  let posts = await Post.find({
    author: { $in: allRelevantUserIds },
  })
    .populate('author', 'profilePicture firstName')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  if (posts.length < limit) {
    const extraPostsNeeded = limit - posts.length;
    const randomPosts = await Post.find({
      author: { $nin: allRelevantUserIds },
    })
      .populate('author', 'profilePicture firstName')
      .sort({ createdAt: -1 })
      .limit(extraPostsNeeded);

    posts = [...posts, ...randomPosts];
  }

  return res.status(200).json({
    posts: posts,
    page: page,
    pageSize: posts.length,
  });
});

const getPost = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;

  const post = await Post.findById(postId).populate(
    'author',
    'firstName profilePicture'
  );
  if (!post) {
    return res.status(404).json({ message: 'Post not found!' });
  }

  const comments = await Comment.find({ post: postId }).populate(
    'author',
    'firstName'
  );
  if (!comments) {
    return res.status(404).json({ message: 'Comments not found!' });
  }
  return res.status(200).json({ post, comments });
});

const getPostLikes = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;

  const likes = await Like.find({ post: postId });

  if (!likes) {
    return res.status(404).json({ message: 'No likes found for this post!' });
  }

  return res.status(200).json({ likesCount: likes.length, likes: likes });
});

const getPostComments = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;

  const comments = await Comment.find({ post: postId }).populate(
    'author',
    'firstName'
  );

  if (!comments) {
    return res
      .status(404)
      .json({ message: 'No comments found for this post!' });
  }

  return res
    .status(200)
    .json({ commentsCount: comments.length, comments: comments });
});

const createPost = asyncHandler(async (req, res, next) => {
  const { content } = req.body;
  const author = req.user.id;

  const newPost = new Post({
    content,
    author,
  });

  const savedPost = await newPost.save();

  return res.status(201).json({ post: savedPost });
});

const updatePost = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;
  const { content } = req.body;

  const post = await Post.findById(postId);

  if (!post) {
    return res.status(404).json({ message: `Post not found!` });
  }

  if (post.author.toString() !== req.user.id.toString()) {
    return res
      .status(403)
      .json({ message: 'User not authorized to update this post!' });
  }

  post.content = content || post.content;
  const updatedPost = await post.save();

  return res.status(200).json({ post: updatedPost });
});

const deletePost = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;

  const post = await Post.findById(postId);

  if (!post) {
    return res.status(404).json({ message: 'Post not found!' });
  }

  if (
    post.author.toString() !== req.user.id.toString() &&
    req.user.role !== 'admin'
  ) {
    return res
      .status(403)
      .json({ message: 'User not authorized to delete this post!' });
  }

  const deletedPost = await Post.findByIdAndDelete(postId);

  return res
    .status(200)
    .json({ message: 'Post deleted', deletedPost: deletedPost });
});

module.exports = {
  getPersonalizedPosts,
  getPost,
  getPostLikes,
  getPostComments,
  createPost,
  updatePost,
  deletePost,
};
