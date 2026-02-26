const mongoose = require('mongoose');

const eventRequestSchema = new mongoose.Schema(
  {
    volunteerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    venue: { type: String, required: true, trim: true },
    mode: { type: String, required: true, enum: ['virtual', 'physical', 'hybrid'] },
    price: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      required: true,
      enum: ['Dance', 'AI', 'Singing', 'Concert', 'Fashion Show']
    },
    image: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt: { type: Date, default: null },
    rejectionReason: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('EventRequest', eventRequestSchema);

