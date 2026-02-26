const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true, maxlength: 1000 }
  },
  { timestamps: true }
);

feedbackSchema.index({ eventId: 1, userId: 1, createdAt: -1 });

module.exports = mongoose.model('Feedback', feedbackSchema);
