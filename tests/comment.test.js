const commentRoute = require('../routes/comment');
const request = require('supertest');
const express = require('express');
const Comment = require('../models/comment');
const mongoose = require('mongoose');
const app = express();
const { generateToken } = require('../config/jwt');

// Mocks
jest.mock('../models/comment'); // Mock the Post model

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/', commentRoute);

describe('POST /comments', () => {
  const userId = new mongoose.Types.ObjectId().toString();
  const postId = new mongoose.Types.ObjectId().toString();

  const userDataPayload = {
    id: userId,
    firstName: 'Karol',
    role: 'admin',
  };

  const token = generateToken(userDataPayload);
  const commentData = {
    content: 'This is a test comment.',
    postId,
  };

  it('should allow a user to successfully add a comment', async () => {
    Comment.prototype.save = jest.fn().mockResolvedValue(commentData);

    const response = await request(app)
      .post('/comments')
      .send(commentData)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Comment successfully added.');
  });

  it('should return a validation error if content is empty', async () => {
    const commentData = {
      content: '',
      postId,
    };

    const response = await request(app)
      .post('/comments')
      .send(commentData)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.errors[0].msg).toContain(
      'Content field cannot be empty.'
    );
  });

  it('should handle server errors during comment saving', async () => {
    const commentData = {
      content: 'This is a test comment.',
      postId: new mongoose.Types.ObjectId().toString(),
    };
    Comment.prototype.save = jest.fn().mockImplementation(() => {
      throw new Error('Failed to save comment');
    });

    const response = await request(app)
      .post('/comments')
      .send(commentData)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Failed to add comment.');
  });
});
