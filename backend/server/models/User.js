const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ['admin', 'user', 'volunteer'],
      default: 'user'
    },
    age: { type: Number, min: 10, max: 100, default: 21 },
    gender: { type: String, enum: ['male', 'female', 'other'], default: 'other' },
    volunteerStatus: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'na'],
      default: 'na'
    }
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.matchPassword = function matchPassword(plainText) {
  return bcrypt.compare(plainText, this.password);
};

module.exports = mongoose.model('User', userSchema);
