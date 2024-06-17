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

const createLikeValidation = () => [
  body('postId').custom(isMongoId).withMessage('Invalid Post ID'),
  body('userId').custom(isMongoId).withMessage('Invalid User ID'),

  validate,
];

const deleteLikeValidation = () => [
  body('postId').custom(isMongoId).withMessage('Invalid Post ID'),
  body('userId').custom(isMongoId).withMessage('Invalid User ID'),

  validate,
];

module.exports = { createLikeValidation, deleteLikeValidation };
