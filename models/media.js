const mongoose = require('mongoose');
const { Schema } = mongoose;

const mediaSchema = new Schema(
  {
    url: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['image', 'video'],
      lowercase: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Media', mediaSchema);
