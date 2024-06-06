const asyncHandler = require('express-async-handler');

const getProfile = asyncHandler(async (req, res, next) => {
  return res.status(200).send('Get profile controller is NOT IMPLEMENTED');
});

const updateProfile = asyncHandler(async (req, res, next) => {
  // Only authenticated users
  const { id } = req.params;
  return res
    .status(200)
    .send(`Update profile ${id} controller is NOT IMPLEMENTED`);
});

const deleteProfile = asyncHandler(async (req, res, next) => {
  // Only authenticated users
  const { id } = req.params;
  return res
    .status(200)
    .send(`Delete profile ${id} controller is NOT IMPLEMENTED`);
});

module.exports = {
  getProfile,
  updateProfile,
  deleteProfile,
};
