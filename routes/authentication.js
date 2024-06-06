const express = require('express');
const router = express.Router();
const authenticationController = require('../controllers/authenticationController');

router.post('/login', authenticationController.login);
router.post('/logout', authenticationController.logout);
router.post('/register', authenticationController.register);

module.exports = router;
