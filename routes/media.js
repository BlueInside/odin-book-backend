const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');

router.get('/:mediaId', mediaController.getMedia);
router.post('/', mediaController.createMedia);
router.delete('/:mediaId', mediaController.deleteMedia);

module.exports = router;
