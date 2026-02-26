const Event = require('../models/Event');
const Ticket = require('../models/Ticket');
const Feedback = require('../models/Feedback');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');
const { getCategoryImage } = require('../utils/categoryImages');

const attachRatingsToEvents = async (events) => {
  if (!events.length) return events;
  const eventIds = events.map((event) => event._id);
  const ratingRows = await Feedback.aggregate([
    { $match: { eventId: { $in: eventIds } } },
    {
      $group: {
        _id: '$eventId',
        avgRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 }
      }
    }
  ]);

  const ratingMap = new Map(
    ratingRows.map((row) => [
      String(row._id),
      { avgRating: Number((row.avgRating || 0).toFixed(1)), reviewCount: row.reviewCount || 0 }
    ])
  );

  return events.map((event) => {
    const stats = ratingMap.get(String(event._id)) || { avgRating: 0, reviewCount: 0 };
    return { ...event, ...stats };
  });
};

const listEvents = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 12));
  const skip = (page - 1) * limit;
  const [events, total] = await Promise.all([
    Event.find().sort({ date: 1 }).skip(skip).limit(limit).lean(),
    Event.countDocuments()
  ]);
  const withRatings = await attachRatingsToEvents(events);

  res.json({
    success: true,
    data: withRatings,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 }
  });
});

const getEventById = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).lean();
  if (!event) throw new AppError('Event not found', 404);
  const [withRating] = await attachRatingsToEvents([event]);
  res.json({ success: true, data: withRating });
});

const createEvent = asyncHandler(async (req, res) => {
  const { title, description, date, venue, price, mode, image, category, capacity } = req.body;
  if (!title || !description || !date || !venue || price == null || !mode || !category) {
    throw new AppError('Missing required event fields', 400);
  }

  const event = await Event.create({
    title,
    description,
    date,
    venue,
    price,
    mode,
    image: image || getCategoryImage(category),
    category,
    capacity: Number(capacity) || 200,
    createdBy: req.user._id
  });

  res.status(201).json({ success: true, data: event });
});

const listEventAttendees = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).lean();
  if (!event) throw new AppError('Event not found', 404);

  const tickets = await Ticket.find({ eventId: req.params.id })
    .populate('userId', 'name email')
    .sort({ createdAt: -1 })
    .lean();

  const attendees = tickets.map((ticket) => ({
    ticketId: ticket.ticketId,
    attendeeName: ticket.attendeeName || ticket.userId?.name || 'Attendee',
    attendeePhone: ticket.attendeePhone || '-',
    userName: ticket.userId?.name || 'User',
    userEmail: ticket.userId?.email || '',
    bookedAt: ticket.createdAt
  }));

  res.json({ success: true, data: attendees });
});

const listEventFeedback = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).lean();
  if (!event) throw new AppError('Event not found', 404);

  const feedback = await Feedback.find({ eventId: req.params.id })
    .populate('userId', 'name role')
    .sort({ createdAt: -1 })
    .lean();

  res.json({ success: true, data: feedback });
});

const addEventFeedback = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const event = await Event.findById(req.params.id).lean();
  if (!event) throw new AppError('Event not found', 404);
  if (!rating || !comment) throw new AppError('rating and comment are required', 400);

  const doc = await Feedback.create({
    eventId: req.params.id,
    userId: req.user._id,
    rating: Number(rating),
    comment
  });

  const populated = await Feedback.findById(doc._id).populate('userId', 'name role').lean();
  res.status(201).json({ success: true, data: populated });
});

module.exports = { listEvents, getEventById, createEvent, listEventAttendees, listEventFeedback, addEventFeedback };
