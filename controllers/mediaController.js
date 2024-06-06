const asyncHandler = require('express-async-handler');

const getMedia = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  res.status(200).send(`GET /media/${id} not implemented`);
});

const createMedia = asyncHandler(async (req, res, next) => {
  const mediaData = req.body;
  res.status(204).send(`POST /media not implemented`);
});

module.exports = {
  getMedia,
  createMedia,
};
