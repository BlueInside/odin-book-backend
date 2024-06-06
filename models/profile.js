const mongoose = require('mongoose');
const { Schema } = mongoose;

const profileSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    birthday: Date,
    interests: [String],
    hobby: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Profile', profileSchema);
