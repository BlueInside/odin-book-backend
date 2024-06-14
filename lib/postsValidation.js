const { query, param, body, validationResult } = require('express-validator');
const isValid = require('mongoose').Types.ObjectId.isValid;

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  return next();
};

const isMongoId = (value, { req }) => {
  if (!isValid(value)) {
    throw new Error('Invalid id string');
  }
  return true;
};

const getAllPostsValidation = () => [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be a number between 1 and 100.'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a number greater than 0.'),
  validate,
];

const getPostValidation = () => [
  param('postId')
    .custom(isMongoId)
    .withMessage('Post ID must be a valid MongoDB ObjectId.'),
  validate,
];

const getPostLikesValidation = () => [
  param('postId')
    .custom(isMongoId)
    .withMessage('Post ID must be a valid MongoDB ObjectId.'),

  validate,
];

const getPostCommentsValidation = () => [
  param('postId')
    .isMongoId()
    .withMessage('Post ID must be a valid MongoDB ObjectId.'),
  validate,
];

const createPostValidation = () => [
  body('content')
    .notEmpty()
    .withMessage('Content is required.')
    .isString()
    .withMessage('Content must be a string.')
    .trim(),
  validate,
];

const updatePostValidation = () => [
  param('postId')
    .isMongoId()
    .withMessage('Post ID must be a valid MongoDB ObjectId.'),
  body('content')
    .optional()
    .isString()
    .withMessage('Content must be a string.')
    .trim(),
  validate,
];

module.exports = {
  getAllPostsValidation,
  getPostValidation,
  getPostLikesValidation,
  getPostCommentsValidation,
  createPostValidation,
  updatePostValidation,
};
