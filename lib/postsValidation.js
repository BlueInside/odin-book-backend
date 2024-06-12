const { query, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  return next();
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

module.exports = {
  getAllPostsValidation,
};
