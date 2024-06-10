const mongoose = require('mongoose');
const { Schema } = mongoose;

const options = {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
};

const userSchema = new Schema(
  {
    githubId: { type: String, required: true, unique: true }, // Ensure uniqueness
    firstName: { type: String, required: true, index: true },
    lastName: { type: String, index: true, default: '' }, // Set default if empty
    email: { type: String, unique: true, sparse: true }, // Make email sparse for uniqueness only when it is provided
    profilePicture: { type: String },
    bio: { type: String },
    isActive: { type: Boolean, default: true },
    dateJoined: { type: Date, default: Date.now },
    profile: { type: Schema.Types.ObjectId, ref: 'Profile' },
    role: {
      type: String,
      enum: ['user', 'admin'],
      required: true,
      default: 'user',
    },
  },
  options
);

userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('User', userSchema);
