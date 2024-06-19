const asyncHandler = require('express-async-handler');
const Follow = require('../models/follow');

const getFollowers = asyncHandler(async (req, res, next) => {
  // Get user id from validation,
  const id = req.user.id;

  try {
    const followers = await Follow.find({ followed: id }).populate('follower');

    if (!followers || followers.length === 0) {
      return res.status(404).json({ message: 'No followers found.' }); // More accurate message if no followers are found
    }

    res
      .status(200)
      .json({ followers: followers, followersCount: followers.length });
  } catch (err) {
    return res.status(500).json({ message: 'Error during fetching followers' });
  }
});

const getFollowing = asyncHandler(async (req, res, next) => {
  // Get user id from validation,
  const id = req.user.id;

  try {
    const followed = await Follow.find({ follower: id }).populate(
      'followed',
      'firstName profilePicture -githubId -_id'
    );

    if (!followed.length) {
      return res
        .status(404)
        .json({ message: 'You are not following anyone at the moment.' });
    }

    res.status(200).json({ followed: followed, followedCount: followed.count });
  } catch (err) {
    return res
      .status(500)
      .json({ message: 'Error during fetching followed users' });
  }
});

module.exports = { getFollowers, getFollowing };
