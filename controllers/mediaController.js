const asyncHandler = require('express-async-handler');

const getMedia = asyncHandler(async (req, res, next) => {
  const { mediaId } = req.params;
  res.status(200).send(`GET /media/${mediaId} not implemented`);
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
