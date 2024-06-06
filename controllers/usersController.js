const asyncHandler = require('express-async-handler');

const getAllUsers = asyncHandler(async (req, res, next) => {
  res.status(200).send('GET /users not implemented');
});

const getUser = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  res.status(200).send(`GET /users/${userId} not implemented`);
});

const getUserPosts = asyncHandler(async (req, res, next) => {
  // Add pagination and filtering?
  const { userId } = req.params;
  res.status(200).send(`GET /users/${userId}/posts not implemented`);
});

const getUserLikes = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  res.status(200).send(`GET /users/${userId}/likes not implemented`);
});
const createUser = asyncHandler(async (req, res, next) => {
  const userData = req.body;
  res.status(201).send(`POST /users not implemented`);
});

const updateUser = asyncHandler(async (req, res, next) => {
  // Authenticated users only
  const { userId } = req.params;
  res.status(200).send(`PUT /users/${userId} not implemented`);
});

const deleteUser = asyncHandler(async (req, res, next) => {
  // Authenticated users only
  const { userId } = req.params;
  res.status(204).send(`Delete /users/${userId} not implemented`);
});

module.exports = {
  getAllUsers,
  getUser,
  getUserPosts,
  getUserLikes,
  createUser,
  updateUser,
  deleteUser,
};
