const asyncHandler = require('express-async-handler');

const createComment = asyncHandler(async (req, res, next) => {
  res.status(201).send(`POST /comments/ not implemented`);
});

const deleteComment = asyncHandler(async (req, res, next) => {
  res.status(204).send(`DELETE /comments/ not implemented`);
});

module.exports = {
  createComment,
  deleteComment,
};
