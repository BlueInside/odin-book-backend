const followRoute = require('../routes/follow');
const request = require('supertest');
const express = require('express');
const Follow = require('../models/follow');
const mongoose = require('mongoose');
const app = express();
const { generateToken } = require('../config/jwt');

// Mocks
jest.mock('../models/follow'); // Mock the Post model

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/', followRoute);

describe('GET /followers', () => {
  const userId = new mongoose.Types.ObjectId().toString();

  const userDataPayload = {
    id: userId,
    firstName: 'Karol',
    role: 'admin',
  };

  const token = generateToken(userDataPayload);

  const followersMock = [
    {
      follower: {
        githubId: 'id 1',
        firstName: 'Adrian',
      },
      followed: userId,
    },
    {
      follower: {
        githubId: 'id 2',
        firstName: 'Karol',
      },
      followed: userId,
    },
  ];

  it('Should find followers', async () => {
    Follow.find.mockImplementation(() => ({
      populate: () => followersMock,
    }));

    const response = await request(app)
      .get('/followers')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.followers).toEqual(followersMock);
  });

  it('Should return 404 when no followers are found', async () => {
    Follow.find.mockImplementation(() => ({
      populate: () => [],
    }));

    const response = await request(app)
      .get('/followers')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('No followers found.');
  });

  it('Should handle errors gracefully', async () => {
    Follow.find.mockImplementation(() => {
      throw new Error('Database error');
    });

    const response = await request(app)
      .get('/followers')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(500);
    expect(response.body.message).toContain('Error during fetching followers');
  });

  it('Should require authorization', async () => {
    const response = await request(app).get('/followers');

    expect(response.status).toBe(401);
    expect(response.body.message).toContain(
      'Access denied. No token provided.'
    );
  });
});

describe('GET /following', () => {
  const userId = new mongoose.Types.ObjectId().toString();
  const userDataPayload = {
    id: userId,
    firstName: 'Karol',
    role: 'admin',
  };

  const token = generateToken(userDataPayload);
  it('Should find users that the authenticated user is following', async () => {
    const followingMock = [
      {
        followed: {
          firstName: 'John',
          profilePicture: 'john_profile.jpg',
        },
      },
      {
        followed: {
          firstName: 'Jane',
          profilePicture: 'jane_profile.jpg',
        },
      },
    ];

    Follow.find.mockImplementation(() => ({
      populate: () => followingMock,
    }));

    const response = await request(app)
      .get('/following')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.followed).toEqual(followingMock);
    expect(response.body.followed.length).toBe(2);
  });

  it('Should return 404 when the user is not following anyone', async () => {
    Follow.find.mockImplementation(() => ({
      populate: () => [],
    }));

    const response = await request(app)
      .get('/following')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe(
      'You are not following anyone at the moment.'
    );
  });

  it('Should handle errors during fetching followed users', async () => {
    Follow.find.mockImplementation(() => {
      throw new Error('Database error');
    });

    const response = await request(app)
      .get('/following')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Error during fetching followed users');
  });
});

describe('GET /unfollow', () => {
  const userId = new mongoose.Types.ObjectId().toString();
  const userTwoId = new mongoose.Types.ObjectId().toString();
  const userDataPayload = {
    id: userId,
    firstName: 'Karol',
    role: 'admin',
  };

  const token = generateToken(userDataPayload);

  it('Should unfollow a user successfully', async () => {
    Follow.findOneAndDelete.mockResolvedValue({
      _id: 'some-id',
      follower: userId,
      followed: userTwoId,
    });

    const response = await request(app)
      .delete('/unfollow')
      .set('Authorization', `Bearer ${token}`)
      .send({ followedId: userTwoId });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Un followed successfully.');
    expect(Follow.findOneAndDelete).toHaveBeenCalledWith({
      follower: userId,
      followed: userTwoId,
    });
  });

  it('should return 404 if the follow relationship does not exist', async () => {
    Follow.findOneAndDelete.mockResolvedValue(null);

    const response = await request(app)
      .delete('/unfollow')
      .set('Authorization', `Bearer ${token}`)
      .send({ followedId: userTwoId });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Follow relationship not found.');
  });

  it('should return 400 if the followedId is not provided or invalid', async () => {
    const response = await request(app)
      .delete('/unfollow')
      .set('Authorization', `Bearer ${token}`)
      .send({ followedId: '' }); // Testing with empty followedId

    expect(response.status).toBe(400);
    expect(response.body.errors[0].msg).toContain(
      "Followed id can't be empty."
    );
  });
});
