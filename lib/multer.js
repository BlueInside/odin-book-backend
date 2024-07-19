const multer = require('multer');

const storage = multer.memoryStorage();

const imageFileFilter = (req, file, cb) => {
  // Check if the file is an image (based on MIME type)
  if (file.mimetype.startsWith('image/')) {
    // Accept the file
    cb(null, true);
  } else {
    // Reject the file
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

const uploadPostImage = (req, res, next) => {
  const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 2, files: 1 }, // 2 MB limit
    fileFilter: imageFileFilter,
  }).single('postImage');

  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      return res
        .status(400)
        .json({ error: `Image upload error: ${err.message}` });
    } else if (err) {
      // An unknown error occurred when uploading.
      return res.status(500).json({ error: `Upload error: ${err.message}` });
    }
    // Everything went fine.
    next();
  });
};

function uploadProfilePictures(req, res, next) {
  const upload = multer({
    storage: storage,
    limits: { fieldSize: 1024 * 1024 * 2, files: 2 }, // 2 MB limit
    fileFilter: imageFileFilter,
  }).fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'coverPhoto', maxCount: 1 },
  ]);

  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      return res
        .status(400)
        .json({ error: `Photo upload error:  ${err.message}` });
    } else if (err) {
      // An unknown error occurred when uploading.
      return res.status(500).json({ error: `Upload error: ${err.message}` });
    }
    // Everything went fine.
    next();
  });
}

module.exports = { uploadProfilePictures, uploadPostImage };
