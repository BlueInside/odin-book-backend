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

const uploadMedia = asyncHandler(async (req, res, next) => {
  // Will have to use multer middleware to post data to cloud storage
  // Then url from cloud storage will be used as url
  // TODO ADD MULTER AUTHENTICATION TEST VALIDATION!!!
  const { type, post } = req.body;
  const mediaData = {
    type,
    post,
    url: 'someUrl.com',
    createdBy: req.user.id,
  };

  const media = new Media({
    type: mediaData.type,
    url: mediaData.url,
    createdBy: mediaData.createdBy,
    post: mediaData.post,
  });

  if (!media) {
    res.status(400).json({ message: 'Error uploading media' });
  }
  return res
    .status(204)
    .send({ message: 'media uploaded successfully', media: Media });
});

const deleteMedia = asyncHandler(async (req, res, next) => {
  const { mediaId } = req.params;
  res.status(200).send(`DELETE /media/${mediaId} not implemented`);
});

module.exports = {
  getMedia,
  uploadMedia,
  deleteMedia,
};
