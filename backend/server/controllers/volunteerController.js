const EventRequest = require('../models/EventRequest');
const Event = require('../models/Event');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const Feedback = require('../models/Feedback');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');

const createEventRequest = asyncHandler(async (req, res) => {
  const { title, description, date, venue, mode, price, image, category } = req.body;
  if (!title || !description || !date || !venue || !mode || price == null || !category) {
    throw new AppError('Missing required event request fields', 400);
  }

  const request = await EventRequest.create({
    volunteerId: req.user._id,
    title,
    description,
    date,
    venue,
    mode,
    price,
    image: image || '',
    category,
    status: 'pending'
  });

  res.status(201).json({ success: true, data: request });
});

const listMyRequests = asyncHandler(async (req, res) => {
  const requests = await EventRequest.find({ volunteerId: req.user._id }).sort({ createdAt: -1 }).lean();
  res.json({ success: true, data: requests });
});

const getVolunteerDashboard = asyncHandler(async (req, res) => {
  const volunteerId = req.user._id;
  const events = await Event.find({ createdBy: volunteerId }).lean();
  const eventIds = events.map((event) => event._id);
  const tickets = await Ticket.find({ eventId: { $in: eventIds } }).lean();
  const feedbackRows = await Feedback.find({ eventId: { $in: eventIds } })
    .populate('userId', 'name')
    .sort({ createdAt: -1 })
    .lean();

  const totalRevenue = tickets.reduce((sum, ticket) => {
    const event = events.find((item) => item._id.toString() === ticket.eventId.toString());
    return sum + Number(event?.price || 0);
  }, 0);
  const totalCapacity = events.reduce((sum, event) => sum + Number(event.capacity || 0), 0);
  const remainingTickets = Math.max(totalCapacity - tickets.length, 0);
  const acceptedEvents = events.map((event) => {
      const eventTickets = tickets.filter((ticket) => ticket.eventId.toString() === event._id.toString());
      const eventFeedback = feedbackRows.filter((item) => item.eventId.toString() === event._id.toString());
      const avgRating = eventFeedback.length
        ? Number((eventFeedback.reduce((sum, item) => sum + Number(item.rating || 0), 0) / eventFeedback.length).toFixed(1))
        : 0;

      return {
        ...event,
        ticketsSold: eventTickets.length,
        revenue: Number(event.price || 0) * eventTickets.length,
        avgRating,
        reviewCount: eventFeedback.length,
        feedback: eventFeedback.slice(0, 3).map((item) => ({
          id: item._id,
          userName: item.userId?.name || 'User',
          rating: item.rating,
          comment: item.comment
        }))
      };
    });

  const buyers = await User.find(
    { _id: { $in: tickets.map((ticket) => ticket.userId) } },
    'age gender'
  ).lean();

  const genderDistribution = ['male', 'female', 'other'].map((gender) => ({
    name: gender,
    value: buyers.filter((buyer) => buyer.gender === gender).length
  }));

  const ageGroupLabel = (age) => {
    if (age <= 20) return '16-20';
    if (age <= 25) return '21-25';
    if (age <= 35) return '26-35';
    return '35+';
  };

  const ageGroups = ['16-20', '21-25', '26-35', '35+'].map((label) => ({
    name: label,
    value: buyers.filter((buyer) => ageGroupLabel(Number(buyer.age || 0)) === label).length
  }));

  const popularity = events.map((event) => ({
    name: event.category,
    tickets: tickets.filter((ticket) => ticket.eventId.toString() === event._id.toString()).length
  }));

  const byCategory = ['AI', 'Dance', 'Singing', 'Concert', 'Fashion Show'].map((category) => {
    const categoryEventIds = events.filter((event) => event.category === category).map((event) => event._id.toString());
    const categoryBuyers = buyers.filter((buyer, idx) =>
      categoryEventIds.includes(tickets[idx]?.eventId?.toString?.() || '')
    );
    const ageCounts = categoryBuyers.reduce((acc, buyer) => {
      const label = ageGroupLabel(Number(buyer.age || 0));
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {});
    const topAge = Object.entries(ageCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '21-25';
    return { category, topAge };
  });

  const insights = byCategory
    .filter((item) => item.category === 'AI' || item.category === 'Dance')
    .map((item) => `Most popular age group for ${item.category} events: ${item.topAge}`);

  res.json({
    success: true,
    data: {
      cards: {
        myEvents: acceptedEvents.length,
        totalTicketsSold: tickets.length,
        remainingTickets,
        revenue: totalRevenue,
        eventStatus: req.user.volunteerStatus
      },
      charts: {
        genderDistribution,
        ageGroups,
        ticketsSoldProgress: totalCapacity ? Math.round((tickets.length / totalCapacity) * 100) : 0,
        popularity
      },
      acceptedEvents,
      insights
    }
  });
});

module.exports = { createEventRequest, listMyRequests, getVolunteerDashboard };
