const asyncHandler = require('express-async-handler');
const User = require('../models/user');
const Post = require('../models/post');
const mongoose = require('mongoose');

const getAllUsers = asyncHandler(async (req, res, next) => {
  // return list of all users if no search query
  const { q } = req.query;
  const query = {};

  if (q) {
    query.$or = [
      { firstName: { $regex: q, $options: 'i' } },
      { lastName: { $regex: q, $options: 'i' } },
    ];
  }

  const users = await User.find(query, 'firstName lastName')
    .sort({ firstName: 1 })
    .limit(10);

  if (!users.length) {
    return res.status(404).json({ error: 'Users not found.' });
  }

  return res.status(200).json({ users: users });
});

const getUser = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: 'Invalid user ID.' });
  }

  const user = await User.findById(userId).select('-password');

  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  return res.status(200).json({ user: user });
});

const getUserPosts = asyncHandler(async (req, res, next) => {
  // Add pagination and filtering?
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: 'Invalid user ID.' });
  }

  const posts = await Post.find({ user: userId }).sort({ createdAt: 1 });

  if (!posts.length) {
    return res.status(404).json({ error: `This user has no posts yet.` });
  }

  const totalPosts = await Post.countDocuments({ user: userId });

  return res.status(200).json({ posts: posts, totalPosts: totalPosts });
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
