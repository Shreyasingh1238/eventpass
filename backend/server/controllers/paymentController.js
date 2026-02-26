const crypto = require('crypto');
const Razorpay = require('razorpay');
const QRCode = require('qrcode');
const Event = require('../models/Event');
const Ticket = require('../models/Ticket');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');
const generateTicketId = require('../utils/generateTicketId');

const getRazorpayClient = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) return null;
  return new Razorpay({ key_id, key_secret });
};

const createOrder = asyncHandler(async (req, res) => {
  const { eventId } = req.body;
  if (!eventId) throw new AppError('eventId is required', 400);

  const event = await Event.findById(eventId).lean();
  if (!event) throw new AppError('Event not found', 404);

  const razorpay = getRazorpayClient();
  if (!razorpay) {
    return res.json({
      success: true,
      data: {
        provider: 'mock',
        orderId: `mock_order_${Date.now()}`,
        amount: Number(event.price),
        currency: 'INR'
      }
    });
  }

  const order = await razorpay.orders.create({
    amount: Math.round(Number(event.price) * 100),
    currency: 'INR',
    receipt: `evt_${eventId}_${Date.now()}`,
    notes: { eventId, userId: req.user._id.toString() }
  });

  res.json({
    success: true,
    data: {
      provider: 'razorpay',
      orderId: order.id,
      amount: order.amount / 100,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    }
  });
});

const verifyAndIssueTicket = asyncHandler(async (req, res) => {
  const { eventId, attendeeName = '', attendeePhone = '', razorpay_order_id, razorpay_payment_id, razorpay_signature, mockSuccess } = req.body;
  if (!eventId) throw new AppError('eventId is required', 400);

  const event = await Event.findById(eventId).lean();
  if (!event) throw new AppError('Event not found', 404);

  const razorpay = getRazorpayClient();
  if (razorpay) {
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new AppError('Payment verification payload is incomplete', 400);
    }
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');
    if (expected !== razorpay_signature) {
      throw new AppError('Payment verification failed', 400);
    }
  } else if (!mockSuccess) {
    throw new AppError('Mock payment failed. No ticket created', 400);
  }

  const ticketId = generateTicketId();
  const payload = JSON.stringify({ t: ticketId, e: eventId, ts: Date.now() });
  const qrCode = await QRCode.toDataURL(payload);

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

module.exports = { createOrder, verifyAndIssueTicket };
