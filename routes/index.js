const express = require('express');
const router = express.Router();

router.get('/', async (req, res, next) => {
  res.status(200).json({ message: 'Hello in mine odin-book api' });
});

module.exports = router;
