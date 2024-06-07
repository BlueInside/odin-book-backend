const mongoose = require('mongoose');
const { Schema } = mongoose;

const options = {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
};

const userSchema = new Schema(
  {
    firstName: { type: String, required: true, index: true },
    lastName: { type: String, required: true, index: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    profilePicture: { type: String },
    bio: { type: String },
    dateJoined: { type: Date, default: Date.now },
    profile: { type: Schema.Types.ObjectId, ref: 'Profile' },
  },
  options
);

userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('User', userSchema);
