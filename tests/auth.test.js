const auth = require('../routes/auth');
const request = require('supertest');
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const User = require('../models/user');
const { v4: uuidv4 } = require('uuid');

// Mocks
jest.mock('../models/user');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/', auth);

const { generateToken } = require('../config/jwt');
const { expect } = require('@jest/globals');

const userDataPayload = {
  id: 'some id',
  firstName: 'Karol',
  role: 'admin',
};

const token = generateToken(userDataPayload);

describe('GET /validate', () => {
  it('Should get 200 when token is valid', async () => {
    const response = await request(app)
      .get('/verify')
      .set('authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('user');
  });

  it('Should get 200 when token is inside cookie', async () => {
    const cookie = `jwt=${token}`;

    const response = await request(app).get('/verify').set('Cookie', cookie);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('user');
  });

  it('Should get 403 when token is invalid', async () => {
    const response = await request(app)
      .get('/verify')
      .set('authorization', `Bearer fakeToken`);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty('message');
  });

  it('Should get 401 when no token provided', async () => {
    const response = await request(app).get('/verify');

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message');
  });
});

describe('GET /guest', () => {
  const mockUser = {
    githubId: uuidv4(),
    firstName: 'randomName',
    lastName: '',
    email: '',
    profilePicture: '',
    isGuest: true,
    role: 'user',
  };

  User.create.mockResolvedValue(mockUser);

  it('should create a guest user and redirect with a cookie', async () => {
    const response = await request(app).get('/guest');

    expect(response.headers['set-cookie']).toBeDefined();
    expect(response.status).toBe(200);
  });

  it('should handle errors properly when user creation fails', async () => {
    User.create.mockRejectedValue(new Error('Failed to create user'));

    const response = await request(app).get('/guest');

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty(
      'message',
      'Failed to create guest user'
    );
  });
});
