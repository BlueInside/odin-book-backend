const express = require('express');
const router = express.Router();
const likesController = require('../controllers/likesController');

router.post('/like', likesController.createLike);
router.delete('/like', likesController.deleteLike);

module.exports = router;
