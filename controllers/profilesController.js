const asyncHandler = require('express-async-handler');
const Profile = require('../models/profile');

const getProfile = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  const profile = await Profile.findOne({ user: userId });

  if (!profile) {
    return res.status(404).json({ message: 'Profile not found!' });
  }

  return res.status(200).json({ profile: profile });
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
