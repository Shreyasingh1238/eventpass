const QRCode = require('qrcode');
const Ticket = require('../models/Ticket');
const Event = require('../models/Event');
const Checkin = require('../models/Checkin');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');
const generateTicketId = require('../utils/generateTicketId');
const crypto = require('crypto');

const signQrPayload = (payload) => {
  const qrSecret = process.env.QR_SECRET;
  if (!qrSecret) return payload;
  const sig = crypto.createHmac('sha256', qrSecret).update(payload).digest('base64url').slice(0, 16);
  const parsed = JSON.parse(payload);
  parsed.s = sig;
  return JSON.stringify(parsed);
};

const buildQrCode = async (ticketId, eventId) => {
  const payload = signQrPayload(JSON.stringify({ t: ticketId, e: eventId, ts: Date.now() }));
  return QRCode.toDataURL(payload);
};

const buyTicket = asyncHandler(async (req, res) => {
  const { eventId, attendeeName = '', attendeePhone = '' } = req.body;
  if (!eventId) throw new AppError('eventId is required', 400);

  const event = await Event.findById(eventId);
  if (!event) throw new AppError('Event not found', 404);

  const ticketId = generateTicketId();
  const qrCode = await buildQrCode(ticketId, eventId);

  const ticket = await Ticket.create({
    ticketId,
    userId: req.user._id,
    eventId: event._id,
    attendeeName,
    attendeePhone,
    qrCode,
    checkedIn: false
  });

  res.status(201).json({ success: true, data: ticket });
});

const listMyTickets = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const skip = (page - 1) * limit;
  const [tickets, total] = await Promise.all([
    Ticket.find({ userId: req.user._id })
      .populate('eventId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Ticket.countDocuments({ userId: req.user._id })
  ]);
  res.json({
    success: true,
    data: tickets,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 }
  });
});

const checkInTicket = asyncHandler(async (req, res) => {
  const { ticketId } = req.body;
  if (!ticketId) throw new AppError('ticketId is required', 400);

  const ticket = await Ticket.findOne({ ticketId });
  if (!ticket) throw new AppError('Ticket not found', 404);
  if (ticket.checkedIn) throw new AppError('Ticket already checked in', 409);

  ticket.checkedIn = true;
  ticket.checkInTime = new Date();
  await ticket.save();

  const checkin = await Checkin.create({
    ticketId: ticket._id,
    checkInTime: ticket.checkInTime,
    verifiedBy: req.user._id
  });

  res.json({ success: true, data: { ticket, checkin } });
});

const refreshMyTicketQr = asyncHandler(async (req, res) => {
  const { ticketId } = req.params;
  if (!ticketId) throw new AppError('ticketId is required', 400);

  const ticket = await Ticket.findOne({ ticketId, userId: req.user._id });
  if (!ticket) throw new AppError('Ticket not found', 404);

  const newTicketId = generateTicketId();
  const newQrCode = await buildQrCode(newTicketId, ticket.eventId.toString());

  ticket.ticketId = newTicketId;
  ticket.qrCode = newQrCode;
  await ticket.save();

  res.json({
    success: true,
    message: 'QR refreshed with new ticket ID',
    data: {
      oldTicketId: ticketId,
      ticketId: ticket.ticketId,
      qrCode: ticket.qrCode
    }
  });
});

module.exports = { buyTicket, listMyTickets, checkInTicket, refreshMyTicketQr };
