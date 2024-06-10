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

const getProfileValidation = () => [
  param('userId')
    .custom(isMongoId)
    .withMessage('User ID must be a valid MongoDB ObjectId.'),
  validate,
];

const updateProfileValidation = () => [
  param('profileId')
    .custom(isMongoId)
    .withMessage('Profile ID must be a valid MongoDB ObjectId.'),

  body('birthday')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Birthday must be a valid ISO 8601 date.'),

  body('interests')
    .optional()
    .isArray()
    .withMessage('Interests must be an array.'),

  body('hobby').optional().isArray().withMessage('Hobby must be an array.'),

  validate,
];

const createProfileValidation = () => [
  body('user')
    .custom(isMongoId)
    .withMessage('User ID must be a valid MongoDB ObjectId.'),

  body('birthday')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Birthday must be a valid ISO 8601 date.'),

  body('interests')
    .optional()
    .isArray()
    .withMessage('Interests must be an array.'),

  body('hobby').optional().isArray().withMessage('Hobby must be an array.'),

  validate,
];

module.exports = {
  getProfileValidation,
  updateProfileValidation,
  createProfileValidation,
};
