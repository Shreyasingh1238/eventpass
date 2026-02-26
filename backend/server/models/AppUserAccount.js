const mongoose = require('mongoose');

const appUserAccountSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' },
    age: { type: Number, min: 10, max: 100, default: 21 },
    gender: { type: String, enum: ['male', 'female', 'other'], default: 'other' },
    volunteerStatus: { type: String, default: 'na' }
  },
  { timestamps: true, collection: 'appusers' }
);

module.exports = mongoose.model('AppUserAccount', appUserAccountSchema);
