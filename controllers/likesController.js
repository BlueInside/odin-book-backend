const asyncHandler = require('express-async-handler');

const createLike = asyncHandler(async (req, res, next) => {
  res.status(201).send(`POST /likes/ not implemented`);
});

const deleteLike = asyncHandler(async (req, res, next) => {
  res.status(204).send(`DELETE /likes/ not implemented`);
});

module.exports = {
  createLike,
  deleteLike,
};
