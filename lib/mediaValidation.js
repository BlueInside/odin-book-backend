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

const validateMediaId = () => [
  param('mediaId').custom(isMongoId).withMessage('Invalid media ID format'),

  validate,
];

module.exports = {
  validateMediaId,
};
