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

const unfollowValidation = () => [
  body('followedId')
    .trim()
    .notEmpty()
    .withMessage(`Followed id can't be empty.`)
    .custom(isMongoId)
    .withMessage('Must be valid mongo id object'),

  validate,
];

const followValidation = () => [
  body('followedId')
    .trim()
    .notEmpty()
    .withMessage(`Followed id can't be empty.`)
    .custom(isMongoId)
    .withMessage('Must be valid mongo id object'),

  validate,
];

module.exports = {
  unfollowValidation,
  followValidation,
};
