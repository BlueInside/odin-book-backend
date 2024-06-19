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

const createCommentValidation = () => [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content field cannot be empty.')
    .isLength({ min: 1, max: 500 })
    .withMessage('Comment should be between 1-500 characters long.'),

  body('postId')
    .trim()
    .notEmpty()
    .withMessage('Post cannot be empty.')
    .custom(isMongoId)
    .withMessage('Must be valid mongo id object.'),

  validate,
];

const deleteCommentValidation = () => [
  body('postId')
    .trim()
    .notEmpty()
    .withMessage('Post id cannot be empty.')
    .custom(isMongoId)
    .withMessage('Must be valid mongo id object.'),
  body('commentId')
    .trim()
    .notEmpty()
    .withMessage('Post id cannot be empty.')
    .custom(isMongoId)
    .withMessage('Must be valid mongo id object.'),

  validate,
];
module.exports = {
  createCommentValidation,
  deleteCommentValidation,
};
