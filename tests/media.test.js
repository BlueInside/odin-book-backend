const mediaRoute = require('../routes/media');
const request = require('supertest');
const express = require('express');
const Media = require('../models/media');
const mongoose = require('mongoose');
const app = express();
const { generateToken } = require('../config/jwt');

jest.mock('../models/media'); // Mock the Media model

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/media', mediaRoute);

describe('GET /media/:mediaId', () => {
  const mediaId = new mongoose.Types.ObjectId().toString();
  const postId = new mongoose.Types.ObjectId().toString();

  const mockMedia = {
    id: mediaId,
    post: postId,
    url: 'http://www.someurl.com',
    name: 'Test Media',
    description: 'A test media item.',
  };

  it('should return 200 and the media object when media is found', async () => {
    Media.findById.mockResolvedValue(mockMedia);
    const response = await request(app).get(`/media/${mediaId}`);

    expect(response.status).toBe(200);
    expect(response.body.media).toEqual(mockMedia);
    expect(Media.findById).toHaveBeenCalledWith(mediaId);
  });

  it('should return 404 if the media is not found', async () => {
    Media.findById.mockResolvedValue(null);

    const response = await request(app).get(`/media/${mediaId}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toEqual('Media not found!');
    expect(Media.findById).toHaveBeenCalledWith(mediaId);
  });

  it('should return 400 for an invalid media ID format', async () => {
    const invalidId = 'invalid-id';

    const response = await request(app).get(`/media/${invalidId}`);

    expect(response.status).toBe(400);
    expect(response.body.errors[0].msg).toBe('Invalid media ID format');
  });
});

describe('DELETE /media/:mediaId', () => {
  const userId = new mongoose.Types.ObjectId().toString();
  const mediaId = new mongoose.Types.ObjectId().toString();

  const userDataPayload = {
    id: userId,
    firstName: 'Karol',
    role: 'admin',
  };

  const token = generateToken(userDataPayload);

  it('should delete media if valid ID and user is authorized', async () => {
    const fakeMedia = { _id: mediaId, createdBy: userId };
    Media.findById.mockResolvedValue(fakeMedia);
    Media.findByIdAndDelete.mockResolvedValue(fakeMedia);

    const response = await request(app)
      .delete(`/media/${mediaId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toContain('deleted successfully');
  });

  it('should return 404 if media does not exist', async () => {
    Media.findById.mockResolvedValue(null);

    const response = await request(app)
      .delete(`/media/${mediaId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
  });

  it('should return 403 if user not authorized to delete the media', async () => {
    const fakeMedia = { _id: '1', createdBy: 'user2' };
    Media.findById.mockResolvedValue(fakeMedia);

    const response = await request(app)
      .delete(`/media/${mediaId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
  });

  it('should return 400 if media ID is invalid', async () => {
    const mediaId = 'invalidID';
    const response = await request(app)
      .delete(`/media/${mediaId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
  });
});
