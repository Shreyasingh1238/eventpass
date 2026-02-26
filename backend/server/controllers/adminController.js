const { Parser } = require('json2csv');
const Event = require('../models/Event');
const Ticket = require('../models/Ticket');
const Checkin = require('../models/Checkin');
const User = require('../models/User');
const EventRequest = require('../models/EventRequest');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');
const { getCategoryImage } = require('../utils/categoryImages');

const parsePagination = (query) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

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

const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).lean();
  if (!event) throw new AppError('Event not found', 404);
  res.json({ success: true, data: event });
});

const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findByIdAndDelete(req.params.id).lean();
  if (!event) throw new AppError('Event not found', 404);
  await Ticket.deleteMany({ eventId: event._id });
  res.json({ success: true, message: 'Event deleted' });
});

const listEvents = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const [items, total] = await Promise.all([
    Event.find().sort({ date: 1 }).skip(skip).limit(limit).lean(),
    Event.countDocuments()
  ]);
  res.json({
    success: true,
    data: items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 }
  });
});

const listEventRequests = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const status = req.query.status || 'pending';
  const filter = status ? { status } : {};
  const [items, total] = await Promise.all([
    EventRequest.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('volunteerId', 'name email volunteerStatus')
      .populate('reviewedBy', 'name email')
      .lean(),
    EventRequest.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 }
  });
});

const approveEventRequest = asyncHandler(async (req, res) => {
  const request = await EventRequest.findById(req.params.id);
  if (!request) throw new AppError('Event request not found', 404);
  if (request.status !== 'pending') throw new AppError('Request already processed', 409);

  const event = await Event.create({
    title: request.title,
    description: request.description,
    date: request.date,
    venue: request.venue,
    mode: request.mode === 'physical' ? 'live' : request.mode,
    price: request.price,
    image: request.image || getCategoryImage(request.category),
    category: request.category,
    capacity: 200,
    createdBy: request.volunteerId
  });

  request.status = 'approved';
  request.reviewedBy = req.user._id;
  request.reviewedAt = new Date();
  await request.save();

  await User.updateOne({ _id: request.volunteerId }, { $set: { volunteerStatus: 'accepted' } });

  res.json({ success: true, data: { request, event } });
});

const rejectEventRequest = asyncHandler(async (req, res) => {
  const { reason = '' } = req.body;
  const request = await EventRequest.findById(req.params.id);
  if (!request) throw new AppError('Event request not found', 404);
  if (request.status !== 'pending') throw new AppError('Request already processed', 409);

  request.status = 'rejected';
  request.reviewedBy = req.user._id;
  request.reviewedAt = new Date();
  request.rejectionReason = reason;
  await request.save();

  await User.updateOne({ _id: request.volunteerId }, { $set: { volunteerStatus: 'rejected' } });

  res.json({ success: true, data: request });
});

const ticketSales = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const aggregation = await Ticket.aggregate([
    {
      $lookup: {
        from: 'events',
        localField: 'eventId',
        foreignField: '_id',
        as: 'event'
      }
    },
    { $unwind: '$event' },
    {
      $group: {
        _id: '$eventId',
        title: { $first: '$event.title' },
        category: { $first: '$event.category' },
        price: { $first: '$event.price' },
        ticketsSold: { $sum: 1 },
        revenue: { $sum: '$event.price' }
      }
    },
    { $sort: { ticketsSold: -1 } },
    { $skip: skip },
    { $limit: limit }
  ]);

  const total = await Ticket.distinct('eventId').then((rows) => rows.length);
  res.json({
    success: true,
    data: aggregation,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 }
  });
});

const checkinStats = asyncHandler(async (_req, res) => {
  const [totalTickets, totalCheckedIn, recentCheckins] = await Promise.all([
    Ticket.countDocuments(),
    Ticket.countDocuments({ checkedIn: true }),
    Checkin.find()
      .sort({ checkInTime: -1 })
      .limit(20)
      .populate('ticketId', 'ticketId eventId userId')
      .populate('verifiedBy', 'name email role')
      .lean()
  ]);

  res.json({
    success: true,
    data: {
      totalTickets,
      totalCheckedIn,
      checkInRate: totalTickets ? Number(((totalCheckedIn / totalTickets) * 100).toFixed(2)) : 0,
      recentCheckins
    }
  });
});

const analyticsOverview = asyncHandler(async (_req, res) => {
  const [totalUsers, totalVolunteers, acceptedVolunteers, pendingVolunteers, totalEvents, totalTickets, salesRows] =
    await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'volunteer' }),
      User.countDocuments({ role: 'volunteer', volunteerStatus: 'accepted' }),
      User.countDocuments({ role: 'volunteer', volunteerStatus: 'pending' }),
      Event.countDocuments(),
      Ticket.countDocuments(),
      Ticket.aggregate([
        {
          $lookup: {
            from: 'events',
            localField: 'eventId',
            foreignField: '_id',
            as: 'event'
          }
        },
        { $unwind: '$event' },
        { $group: { _id: null, revenue: { $sum: '$event.price' } } }
      ])
    ]);

  const totalRevenue = salesRows[0]?.revenue || 0;
  res.json({
    success: true,
    data: {
      cards: {
        totalUsers,
        totalVolunteers,
        acceptedVolunteers,
        pendingVolunteers,
        totalEvents,
        totalTicketsSold: totalTickets,
        totalRevenue
      }
    }
  });
});

const analyticsCharts = asyncHandler(async (_req, res) => {
  const [eventsVsTickets, ticketsOverTime, eventCategoryDistribution, users, volunteerStatusRows] = await Promise.all([
    Ticket.aggregate([
      {
        $lookup: {
          from: 'events',
          localField: 'eventId',
          foreignField: '_id',
          as: 'event'
        }
      },
      { $unwind: '$event' },
      { $group: { _id: '$event.title', tickets: { $sum: 1 } } },
      { $project: { name: '$_id', tickets: 1, _id: 0 } },
      { $sort: { tickets: -1 } }
    ]),
    Ticket.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          tickets: { $sum: 1 }
        }
      },
      { $project: { date: '$_id', tickets: 1, _id: 0 } },
      { $sort: { date: 1 } }
    ]),
    Event.aggregate([
      { $group: { _id: '$category', value: { $sum: 1 } } },
      { $project: { name: '$_id', value: 1, _id: 0 } }
    ]),
    User.find({ role: 'user' }, 'age').lean(),
    User.aggregate([
      { $match: { role: 'volunteer' } },
      { $group: { _id: '$volunteerStatus', value: { $sum: 1 } } },
      { $project: { name: '$_id', value: 1, _id: 0 } }
    ])
  ]);

  const ageBuckets = [
    { name: '16-20', min: 16, max: 20, value: 0 },
    { name: '21-25', min: 21, max: 25, value: 0 },
    { name: '26-35', min: 26, max: 35, value: 0 },
    { name: '35+', min: 36, max: 120, value: 0 }
  ];

  users.forEach((user) => {
    const age = Number(user.age || 0);
    const bucket = ageBuckets.find((item) => age >= item.min && age <= item.max);
    if (bucket) bucket.value += 1;
  });

  const donutVolunteerStatus = [
    { name: 'accepted', value: volunteerStatusRows.find((row) => row.name === 'accepted')?.value || 0 },
    { name: 'pending', value: volunteerStatusRows.find((row) => row.name === 'pending')?.value || 0 }
  ];

  res.json({
    success: true,
    data: {
      eventsVsTickets,
      ticketsOverTime,
      eventCategoryDistribution,
      userAgeHistogram: ageBuckets.map(({ name, value }) => ({ name, value })),
      volunteerStatusDonut: donutVolunteerStatus
    }
  });
});

const exportSalesCsv = asyncHandler(async (_req, res) => {
  const rows = await Ticket.aggregate([
    {
      $lookup: {
        from: 'events',
        localField: 'eventId',
        foreignField: '_id',
        as: 'event'
      }
    },
    { $unwind: '$event' },
    {
      $project: {
        ticketId: 1,
        eventTitle: '$event.title',
        eventCategory: '$event.category',
        eventDate: '$event.date',
        price: '$event.price',
        checkedIn: 1,
        createdAt: 1
      }
    },
    { $sort: { createdAt: -1 } }
  ]);

  const parser = new Parser({
    fields: ['ticketId', 'eventTitle', 'eventCategory', 'eventDate', 'price', 'checkedIn', 'createdAt']
  });
  const csv = parser.parse(rows);
  res.header('Content-Type', 'text/csv');
  res.attachment('ticket-sales.csv');
  return res.send(csv);
});

module.exports = {
  createEvent,
  updateEvent,
  deleteEvent,
  listEvents,
  listEventRequests,
  approveEventRequest,
  rejectEventRequest,
  ticketSales,
  checkinStats,
  analyticsOverview,
  analyticsCharts,
  exportSalesCsv
};
