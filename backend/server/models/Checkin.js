const mongoose = require('mongoose');

const checkinSchema = new mongoose.Schema(
  {
    ticketId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true, index: true, unique: true },
    checkInTime: { type: Date, default: Date.now },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Checkin', checkinSchema);
