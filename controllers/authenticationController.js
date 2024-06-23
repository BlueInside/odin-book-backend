const asyncHandler = require('express-async-handler');

const verify = asyncHandler(async (req, res, next) => {
  res.status(200).json({ message: 'Valid token', user: req.user });
});

module.exports = { verify };
