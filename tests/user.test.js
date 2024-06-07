const userRoute = require('../routes/user');
const request = require('supertest');
const express = require('express');
const User = require('../models/user');
const mongoose = require('mongoose');
const app = express();

jest.mock('../models/user');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/users', userRoute);

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

describe('GET /users', () => {
  it('Should get list of all the users with no query provided', async () => {
    // Create a mock list of users
    const mockUsers = [
      { firstName: 'John', lastName: 'Doe', fullName: 'John Doe' },
      { firstName: 'Jane', lastName: 'Doe', fullName: 'Jane Doe' },
    ];

    // Mock the User.find method to return mock users and handle the sorting
    User.find.mockImplementation(() => ({
      sort: () => ({
        limit: () => Promise.resolve(mockUsers), // ensure sort returns a promise that resolves to mockUsers
      }),
    }));

    const response = await request(app).get('/users');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('users');
  });

  it('Should return users matching the search query', async () => {
    const mockUsers = [
      { firstName: 'John', lastName: 'Doe', fullName: 'John Doe' },
    ];
    User.find.mockImplementation(() => ({
      sort: () => ({
        limit: () => Promise.resolve(mockUsers),
      }),
    }));

    const response = await request(app).get('/users').query('q=John');
    expect(response.status).toBe(200);
    expect(response.body.users).toEqual(mockUsers);
  });

  it('Should return 404 if no users are found', async () => {
    User.find.mockImplementation(() => ({
      sort: () => ({
        limit: () => Promise.resolve([]),
      }),
    }));

    const response = await request(app).get('/users');
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'Users not found.');
  });

  it(`Should get user by its id and return the user info`, async () => {});
});

describe('GET /users/:userId', () => {
  const id = new mongoose.Types.ObjectId();
  it('Should return a user when provided a valid user ID', async () => {
    const fakeUser = {
      _id: id.toString(),
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
    };
    User.findById.mockImplementation(() => ({ select: () => fakeUser })); // Mock findById to return a fake user

    const response = await request(app).get(`/users/${fakeUser._id}`);

    expect(response.status).toBe(200);
    expect(response.body.user).toBeDefined();
    expect(response.body.user._id).toEqual(fakeUser._id);
  });

  it('Should return 400 for an invalid user ID', async () => {
    const invalidUserId = '123';
    const response = await request(app).get(`/users/${invalidUserId}`);
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Invalid user ID.');
  });

  it('Should return 404 if no user is found with the provided ID', async () => {
    const nonExistingUserId = id;
    User.findById.mockImplementation(() => ({ select: () => null })); // Mock findById to return a fake user

    const response = await request(app).get(`/users/${nonExistingUserId}`);
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'User not found.');
  });
});
