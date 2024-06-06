const mongoose = require('mongoose');
const { Schema } = mongoose;

const profileSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
    unique: true, // Ensures that each user can only have one profile
  },
  birthday: Date,
  interests: [String],
  hobby: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Profile', profileSchema);
