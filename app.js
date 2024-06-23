const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const passport = require('passport');
const rateLimit = require('express-rate-limit');

// Import passport configuration
require('./config/passport');

// connect to the database
require('./config/mongo');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/user');

const app = express();

// Rate limiter settings
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      message: 'Too many requests, please try again later.',
    });
  },
});

// Routes
const userRoutes = require('./routes/user');
const postRoutes = require('./routes/post');
const commentRoutes = require('./routes/comment');
const likeRoutes = require('./routes/like');
const followRoutes = require('./routes/follow');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const mediaRoutes = require('./routes/media');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(limiter);
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/', followRoutes);
app.use('/users', userRoutes);
app.use('/posts', postRoutes);
app.use('/comments', commentRoutes);
app.use('/likes', likeRoutes);
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/media', mediaRoutes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  const isDevelopment = req.app.get('env') === 'development';

  let errorResponse = {
    success: false,
    error: {
      message: err.message || 'Server Error',
    },
  };

  if (isDevelopment) {
    errorResponse.error.stack = err.stack;
  }

  const statusCode = err.status || 500;

  console.error(err);

  res.status(statusCode).json(errorResponse);
});

module.exports = app;
