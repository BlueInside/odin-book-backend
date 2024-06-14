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
