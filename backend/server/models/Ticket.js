const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
  {
    ticketId: { type: String, required: true, unique: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    attendeeName: { type: String, default: '' },
    attendeePhone: { type: String, default: '' },
    qrCode: { type: String, required: true },
    checkedIn: { type: Boolean, default: false },
    checkInTime: { type: Date, default: null }
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

ticketSchema.index({ userId: 1, eventId: 1 });

module.exports = mongoose.model('Ticket', ticketSchema);
