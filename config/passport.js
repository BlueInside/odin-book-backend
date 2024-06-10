const GitHubStrategy = require('passport-github2').Strategy;
const passport = require('passport');

const User = require('../models/user');

require('dotenv').config();

const verify = async (accessToken, refreshToken, profile, cb) => {
  try {
    let user = await User.findOne({ githubId: profile.id });

    console.log(accessToken, refreshToken);

    if (!user) {
      user = await User.create({
        githubId: profile.id,
        firstName: profile.username || 'Unknown',
        lastName: '', // GitHub does not provide a separate last name.
        email: profile.email || '', // Handle the case where email may be null
        profilePicture: profile.photos[0].value || '', // Use the avatar URL if available
        bio: profile._json.bio || '', // Access bio from the _json object safely
      });
    }

    if (!user) {
      throw new Error('Error during user creation');
    }
    return cb(null, user);
  } catch (err) {
    return cb(err, false);
  }
};

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/github/callback',
    },
    verify
  )
);
