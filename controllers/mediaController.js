const asyncHandler = require('express-async-handler');
const Media = require('../models/media');

const getMedia = asyncHandler(async (req, res, next) => {
  const { mediaId } = req.params;

  const media = await Media.findById(mediaId);

  if (!media) {
    return res.status(404).json({ message: 'Media not found!' });
  }
  res.status(200).json({ media: media });
});

const createMedia = asyncHandler(async (req, res, next) => {
  const mediaData = req.body;
  res.status(204).send(`POST /media not implemented`);
});

const deleteMedia = asyncHandler(async (req, res, next) => {
  const { mediaId } = req.params;
  res.status(200).send(`DELETE /media/${mediaId} not implemented`);
});

module.exports = {
  getMedia,
  createMedia,
  deleteMedia,
};
