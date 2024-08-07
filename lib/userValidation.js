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
    .optional({ checkFalsy: true })
    .if((value, { req }) => value !== '')
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

const getUserLikesValidation = () => [
  param('userId')
    .custom(isMongoId)
    .withMessage('User ID must be a valid MongoDB ObjectId.'),

  validate,
];

const updateUserValidation = () => [
  param('userId')
    .custom(isMongoId)
    .withMessage('User ID Must be valid MongoDB ObjectId.'),

  body('firstName')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('First name cannot be empty.')
    .isLength({ min: 2, max: 15 })
    .withMessage('First name must be between 2 and 15 characters long.'),

  body('lastName')
    .trim()
    .escape()
    .optional()
    .isLength({ min: 0, max: 20 })
    .withMessage('Last name must be between 0 and 20 characters long.'),

  body('bio')
    .optional()
    .trim()
    .escape()
    .isLength({ max: 500 })
    .withMessage('Bio must be less than 500 characters long.'),

  body('email')
    .trim()
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage('Please provide a valid email address.')
    .isLength({ max: 100 })
    .withMessage('Email must be less than 100 characters long.')
    .normalizeEmail(),

  validate,
];

const deleteUserValidation = () => [
  param('userId')
    .custom(isMongoId)
    .withMessage('User ID must be a valid MongoDB ObjectId.'),

  validate,
];

module.exports = {
  getAllUsersValidation,
  getUserValidation,
  getUserPostsValidation,
  getUserLikesValidation,
  updateUserValidation,
  deleteUserValidation,
};
