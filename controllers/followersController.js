const asyncHandler = require('express-async-handler');

const getFollowers = asyncHandler(async (req, res, next) => {
  // Get user id from validation,
  const id = req.user.id;

  res.status(200).json({ message: `Get for /followers is not implemented` });
});

const getFollowing = asyncHandler(async (req, res, next) => {
  // Get user id from validation,
  const id = req.user.id;

  res.status(200).json({ message: `Get for /following is not implemented` });
});

module.exports = { getFollowers, getFollowing };
