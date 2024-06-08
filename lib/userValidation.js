const { body, param, query, validationResult } = require('express-validator');
const isValid = require('mongoose').Types.ObjectId.isValid;
const isMongoId = (value, { req }) => {
  if (!isValid(value)) {
    throw new Error('Invalid id string');
  }
  return true;
};

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() }); // Don't send details about validation errors
  }
  return next();
};

const getAllUsersValidation = () => [
  query('q')
    .optional() // Make it optional
    .isLength({ min: 1, max: 50 })
    .withMessage('Search query must be between 1 and 50 characters long')
    .isAlphanumeric('en-US', { ignore: ' -' })
    .withMessage('Search query contains invalid characters'),

  validate,
];

const getUserValidation = () => [
  param('userId')
    .custom(isMongoId)
    .withMessage('User ID must be a valid MongoDB ObjectId.'),

  validate,
];

const getUserPostsValidation = () => [
  param('userId')
    .custom(isMongoId)
    .withMessage('User ID must be a valid MongoDB ObjectId.'),

  validate,
];

module.exports = {
  getAllUsersValidation,
  getUserValidation,
  getUserPostsValidation,
};
