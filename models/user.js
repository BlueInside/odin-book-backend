const mongoose = require('mongoose');
const { Schema } = mongoose;

const options = {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
};

const userSchema = new Schema(
  {
    githubId: { type: String, required: false, unique: false },
    firstName: { type: String, required: true, index: true },
    lastName: { type: String, index: true, default: '' }, // Set default if empty
    email: { type: String },
    profilePicture: { type: String },
    birthday: { type: Date },
    coverPhoto: { type: String },
    relationship: {
      type: String,
      enum: ['Single', `Complicated`, 'In relationship'],
    },
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
    isGuest: { type: Boolean, default: false },
  },
  options
);

userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('User', userSchema);
