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

const createProfile = asyncHandler(async (req, res, next) => {
  const { userId, birthday, interests, hobby } = req.body;

  if (req.user.role !== 'admin' && req.user.id !== userId) {
    return res
      .status(403)
      .json({ error: 'You do not have permission to delete this profile.' });
  }

  const newProfile = new Profile({
    user: userId,
    birthday: new Date(birthday),
    interests,
    hobby,
  });

  const createdProfile = await newProfile.save();

  return res.status(201).json({ profile: createdProfile });
});

const updateProfile = asyncHandler(async (req, res, next) => {
  const { profileId } = req.params;
  const { birthday, interests, hobby } = req.body;

  const updates = {};

  if (birthday !== undefined) updates.birthday = new Date(birthday);
  if (interests !== undefined) updates.interests = interests;
  if (hobby !== undefined) updates.hobby = hobby;

  const profile = await Profile.findByIdAndUpdate(profileId, updates, {
    new: true,
  });

  if (!profile) {
    return res.status(404).json({ message: 'Profile not found!' });
  }

  return res.status(200).json({ profile });
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
  createProfile,
  updateProfile,
  deleteProfile,
};
