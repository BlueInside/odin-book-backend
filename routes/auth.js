const express = require('express');
const router = express.Router();
const authenticationController = require('../controllers/authenticationController');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { generateToken, authenticateToken } = require('../config/jwt');
const User = require('../models/user');
const { v4: uuidv4 } = require('uuid');
const { faker } = require('@faker-js/faker');

router.get(
  '/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

router.get(
  '/github/callback',
  passport.authenticate('github', {
    session: false,
    failureRedirect: 'http://localhost:5173/sign',
  }),

  function (req, res) {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication failed' });
    }
    const token = generateToken(req.user);

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.redirect('http://localhost:5173/');
  }
);

router.get('/guest', async (req, res) => {
  try {
    const randomName = faker.person.firstName();
    const randomLastName = faker.person.lastName();
    const randomAvatar = faker.image.avatar();

    const guestId = uuidv4();

    const user = await User.create({
      githubId: guestId,
      firstName: randomName,
      lastName: randomLastName,
      email: `${randomName}${Math.random() * 10000}@example.com`,
      profilePicture: randomAvatar,
      isGuest: true,
      role: 'user',
    });

    const token = generateToken(user);

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ user: user });
  } catch (error) {
    return res
      .status(500)
      .send({ message: 'Failed to create guest user', error: error.message });
  }
});

router.get('/verify', authenticateToken, authenticationController.verify);

module.exports = router;
