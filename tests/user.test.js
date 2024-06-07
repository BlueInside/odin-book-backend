const userRoute = require('../routes/user');
const request = require('supertest');
const express = require('express');
const User = require('../models/user');
const app = express();

jest.mock('../models/user');
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/users', userRoute);

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
