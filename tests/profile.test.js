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
      birthday: '05-18-1997',
      interests: ['cooking', 'fitness', 'guitar'],
      hobby: ['football', 'web-development'],
    };
    Profile.findOne.mockImplementation(() => mockProfile);

    const response = await request(app)
      .get(`/profile/${id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.profile).not.toBeNull();
    expect(response.body.profile.user).toBe(id);
    expect(response.body.profile.birthday).toBe(mockProfile.birthday);
    expect(response.body.profile.interests).toEqual(mockProfile.interests);
    expect(response.body.profile.hobby).toEqual(mockProfile.hobby);
  });
});

describe('PUT /profile/:profileId', () => {
  const profileId = new mongoose.Types.ObjectId().toString();
  const userDataPayload = {
    id: profileId,
    firstName: 'Karol',
    role: 'admin',
  };
  const token = generateToken(userDataPayload);

  it('Should update profile details', async () => {
    const mockProfile = {
      user: profileId,
      birthday: new Date('1997-05-18'),
      interests: ['cooking', 'fitness', 'guitar'],
      hobby: ['football', 'web-development'],
    };

    Profile.findByIdAndUpdate.mockImplementation(() => mockProfile);

    const updates = {
      birthday: '1997-05-18',
      interests: ['cooking', 'fitness', 'guitar'],
      hobby: ['football', 'web-development'],
    };

    const response = await request(app)
      .put(`/profile/${profileId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updates);

    expect(response.status).toBe(200);
    expect(response.body.profile).not.toBeNull();
    expect(response.body.profile.birthday).toBe(
      mockProfile.birthday.toISOString()
    );
    expect(response.body.profile.interests).toEqual(mockProfile.interests);
    expect(response.body.profile.hobby).toEqual(mockProfile.hobby);
  });

  it('Should return 404 if profile not found', async () => {
    Profile.findByIdAndUpdate.mockImplementation(() => null);

    const updates = {
      birthday: '1997-05-18',
      interests: ['cooking', 'fitness', 'guitar'],
      hobby: ['football', 'web-development'],
    };

    const response = await request(app)
      .put(`/profile/${profileId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updates);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Profile not found!');
  });

  it('Should return 400 for invalid data', async () => {
    const updates = {
      birthday: 'invalid-date',
      interests: 'not-an-array',
      hobby: 'not-an-array',
    };

    const response = await request(app)
      .put(`/profile/${profileId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updates);

    expect(response.status).toBe(400);
  });

  it('Should return 401 if not authenticated', async () => {
    const updates = {
      birthday: '1997-05-18',
      interests: ['cooking', 'reading'],
      hobby: ['basketball'],
    };

    const response = await request(app)
      .put(`/profile/${profileId}`)
      .send(updates);

    expect(response.status).toBe(401);
  });
});

describe('POST /profile', () => {
  const userId = new mongoose.Types.ObjectId().toString();

  const userDataPayload = {
    id: userId,
    firstName: 'Karol',
    role: 'admin',
  };

  const token = generateToken(userDataPayload);

  it('Should create a profile successfully', async () => {
    const profileData = {
      user: userId,
      birthday: new Date('1997-05-18'),
      interests: ['cooking', 'fitness'],
      hobby: ['football', 'web-development'],
    };

    Profile.prototype.save.mockImplementation(() => profileData);

    const response = await request(app)
      .post('/profile')
      .set('Authorization', `Bearer ${token}`)
      .send(profileData);

    expect(response.status).toBe(201);
    expect(response.body.profile).not.toBeNull();
    expect(response.body.profile.user).toBe(profileData.user);
    expect(new Date(response.body.profile.birthday).toISOString()).toBe(
      new Date(profileData.birthday).toISOString()
    );
    expect(response.body.profile.interests).toEqual(profileData.interests);
    expect(response.body.profile.hobby).toEqual(profileData.hobby);
  });

  it('Should return 400 if validation fails', async () => {
    const profileData = {
      userId: 'invalidId',
      birthday: 'invalidDate',
    };

    const response = await request(app)
      .post('/profile')
      .set('Authorization', `Bearer ${token}`)
      .send(profileData);

    expect(response.status).toBe(400);
    expect(response.body.errors).not.toBeNull();
  });

  it('Should return 401 if not authenticated', async () => {
    const profileData = {
      user: userId,
      birthday: '1997-05-18',
      interests: ['cooking', 'fitness'],
      hobby: ['football', 'web-development'],
    };

    const response = await request(app).post('/profile').send(profileData);

    expect(response.status).toBe(401);
  });
});

describe('DELETE /profile/:profileId', () => {
  const profileId = new mongoose.Types.ObjectId().toString();

  const userDataPayload = {
    id: profileId,
    firstName: 'Karol',
    role: 'admin',
  };

  const token = generateToken(userDataPayload);

  it('Should delete profile successfully as admin', async () => {
    Profile.findByIdAndDelete.mockImplementation(() => ({
      id: profileId,
      user: profileId,
      birthday: '1997-05-18',
      interests: ['cooking', 'fitness'],
      hobby: ['football', 'web-development'],
    }));

    const response = await request(app)
      .delete(`/profile/${profileId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Profile deleted');
  });

  it('Should return 403 if user is not admin', async () => {
    const notAdminToken = generateToken({ id: profileId, role: 'user' });
    const response = await request(app)
      .delete(`/profile/${profileId}`)
      .set('Authorization', `Bearer ${notAdminToken}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Unauthorized action!');
  });

  it('Should return 404 if profile not found', async () => {
    Profile.findByIdAndDelete.mockResolvedValue(null);

    const response = await request(app)
      .delete(`/profile/${profileId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Profile not found!');
  });

  it('Should return 400 if profileId is invalid', async () => {
    const response = await request(app)
      .delete('/profile/invalidProfileId')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.errors).not.toBeNull();
  });

  it('Should return 401 if not authenticated', async () => {
    const response = await request(app).delete(`/profile/${profileId}`);

    expect(response.status).toBe(401);
  });
});
