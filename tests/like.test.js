const likeRoute = require('../routes/like');
const request = require('supertest');
const express = require('express');
const Like = require('../models/like');
const Post = require('../models/post');
const mongoose = require('mongoose');
const app = express();
const { generateToken } = require('../config/jwt');

// Mocks
jest.mock('../models/post'); // Mock the Post model
jest.mock('../models/like'); // Mock the Post model

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/like', likeRoute);

describe('POST /like', () => {
  const userId = new mongoose.Types.ObjectId().toString();
  const likeId = new mongoose.Types.ObjectId().toString();
  const postId = new mongoose.Types.ObjectId().toString();

  const userDataPayload = {
    id: userId,
    firstName: 'Karol',
    role: 'admin',
  };

  const token = generateToken(userDataPayload);

  it('should create a like and increment the post likes count', async () => {
    const mockSavePost = jest.fn();
    const mockIncrementLikeCount = jest.fn();

    const post = {
      id: postId,
      content: 'Test Post',
      author: userId,
      likesCount: 0,
      save: mockSavePost,
      incrementLikes: mockIncrementLikeCount,
    };

    Post.findById.mockResolvedValue(post);
    Like.findOne.mockResolvedValue(null);
    Like.prototype.save = jest.fn().mockResolvedValue({
      _id: new mongoose.Types.ObjectId(),
      post: postId,
      user: userId,
    });

    const response = await request(app)
      .post('/like')
      .set('Authorization', `Bearer ${token}`)
      .send({ postId, userId });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Like created successfully.');
    expect(mockIncrementLikeCount).toHaveBeenCalled();
  });

  it('should return validation errors for invalid data', async () => {
    const response = await request(app)
      .post('/like')
      .set('Authorization', `Bearer ${token}`)
      .send({ postId: 'invalid', userId: 'invalid' });

    expect(response.status).toBe(400);
    expect(response.body.errors.length).toBeGreaterThan(0);
  });

  it('should not allow a user to like their own post', async () => {
    const post = {
      _id: postId,
      content: 'Test Post',
      author: userId,
      likesCount: 0,
      save: jest.fn(),
      incrementLikes: jest.fn(),
    };

    const like = {
      user: userId,
      post: postId,
    };

    Post.findById.mockResolvedValue(post);
    Like.findOne.mockResolvedValue(like);

    const response = await request(app)
      .post('/like')
      .set('Authorization', `Bearer ${token}`)
      .send({ postId, userId });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('You have already liked this post.');
  });
});

describe('DELETE /like', () => {
  const userId = new mongoose.Types.ObjectId().toString();
  const likeId = new mongoose.Types.ObjectId().toString();
  const postId = new mongoose.Types.ObjectId().toString();
  const userDataPayload = {
    id: userId,
    firstName: 'Karol',
    role: 'admin',
  };

  const token = generateToken(userDataPayload);

  it('Should delete like successfully', async () => {
    const like = { user: userId, post: postId };
    const post = {
      _id: postId,
      content: 'Test Post',
      author: userId,
      likesCount: 0,
      save: jest.fn(),
      incrementLikes: jest.fn(),
      decrementLikes: jest.fn(),
    };

    Like.findOne.mockResolvedValue(like);
    Like.deleteOne = jest.fn();
    Post.findById.mockResolvedValue(post);

    const response = await request(app)
      .delete('/like')
      .set('Authorization', `Bearer ${token}`)
      .send({ postId, userId });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Like deleted successfully.');
  });

  it('Should throw 404 if no likes found', async () => {
    const like = null;
    Like.findOne.mockResolvedValue(like);

    const response = await request(app)
      .delete('/like')
      .set('Authorization', `Bearer ${token}`)
      .send({ postId, userId });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Like not found.');
  });

  it('Should call post decrementLikes after like deletion', async () => {
    const like = { user: userId, post: postId };
    const post = {
      _id: postId,
      content: 'Test Post',
      author: userId,
      likesCount: 0,
      save: jest.fn(),
      incrementLikes: jest.fn(),
      decrementLikes: jest.fn(),
    };

    Like.findOne.mockResolvedValue(like);
    Like.deleteOne = jest.fn();
    Post.findById.mockResolvedValue(post);

    const response = await request(app)
      .delete('/like')
      .set('Authorization', `Bearer ${token}`)
      .send({ postId, userId });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Like deleted successfully.');
    expect(post.decrementLikes).toHaveBeenCalled();
  });

  it('should return validation errors for invalid data', async () => {
    const response = await request(app)
      .delete('/like')
      .set('Authorization', `Bearer ${token}`)
      .send({ postId: 'invalid', userId: 'invalid' });

    expect(response.status).toBe(400);
    expect(response.body.errors.length).toBeGreaterThan(0);
  });
});
