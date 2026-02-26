const Ticket = require('../models/Ticket');
const Checkin = require('../models/Checkin');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');

const verifyCheckin = asyncHandler(async (req, res) => {
  const { ticketId } = req.body;
  if (!ticketId) throw new AppError('ticketId is required', 400);

  const ticket = await Ticket.findOne({ ticketId }).lean();
  if (!ticket) {
    return res.status(404).json({ success: false, status: 'invalid', message: 'Invalid ticket' });
  }
  if (ticket.checkedIn) {
    return res.status(409).json({ success: false, status: 'duplicate', message: 'Ticket already checked in' });
  }

  const checkInTime = new Date();
  await Ticket.updateOne({ _id: ticket._id }, { $set: { checkedIn: true, checkInTime } });
  await Checkin.create({ ticketId: ticket._id, checkInTime, verifiedBy: req.user._id });

  return res.json({
    success: true,
    status: 'success',
    message: 'Check-in successful',
    data: { ticketId: ticket.ticketId, checkInTime }
  });
});

module.exports = { verifyCheckin };

