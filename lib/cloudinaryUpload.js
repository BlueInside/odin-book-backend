const cloudinary = require('cloudinary').v2;
const stream = require('node:stream');

cloudinaryUpload = async (fileBuffer) =>
  await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder: 'odin-book-profilePictures',
        allowed_formats: ['jpg', 'png', 'gif', 'webp'],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    const bufferStream = new stream.PassThrough();
    bufferStream.end(fileBuffer);
    bufferStream.pipe(uploadStream);
  });

module.exports = { cloudinaryUpload };
