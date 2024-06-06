const asyncHandler = require('express-async-handler');

const getAllPosts = asyncHandler(async (req, res, next) => {
  res.status(200).send('GET /posts not implemented');
});

const getPost = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;
  res.status(200).send(`GET /posts/${postId} not implemented`);
});

const getPostLikes = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;
  res.status(200).send(`GET /posts/${postId}/likes not implemented`);
});

const getPostComments = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;
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
