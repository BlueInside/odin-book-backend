const asyncHandler = require('express-async-handler');

const getAllPosts = asyncHandler(async (req, res, next) => {
  res.status(200).send('GET /posts not implemented');
});

const getPost = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  res.status(200).send(`GET /posts/${id} not implemented`);
});

const createPost = asyncHandler(async (req, res, next) => {
  const postData = req.body;
  res.status(201).send(`POST /posts not implemented`);
});

const updatePost = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  res.status(200).send(`PUT /posts/${id} not implemented`);
});

const deletePost = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  res.status(204).send(`DELETE /posts/${id} not implemented`);
});

module.exports = {
  getAllPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
};
