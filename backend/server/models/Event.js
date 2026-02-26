const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    venue: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    mode: { type: String, required: true, enum: ['virtual', 'live', 'hybrid'] },
    category: {
      type: String,
      required: true,
      enum: ['Dance', 'AI', 'Singing', 'Concert', 'Fashion Show']
    },
    capacity: { type: Number, default: 200, min: 1 },
    image: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

eventSchema.index({ date: 1 });
eventSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Event', eventSchema);
