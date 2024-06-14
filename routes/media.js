const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');
const { validateMediaId } = require('../lib/mediaValidation');
const { authenticateToken } = require('../config/jwt');

router.get('/:mediaId', validateMediaId(), mediaController.getMedia);
router.post('/', mediaController.uploadMedia);
router.delete(
  '/:mediaId',
  authenticateToken,
  validateMediaId(),
  mediaController.deleteMedia
);

module.exports = router;
