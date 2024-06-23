const express = require('express');
const router = express.Router();
const authenticationController = require('../controllers/authenticationController');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { generateToken, authenticateToken } = require('../config/jwt');

router.get(
  '/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

router.get(
  '/github/callback',
  passport.authenticate('github', {
    session: false,
    failureRedirect: '/login',
  }),

  function (req, res) {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication failed' });
    }
    const token = generateToken(req.user);

    return res.status(200).json({ success: true, token: token });
  }
);

router.get('/verify', authenticateToken, authenticationController.verify);

module.exports = router;
