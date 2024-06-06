const mongoose = require('mongoose');
const { Schema } = mongoose;

const postSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    media: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Media',
      },
    ],
    likesCount: {
      type: Number,
      default: 0,
    },
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Method to increment likes count
postSchema.methods.incrementLikes = function () {
  this.likesCount += 1;
  return this.save();
};

// Method to decrement likes count
postSchema.methods.decrementLikes = function () {
  if (this.likesCount > 0) {
    this.likesCount -= 1;
  }
  return this.save();
};

module.exports = mongoose.model('Post', postSchema);
