const postRoute = require('../routes/post');
const request = require('supertest');
const express = require('express');
const Post = require('../models/post');
const mongoose = require('mongoose');
const app = express();
const { generateToken } = require('../config/jwt');

// Model mocks
jest.mock('../models/post'); // Mock the Post model

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/posts', postRoute);

describe('GET /posts', () => {
  const id = new mongoose.Types.ObjectId().toString();

  const userDataPayload = {
    id: id,
    firstName: 'Karol',
    role: 'admin',
  };

  const token = generateToken(userDataPayload);

  it('Should get all posts successfully', async () => {
    const posts = [
      {
        _id: new mongoose.Types.ObjectId().toString(),
        title: 'First Post',
        content: 'Content of the first post',
        createdAt: new Date(),
      },
      {
        _id: new mongoose.Types.ObjectId().toString(),
        title: 'Second Post',
        content: 'Content of the second post',
        createdAt: new Date(),
      },
    ];

    Post.find.mockImplementation(() => ({
      sort: () => ({ skip: () => ({ limit: () => posts }) }),
    }));

    const response = await request(app)
      .get('/posts')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.posts).toHaveLength(2);
    expect(response.body.posts[0].title).toBe('First Post');
  });

  it('Should return 400 if limit is invalid', async () => {
    const response = await request(app)
      .get('/posts')
      .query({ limit: 'invalid' })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.errors).not.toBeNull();
    expect(response.body.errors[0].msg).toBe(
      'Limit must be a number between 1 and 100.'
    );
  });

  it('Should return 400 if page is invalid', async () => {
    const response = await request(app)
      .get('/posts')
      .query({ page: 'invalid' })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.errors).not.toBeNull();
    expect(response.body.errors[0].msg).toBe(
      'Page must be a number greater than 0.'
    );
  });

  it('Should return 401 if not authenticated', async () => {
    const response = await request(app).get('/posts');

    expect(response.status).toBe(401);
  });
});
