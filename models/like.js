const mongoose = require('mongoose');
const { Schema } = mongoose;

const likeSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  },
  { timestamps: true }
);

// Create a compound index on user and post for uniqueness
likeSchema.index({ user: 1, post: 1 }, { unique: true });

module.exports = mongoose.model('Like', likeSchema);
