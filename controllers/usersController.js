const asyncHandler = require('express-async-handler');
const User = require('../models/user');
const Post = require('../models/post');
const Like = require('../models/like');
const mongoose = require('mongoose');
const Follow = require('../models/follow');

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
  const { currentUserId } = req.user.id;

  const user = await User.findById(userId).select('-password');

  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  const isFollowing = await Follow.findOne({
    followed: userId,
    follower: currentUserId,
  });

  user._doc.isFollowedByCurrentUser = !!isFollowing;

  return res.status(200).json({ user: user });
});

const getUserPosts = asyncHandler(async (req, res, next) => {
  // Add pagination and filtering?
  const currentUser = req.user.id;
  const { userId } = req.params;

  const posts = await Post.find({ author: userId })
    .populate('author', 'profilePicture firstName')
    .sort({ createdAt: -1 });

  const totalPosts = await Post.countDocuments({ user: userId });

  const likedPostsIds = await Like.find({ user: currentUser }).select('post');
  const likedPostsSet = new Set(likedPostsIds.map((lp) => lp.post.toString()));

  const postsWithLikes = posts.map((post) => ({
    ...post.toObject(),
    likedByUser: likedPostsSet.has(post._id.toString()),
  }));

  return res.status(200).json({
    posts: postsWithLikes,
    totalPosts: totalPosts,
    likedPosts: likedPostsIds,
  });
});

const getUserLikes = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

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
  const {
    firstName,
    lastName,
    profilePicture,
    bio,
    birthday,
    coverPhoto,
    relationship,
  } = req.body;

  if (req.user.role !== 'admin' && req.user.id !== userId) {
    return res
      .status(403)
      .json({ error: 'You do not have permission to update this profile.' });
  }

  const updates = {
    firstName: firstName,
    lastName: lastName,
    profilePicture: profilePicture,
    bio: bio,
    birthday: birthday ? new Date(birthday) : undefined,
    coverPhoto: coverPhoto,
    relationship: relationship,
  };

  // Remove undefined values
  Object.keys(updates).forEach(
    (key) => updates[key] === undefined && delete updates[key]
  );

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

  if (req.user.role !== 'admin' && req.user.id !== userId) {
    return res
      .status(403)
      .json({ error: 'You do not have permission to delete this profile.' });
  }

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
