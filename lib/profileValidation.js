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

module.exports = {
  getProfileValidation,
};
