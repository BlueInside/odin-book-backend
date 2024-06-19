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

    res.status(200).json({ followers: followers });
  } catch (err) {
    return res.status(500).json({ message: 'Error during fetching followers' });
  }
});

const getFollowing = asyncHandler(async (req, res, next) => {
  // Get user id from validation,
  const id = req.user.id;

  res.status(200).json({ message: `Get for /following is not implemented` });
});

module.exports = { getFollowers, getFollowing };
