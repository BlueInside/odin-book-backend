const asyncHandler = require('express-async-handler');
const User = require('../models/user');
const Post = require('../models/post');
const Like = require('../models/like');
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

  const user = await User.findById(userId).select('-password');

  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  return res.status(200).json({ user: user });
});

const getUserPosts = asyncHandler(async (req, res, next) => {
  // Add pagination and filtering?
  const { userId } = req.params;

  const posts = await Post.find({ user: userId }).sort({ createdAt: 1 });

  if (!posts.length) {
    return res.status(404).json({ error: `This user has no posts yet.` });
  }

  const totalPosts = await Post.countDocuments({ user: userId });

  return res.status(200).json({ posts: posts, totalPosts: totalPosts });
});

const getUserLikes = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: 'Invalid user ID.' });
  }

  const likes = await Like.find({ user: userId }).populate('post');

  if (!likes.length) {
    return res.status(404).json({ error: `This user has no liked posts yet.` });
  }

  const likesCount = await Like.countDocuments({ user: userId });

  return res.status(200).json({ likes: likes, likesCount: likesCount });
});

// WIll use Github Oath2 to create users
const createUser = asyncHandler(async (req, res, next) => {
  // Validate sanitize body!
  return res.status(201).json({ message: 'Not implemented!' });
});

const updateUser = asyncHandler(async (req, res, next) => {
  // Sanitize and validate input!
  // Authenticated users only
  const { userId } = req.params;
  const { firstName, lastName, profilePicture, bio } = req.body;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: 'Invalid user ID.' });
  }

  /*
   Authenticate that the logged-in user matches the userId in params
   DISABLED WHILE PASSPORT IS NOT SET UP!
   if (req.session.userId !== userId) {
    return res
     .status(403)
      .json({ error: 'You do not have permission to update this profile.' });
    }
  */

  const updates = {
    firstName: firstName,
    lastName: lastName || '',
    profilePicture: profilePicture || '',
    bio: bio || '',
  };

  try {
    // Find by ID and update the user
    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true, // Return the modified document rather than the original
    });

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.status(200).json({ user: updatedUser });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'This email is already in use.' });
    }
    return res
      .status(500)
      .json({ error: 'Something went wrong during the update.' });
  }
});

const deleteUser = asyncHandler(async (req, res, next) => {
  // Authenticated users only
  const { userId } = req.params;

  /*
  if (req.session.userId !== userId) {
    return res
      .status(403)
      .json({ error: 'You do not have permission to delete this profile.' });
  } */

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const anonymizedUser = await User.findByIdAndUpdate(
      userId,
      {
        firstName: 'Anonymous',
        lastName: '',
        email: `no-reply@example.com${Date.now()}`,
        isActive: false,
        profilePicture: '',
        bio: '',
      },
      { new: true }
    );

    if (!anonymizedUser) {
      return res.status(404).json({ error: 'Unable to anonymize user.' });
    }

    // Send successful response
    return res.status(200).json({ user: anonymizedUser });
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Something went wrong during the deletion process.' });
  }
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
