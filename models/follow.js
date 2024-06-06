const mongoose = require('mongoose');
const { Schema } = mongoose;

const followSchema = new Schema(
  {
    follower: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    followed: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Indexing to ensure quick look-up and to enforce uniqueness
followSchema.index({ follower: 1, followed: 1 }, { unique: true });

module.exports = mongoose.model('Follow', followSchema);
