const asyncHandler = require('express-async-handler');

const getAllUsers = asyncHandler(async (req, res, next) => {
  res.status(200).send('GET /users not implemented');
});

const getUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  res.status(200).send(`GET /users/${id} not implemented`);
});

const createUser = asyncHandler(async (req, res, next) => {
  const userData = req.body;
  res.status(201).send(`POST /users not implemented`);
});

const updateUser = asyncHandler(async (req, res, next) => {
  // Authenticated users only
  const { id } = req.params;
  res.status(200).send(`PUT /users/${id} not implemented`);
});

const deleteUser = asyncHandler(async (req, res, next) => {
  // Authenticated users only
  const { id } = req.params;
  res.status(204).send(`Delete /users/${id} not implemented`);
});

module.exports = {
  getAllUsers,
  getUser,

  createUser,
  updateUser,
  deleteUser,
};
