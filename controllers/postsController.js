const asyncHandler = require('express-async-handler');
const Post = require('../models/post');
const Like = require('../models/like');

const getAllPosts = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const query = {};

  const posts = await Post.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return res
    .status(200)
    .json({ posts: posts, page: page, pageSize: posts.length });
});

const getPost = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;

  const post = await Post.findById(postId);

  if (!post) {
    return res.status(404).json({ message: 'Post not found!' });
  }

  return res.status(200).json({ post });
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

  const likes = Like;
  res.status(200).send(`GET /posts/${postId}/comments not implemented`);
});

const createPost = asyncHandler(async (req, res, next) => {
  const postData = req.body;
  res.status(201).send(`POST /posts not implemented`);
});

const updatePost = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;
  res.status(200).send(`PUT /posts/${postId} not implemented`);
});

const deletePost = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;
  res.status(204).send(`DELETE /posts/${postId} not implemented`);
});

module.exports = {
  getAllPosts,
  getPost,
  getPostLikes,
  getPostComments,
  createPost,
  updatePost,
  deletePost,
};
