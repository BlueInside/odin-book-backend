const userRoute = require('../routes/user');
const request = require('supertest');
const express = require('express');
const User = require('../models/user');
const Post = require('../models/post');
const Like = require('../models/like');
const mongoose = require('mongoose');
const app = express();
const { generateToken } = require('../config/jwt');
const Follow = require('../models/follow');

jest.mock('../models/user');
jest.mock('../models/post');
jest.mock('../models/like');
jest.mock('../models/follow');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/users', userRoute);

describe('GET /users', () => {
  const id = new mongoose.Types.ObjectId().toString();
  const followedId = new mongoose.Types.ObjectId().toString();
  const followedId2 = new mongoose.Types.ObjectId().toString();

  const mockFollowedUsers = [
    { _id: 'follow1', followed: followedId },
    { _id: 'follow2', followed: followedId2 },
  ];

  const userData = {
    id: id,
    firstName: 'karol',
    role: 'admin',
  };
  const token = generateToken(userData);

  it('Should get list of all the users with no query provided', async () => {
    // Create a mock list of users
    const mockUsers = [
      {
        _id: followedId,
        firstName: 'John',
        lastName: 'Doe',
        fullName: 'John Doe',
        toObject: () => mockUsers[0],
      },
      {
        _id: 'notFollowed',
        firstName: 'Jane',
        lastName: 'Doe',
        fullName: 'Jane Doe',
        toObject: () => mockUsers[1],
      },
    ];

    // Mock the User.find method to return mock users and handle the sorting
    User.find.mockImplementation(() => ({
      sort: () => ({
        skip: () => ({
          limit: () => Promise.resolve(mockUsers), // ensure sort returns a promise that resolves to mockUsers
        }),
      }),
    }));

    Follow.find.mockImplementation(() => ({ select: () => mockFollowedUsers }));

    const response = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('users');
    expect(response.body.users[0]).toHaveProperty('followedByUser', true);
  });

  it('Should return users matching the search query', async () => {
    const mockUsers = [
      {
        _id: followedId,
        firstName: 'John',
        lastName: 'Doe',
        followedByUser: true,
        fullName: 'John Doe',
        toObject: () => mockUsers[0],
      },
    ];
    User.find.mockImplementation(() => ({
      sort: () => ({
        skip: () => ({
          limit: () => Promise.resolve(mockUsers), // ensure sort returns a promise that resolves to mockUsers
        }),
      }),
    }));

    Follow.find.mockImplementation(() => ({ select: () => mockFollowedUsers }));

    const response = await request(app)
      .get('/users')
      .query('q=John')
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.users[0]._id).toEqual(mockUsers[0]._id);
    expect(response.body.users[0].firstName).toEqual(mockUsers[0].firstName);
    expect(response.body.users[0].followedByUser).toEqual(true);
  });

  it('Should return 200 and empty array if no users are found', async () => {
    User.find.mockImplementation(() => ({
      sort: () => ({
        skip: () => ({
          limit: () => Promise.resolve([]), // ensure sort returns a promise that resolves to mockUsers
        }),
      }),
    }));

    const response = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.users).toEqual([]);
  });

  it(`Should get user by its id and return the user info`, async () => {});
});

describe('GET /users/:userId', () => {
  const id = new mongoose.Types.ObjectId().toString();
  const userData = {
    id: id,
    firstName: 'karol',
    role: 'admin',
  };
  const token = generateToken(userData);
  mongoose.Types.ObjectId.isValid = jest.fn();

  it('Should return a user when provided a valid user ID', async () => {
    mongoose.Types.ObjectId.isValid.mockReturnValue(true);
    const fakeUser = {
      _id: id,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      _doc: {},
    };
    User.findById.mockImplementation(() => ({ select: () => fakeUser })); // Mock findById to return a fake user
    Follow.findOne.mockImplementation(() => ({ id: 'followerFound' }));
    const response = await request(app)
      .get(`/users/${fakeUser._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.user).toBeDefined();
    expect(response.body.user._id).toEqual(fakeUser._id);
    expect(response.body.user._doc.isFollowedByCurrentUser).toBe(true);
  });

  it('Should return 400 for an invalid user ID', async () => {
    mongoose.Types.ObjectId.isValid.mockReturnValue(false);
    const invalidUserId = '123';
    const response = await request(app)
      .get(`/users/${invalidUserId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(400);
    expect(response.body.errors[0]).toHaveProperty(
      'msg',
      'User ID must be a valid MongoDB ObjectId.'
    );
  });

  it('Should return 404 if no user is found with the provided ID', async () => {
    mongoose.Types.ObjectId.isValid.mockReturnValue(true);
    const nonExistingUserId = id;
    User.findById.mockImplementation(() => ({ select: () => null })); // Mock findById to return a fake user

    const response = await request(app)
      .get(`/users/${nonExistingUserId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'User not found.');
  });
});

describe('GET /users/:userId/posts', () => {
  const id = new mongoose.Types.ObjectId().toString();
  const userData = {
    id: id,
    firstName: 'karol',
    role: 'admin',
  };
  const token = generateToken(userData);

  const likedPostId1 = new mongoose.Types.ObjectId().toString();
  const likedPostId2 = new mongoose.Types.ObjectId().toString();

  const likedPostsIds = [
    { _id: new mongoose.Types.ObjectId().toString(), post: likedPostId1 },
    { _id: new mongoose.Types.ObjectId().toString(), post: likedPostId2 },
  ];

  it('Should return all posts for a valid user ID', async () => {
    mongoose.Types.ObjectId.isValid.mockReturnValue(true);
    const mockPosts = [
      {
        _id: likedPostId1,
        title: 'First Post',
        content: 'Content of the first post',
        createdAt: new Date(),
        toObject: () => mockPosts[0],
      },
      {
        _id: likedPostId2,
        title: 'Second Post',
        content: 'Content of the second post',
        createdAt: new Date(),
        toObject: () => mockPosts[1],
      },
    ];

    Post.find.mockImplementation(() => ({
      populate: () => ({
        populate: () => ({
          sort: () => ({ skip: () => ({ limit: () => mockPosts }) }),
        }),
      }),
    }));

    Post.countDocuments.mockResolvedValue(mockPosts.length); // Mock countDocuments
    Like.find.mockImplementation(() => ({ select: () => likedPostsIds }));
    const userId = id;
    const response = await request(app)
      .get(`/users/${userId}/posts`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.posts.length).toBe(2);
  });

  it('Should return 400 for an invalid user ID', async () => {
    mongoose.Types.ObjectId.isValid.mockReturnValue(false); // Mock isValid to return false

    Post.find.mockImplementation(() => ({
      populate: () => ({ sort: () => mockPosts }),
    }));

    const response = await request(app)
      .get('/users/123/posts')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.errors[0]).toHaveProperty(
      'msg',
      'User ID must be a valid MongoDB ObjectId.'
    );
  });
});

describe('GET /users/:userId/likes', () => {
  const id = new mongoose.Types.ObjectId().toString();
  it('Should return all liked posts for a valid user ID', async () => {
    mongoose.Types.ObjectId.isValid.mockReturnValue(true); // Mock isValid to return true

    const mockLikes = [
      {
        post: { title: 'First Post', content: 'Here is some content' },
        createdAt: new Date(),
      },
      {
        post: { title: 'Second Post', content: 'Here is some more content' },
        createdAt: new Date(),
      },
    ];

    Like.find.mockImplementation(() => ({ populate: () => mockLikes })); // Mock Like.find.populate to return mock likes
    Like.countDocuments.mockResolvedValue(mockLikes.length); // Mock countDocuments

    const userId = id;
    const response = await request(app).get(`/users/${userId}/likes`);

    expect(response.status).toBe(200);
    expect(response.body.likes.length).toBe(2);
    expect(response.body.likesCount).toBe(2);
  });

  it('Should return 400 for an invalid user ID', async () => {
    mongoose.Types.ObjectId.isValid.mockReturnValue(false); // Mock isValid to return false

    const response = await request(app).get('/users/123/likes');
    expect(response.status).toBe(400);
    expect(response.body.errors[0]).toHaveProperty(
      'msg',
      'User ID must be a valid MongoDB ObjectId.'
    );
  });

  it('Should return 404 if no liked posts are found for the user', async () => {
    mongoose.Types.ObjectId.isValid.mockReturnValue(true); // Assume ID is valid
    Like.find.mockImplementation(() => ({ populate: () => [] })); // Mock find to return an empty array
    Like.countDocuments.mockResolvedValue(0); // Mock countDocuments

    const userId = '507f1f77bcf86cd799439011';
    const response = await request(app).get(`/users/${userId}/likes`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty(
      'error',
      'This user has no liked posts yet.'
    );
  });
});

describe('PUT /users/:userId', () => {
  const id = new mongoose.Types.ObjectId().toString();

  const payloadData = {
    id: id,
    firstName: 'John',
    role: 'admin',
  };

  const token = generateToken(payloadData);

  it('should update the user successfully', async () => {
    const userId = id;
    const fakeUser = {
      _id: userId,
      firstName: 'John',
      lastName: 'Doe',
      profilePicture: 'url_to_image',
      bio: 'New bio',
    };

    User.findByIdAndUpdate.mockResolvedValue(fakeUser); // Mock findByIdAndUpdate to resolve with fake user

    const response = await request(app)
      .put(`/users/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .field('firstName', 'John')
      .field('lastName', 'Doe')
      .field('bio', 'New bio');

    expect(response.status).toBe(200);
    expect(response.body.user).toEqual(fakeUser);
  });

  // Change when passport is implemented.
  it.skip("should return 403 if user tries to update another user's profile", async () => {
    const userId = id;

    const response = await request(app)
      .put(`/users/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .field('firstName', 'John');

    expect(response.status).toBe(403);
    expect(response.body.error).toBe(
      'You do not have permission to update this profile.'
    );
  });

  it('should return 404 if the user is not found', async () => {
    const userId = id;
    User.findByIdAndUpdate.mockResolvedValue(null); // Mock findByIdAndUpdate to resolve with null

    const response = await request(app)
      .put(`/users/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .field('firstName', 'John');

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('User not found.');
  });

  it('should handle database errors', async () => {
    const userId = id;
    const errorMessage = { message: 'Database failed', code: 500 };
    User.findByIdAndUpdate.mockRejectedValue(errorMessage); // Mock findByIdAndUpdate to reject with error

    const response = await request(app)
      .put(`/users/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .field('firstName', 'John');

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Something went wrong during the update.');
  });

  it('should return 400 for invalid email format', async () => {
    const userId = id;
    const invalidEmail = 'john.doe';

    const response = await request(app)
      .put(`/users/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .field('firstName', 'Karol')
      .field('email', invalidEmail);

    expect(response.status).toBe(400);
    expect(response.body.errors[0].msg).toContain(
      'Please provide a valid email address'
    );
  });
});

describe('DELETE /users/:userId', () => {
  const id = new mongoose.Types.ObjectId().toString();

  const payloadData = {
    id: id,
    firstName: 'John',
    role: 'admin',
  };

  const token = generateToken(payloadData);
  it('should successfully anonymize the user', async () => {
    const userId = id;
    const mockUser = {
      _id: userId,
      firstName: 'Anonymous',
      lastName: '',
      email: 'no-reply@example.com',
      isActive: false,
      profilePicture: '',
      bio: '',
    };

    User.findById.mockResolvedValue(mockUser);
    User.findByIdAndUpdate.mockResolvedValue(mockUser);

    const response = await request(app)
      .delete(`/users/${userId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.user).toEqual(mockUser);
  });

  it('should return 404 if the user does not exist', async () => {
    const userId = id;
    User.findById.mockResolvedValue(null);

    const response = await request(app)
      .delete(`/users/${userId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('User not found.');
  });

  it('should handle server errors gracefully', async () => {
    const userId = id;
    User.findById.mockRejectedValue(new Error('Internal Server Error'));

    const response = await request(app)
      .delete(`/users/${userId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(500);
    expect(response.body.error).toBe(
      'Something went wrong during the deletion process.'
    );
  });
});
