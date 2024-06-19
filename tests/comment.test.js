const commentRoute = require('../routes/comment');
const request = require('supertest');
const express = require('express');
const Comment = require('../models/comment');
const Post = require('../models/post');
const mongoose = require('mongoose');
const app = express();
const { generateToken } = require('../config/jwt');

// Mocks
jest.mock('../models/comment'); // Mock the Comment model
jest.mock('../models/post'); // Mock the Post model

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

describe('DELETE /comments', () => {
  const userId = new mongoose.Types.ObjectId().toString();
  const postId = new mongoose.Types.ObjectId().toString();
  const commentId = new mongoose.Types.ObjectId().toString();

  const userDataPayload = {
    id: userId,
    firstName: 'Karol',
    role: 'admin',
  };

  const token = generateToken(userDataPayload);
  const commentData = {
    _id: commentId,
    author: userId,
    content: 'This is a test comment.',
    post: postId,
  };

  it('should allow the author or an admin to delete a comment', async () => {
    Comment.findById.mockResolvedValue(commentData);
    Comment.findByIdAndDelete.mockResolvedValue(commentData);
    Post.findByIdAndUpdate.mockResolvedValue({});

    const response = await request(app)
      .delete('/comments')
      .send({ postId, commentId })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Comment deleted successfully.');
  });

  it('should prevent non-author, non-admin users from deleting a comment', async () => {
    // 'userId' is neither the author nor an admin.
    const userDataPayload = {
      id: 'invalidId',
      firstName: 'Karol',
      role: 'user',
    };
    const token = generateToken(userDataPayload);

    const commentData = { _id: commentId, author: 'anotherUserId' };
    Comment.findById.mockResolvedValue(commentData);

    const response = await request(app)
      .delete('/comments')
      .send({ postId: postId, commentId: commentId })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe(
      'Not authorized to delete this comment.'
    );
  });
});
