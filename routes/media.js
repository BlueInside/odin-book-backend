const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');
const { validateMediaId } = require('../lib/mediaValidation');

router.get('/:mediaId', validateMediaId(), mediaController.getMedia);
router.post('/', mediaController.uploadMedia);
router.delete('/:mediaId', mediaController.deleteMedia);

module.exports = router;
