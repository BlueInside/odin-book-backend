const auth = require('../routes/auth');
const request = require('supertest');
const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
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
