const profileRoute = require('../routes/profile');
const request = require('supertest');
const express = require('express');
const Profile = require('../models/profile');
const mongoose = require('mongoose');
const app = express();
const { generateToken } = require('../config/jwt');
const { expect } = require('@jest/globals');

// Model mocks
jest.mock('../models/profile');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/profile', profileRoute);

describe('Get /profile', () => {
  const id = new mongoose.Types.ObjectId().toString();
  const userDataPayload = {
    id: id,
    firstName: 'Karol',
    role: 'admin',
  };
  const token = generateToken(userDataPayload);
  it('Should get profile details', async () => {
    const mockProfile = {
      user: id,
      birthday: '18 05 1997',
      interests: ['cooking', 'fitness', 'guitar'],
      hobby: ['football', 'web-development'],
    };
    Profile.findOne.mockImplementation(() => mockProfile);

    const response = await request(app)
      .get(`/profile/${id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.profile).not.toBeNull();
  });
});
