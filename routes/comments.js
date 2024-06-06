const express = require('express');
const router = express.Router();
const commentsController = require('../controllers/commentsController');

router.post('/comments', commentsController.createComment);
router.delete('/comments', commentsController.deleteComment);

module.exports = router;
