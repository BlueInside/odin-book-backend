const postRoute = require('../routes/post');
const request = require('supertest');
const express = require('express');
const Post = require('../models/post');
const Like = require('../models/like');
const Comment = require('../models/comment');
const Follow = require('../models/follow');
const mongoose = require('mongoose');
const app = express();
const { generateToken } = require('../config/jwt');

// Model mocks
jest.mock('../models/post'); // Mock the Post model
jest.mock('../models/like'); // Mock the Like model
jest.mock('../models/comment'); // Mock the Comment model
jest.mock('../models/follow'); // Mock the Comment model

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

  it('Should get all user relevant posts successfully', async () => {
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
    const extraPostsMock = [
      {
        _id: new mongoose.Types.ObjectId().toString(),
        title: 'Third Post',
        content: 'Content of the third post',
        createdAt: new Date(),
      },
      {
        _id: new mongoose.Types.ObjectId().toString(),
        title: 'Forth Post',
        content: 'Content of the forth post',
        createdAt: new Date(),
      },
    ];
    const follows = [
      { id: '1', followed: new mongoose.Types.ObjectId().toString() },
      { id: '2', followed: new mongoose.Types.ObjectId().toString() },
      { id: '3', followed: new mongoose.Types.ObjectId().toString() },
    ];

    Follow.find.mockResolvedValue(follows);

    Post.find = jest
      .fn()
      .mockImplementationOnce(() => ({
        sort: () => ({ skip: () => ({ limit: () => posts }) }),
      }))
      .mockImplementationOnce(() => ({
        sort: () => ({ limit: () => extraPostsMock }),
      }));

    const response = await request(app)
      .get('/posts')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.posts).toHaveLength(4);
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

// GET /posts/:postID

describe('GET /posts/:postId', () => {
  const userId = new mongoose.Types.ObjectId().toString();
  const postId = new mongoose.Types.ObjectId().toString();

  const userDataPayload = {
    id: userId,
    firstName: 'Karol',
    role: 'admin',
  };

  const token = generateToken(userDataPayload);

  it('Should get individual post successfully', async () => {
    const post = {
      _id: postId,
      title: 'Test Post',
      content: 'Content of the test post',
      createdAt: new Date(),
    };

    Post.findById.mockResolvedValue(post);

    const response = await request(app)
      .get(`/posts/${postId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.post).not.toBeNull();
    expect(response.body.post.title).toBe('Test Post');
  });

  it('Should return 404 if post not found', async () => {
    Post.findById.mockResolvedValue(null);

    const response = await request(app)
      .get(`/posts/${postId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Post not found!');
  });

  it('Should return 400 if postId is invalid', async () => {
    const response = await request(app)
      .get('/posts/invalidPostId')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.errors).not.toBeNull();
    expect(response.body.errors[0].msg).toBe(
      'Post ID must be a valid MongoDB ObjectId.'
    );
  });

  it('Should return 401 if not authenticated', async () => {
    const response = await request(app).get(`/posts/${postId}`);

    expect(response.status).toBe(401);
  });
});

describe('GET /posts/:postId/likes', () => {
  const userId = new mongoose.Types.ObjectId().toString();
  const postId = new mongoose.Types.ObjectId().toString();

  const userDataPayload = {
    id: userId,
    firstName: 'Karol',
    role: 'admin',
  };

  const token = generateToken(userDataPayload);

  const likes = [
    { _id: new mongoose.Types.ObjectId().toString(), username: 'user1' },
    { _id: new mongoose.Types.ObjectId().toString(), username: 'user2' },
  ];
  it('Should get likes for a post successfully', async () => {
    Like.find.mockResolvedValue(likes);

    const response = await request(app)
      .get(`/posts/${postId}/likes`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.likes).toHaveLength(2);
    expect(response.body.likes[0].username).toBe('user1');
    expect(response.body.likesCount).toBe(2);
  });

  it('Should return 404 if no likes found for the post', async () => {
    Like.find.mockResolvedValue(undefined);

    const response = await request(app)
      .get(`/posts/${postId}/likes`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('No likes found for this post!');
  });

  it('Should return 400 if postId is invalid', async () => {
    const response = await request(app)
      .get('/posts/invalidPostId/likes')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.errors).not.toBeNull();
    expect(response.body.errors[0].msg).toBe(
      'Post ID must be a valid MongoDB ObjectId.'
    );
  });

  it('Should return 401 if not authenticated', async () => {
    const response = await request(app).get(`/posts/${postId}/likes`);

    expect(response.status).toBe(401);
  });
});

describe('GET /posts/:postId/comments', () => {
  const userId = new mongoose.Types.ObjectId().toString();
  const postId = new mongoose.Types.ObjectId().toString();

  const userDataPayload = {
    id: userId,
    firstName: 'Karol',
    role: 'admin',
  };

  const token = generateToken(userDataPayload);
  it('Should get comments for a post successfully', async () => {
    const comments = [
      {
        _id: new mongoose.Types.ObjectId().toString(),
        text: 'First comment',
        user: 'user1',
      },
      {
        _id: new mongoose.Types.ObjectId().toString(),
        text: 'Second comment',
        user: 'user2',
      },
    ];

    Comment.find.mockResolvedValue(comments);
    const response = await request(app)
      .get(`/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.comments).toHaveLength(2);
    expect(response.body.comments[0].text).toBe('First comment');
  });

  it('Should return 404 if no comments found for the post', async () => {
    Comment.find.mockResolvedValue(undefined);

    const response = await request(app)
      .get(`/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('No comments found for this post!');
  });

  it('Should return 400 if postId is invalid', async () => {
    const response = await request(app)
      .get('/posts/invalidPostId/comments')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.errors).not.toBeNull();
    expect(response.body.errors[0].msg).toBe(
      'Post ID must be a valid MongoDB ObjectId.'
    );
  });

  it('Should return 401 if not authenticated', async () => {
    const response = await request(app).get(`/posts/${postId}/comments`);

    expect(response.status).toBe(401);
  });
});

describe('POST /posts', () => {
  const userId = new mongoose.Types.ObjectId().toString();
  const userDataPayload = {
    id: userId,
    firstName: 'Karol',
    role: 'admin',
  };

  const token = generateToken(userDataPayload);
  it('Should create a post successfully', async () => {
    const postData = {
      content: 'Test post content',
    };

    Post.prototype.save = jest.fn().mockResolvedValue({
      _id: userId,
      ...postData,
      author: new mongoose.Types.ObjectId().toString(),
      likesCount: 0,
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const response = await request(app)
      .post('/posts')
      .set('Authorization', `Bearer ${token}`)
      .send(postData);

    expect(response.status).toBe(201);
    expect(response.body.post).not.toBeNull();
    expect(response.body.post.content).toBe(postData.content);
  });

  it('Should return 400 if content is missing', async () => {
    const postData = {};

    const response = await request(app)
      .post('/posts')
      .set('Authorization', `Bearer ${token}`)
      .send(postData);

    expect(response.status).toBe(400);
    expect(response.body.errors).not.toBeNull();
    expect(response.body.errors[0].msg).toBe('Content is required.');
  });

  it('Should return 401 if not authenticated', async () => {
    const postData = {
      content: 'Test post content',
    };

    const response = await request(app).post('/posts').send(postData);

    expect(response.status).toBe(401);
  });
});

describe('PUT /posts/:postId', () => {
  const userId = new mongoose.Types.ObjectId().toString();

  const userDataPayload = {
    id: userId,
    firstName: 'Karol',
    role: 'admin',
  };

  const token = generateToken(userDataPayload);
  const postId = new mongoose.Types.ObjectId().toString();

  it('Should update a post successfully', async () => {
    const post = {
      _id: postId,
      content: 'Original content',
      userId,
      author: userId,
      save: () => ({ content: 'Updated content' }),
    };

    Post.findById.mockResolvedValue(post);

    const response = await request(app)
      .put(`/posts/${postId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'Updated content' });

    expect(response.status).toBe(200);
    expect(response.body.post).not.toBeNull();
    expect(response.body.post.content).toBe('Updated content');
  });

  it('Should return 404 if post not found', async () => {
    Post.findById.mockResolvedValue(null);

    const response = await request(app)
      .put(`/posts/${postId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'Updated content' });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Post not found!');
  });

  it('Should return 403 if user not authorized', async () => {
    const post = {
      _id: postId,
      content: 'Original content',
      author: 'differentUserId',
    };

    Post.findById.mockResolvedValue(post);

    const response = await request(app)
      .put(`/posts/${postId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'Updated content' });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe(
      'User not authorized to update this post!'
    );
  });

  it('Should return 400 if postId is invalid', async () => {
    const response = await request(app)
      .put('/posts/invalidPostId')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'Updated content' });

    expect(response.status).toBe(400);
    expect(response.body.errors).not.toBeNull();
    expect(response.body.errors[0].msg).toBe(
      'Post ID must be a valid MongoDB ObjectId.'
    );
  });

  it('Should return 400 if content is invalid', async () => {
    const post = {
      _id: postId,
      content: 'Original content',
      author: userId,
    };

    Post.findById.mockResolvedValue(post);

    const response = await request(app)
      .put(`/posts/${postId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 123 });

    expect(response.status).toBe(400);
    expect(response.body.errors).not.toBeNull();
    expect(response.body.errors[0].msg).toBe('Content must be a string.');
  });

  it('Should return 401 if not authenticated', async () => {
    const response = await request(app)
      .put(`/posts/${postId}`)
      .send({ content: 'Updated content' });

    expect(response.status).toBe(401);
  });
});

describe('DELETE /posts/:postId', () => {
  const postId = new mongoose.Types.ObjectId().toString();

  const userId = new mongoose.Types.ObjectId().toString();

  const userDataPayload = {
    id: userId,
    firstName: 'Karol',
    role: 'admin',
  };

  const token = generateToken(userDataPayload);

  it('Should delete a post successfully', async () => {
    const post = {
      _id: postId,
      content: 'Original content',
      author: userId,
      remove: jest.fn(),
    };

    Post.findById.mockResolvedValue(post);

    const response = await request(app)
      .delete(`/posts/${postId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Post deleted');
  });

  it('Should return 404 if post not found', async () => {
    Post.findById.mockResolvedValue(null);

    const response = await request(app)
      .delete(`/posts/${postId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Post not found!');
  });

  it('Should return 403 if user not authorized', async () => {
    const notAdminUser = { ...userDataPayload, role: 'user' };

    const post = {
      _id: postId,
      content: 'Original content',
      author: 'inavlid author',
      remove: jest.fn(),
    };
    const token = generateToken(notAdminUser);
    Post.findById.mockResolvedValue(post);

    const response = await request(app)
      .delete(`/posts/${postId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe(
      'User not authorized to delete this post!'
    );
  });

  it('Should allow admin to delete any post', async () => {
    const mockRemove = jest.fn();
    const post = {
      _id: postId,
      content: 'Original content',
      author: 'some different user ID',
      remove: mockRemove,
    };

    Post.findById.mockResolvedValue(post);

    const response = await request(app)
      .delete(`/posts/${postId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(mockRemove).toHaveBeenCalled();
    expect(response.body.message).toBe('Post deleted');
  });

  it('Should return 400 if postId is invalid', async () => {
    const response = await request(app)
      .delete('/posts/invalidPostId')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.errors).not.toBeNull();
    expect(response.body.errors[0].msg).toBe(
      'Post ID must be a valid MongoDB ObjectId.'
    );
  });

  it('Should return 401 if not authenticated', async () => {
    const response = await request(app).delete(`/posts/${postId}`);

    expect(response.status).toBe(401);
  });
});
