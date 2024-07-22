require('dotenv').config();
const GitHubStrategy = require('passport-github2').Strategy;
const passport = require('passport');

const User = require('../models/user');

const verify = async (accessToken, refreshToken, profile, cb) => {
  try {
    let user = await User.findOne({ githubId: profile.id });

    if (!user) {
      const defaultAvatar =
        'https://res.cloudinary.com/dhjzutfu9/image/upload/v1719395403/odin-project/avatar_owpfg7.webp';
      const profilePicture = profile.photos?.length
        ? profile.photos[0].value
        : defaultAvatar;

      user = await User.create({
        githubId: profile.id,
        firstName: profile.username || 'Unknown',
        lastName: '', // GitHub does not provide a separate last name.
        email: profile.email || '', // Handle the case where email may be null
        profilePicture: profilePicture,
        bio: profile._json.bio || '', // Access bio from the _json object safely
        role: 'user',
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
