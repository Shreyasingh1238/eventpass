const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const QRCode = require('qrcode');
const connectDB = require('../config/db');
const User = require('../models/User');
const Event = require('../models/Event');
const Ticket = require('../models/Ticket');
const Checkin = require('../models/Checkin');
const EventRequest = require('../models/EventRequest');
const Feedback = require('../models/Feedback');
const generateTicketId = require('./generateTicketId');
const { resetAndSeedRoleCollections } = require('./syncRoleAccounts');
const { getCategoryImage } = require('./categoryImages');

dotenv.config();

const categories = ['Dance', 'AI', 'Singing', 'Concert', 'Fashion Show'];
const ageRanges = [
  [16, 20],
  [21, 25],
  [26, 35],
  [36, 50]
];
const genders = ['male', 'female', 'other'];
const categoryDemandWeights = {
  AI: 0.3,
  Concert: 0.25,
  Dance: 0.2,
  Singing: 0.15,
  'Fashion Show': 0.1
};

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pickWeighted = (items, getWeight) => {
  const total = items.reduce((sum, item) => sum + Math.max(0, Number(getWeight(item)) || 0), 0);
  if (!total) return items[rand(0, items.length - 1)];
  let cursor = Math.random() * total;
  for (const item of items) {
    cursor -= Math.max(0, Number(getWeight(item)) || 0);
    if (cursor <= 0) return item;
  }
  return items[items.length - 1];
};

const run = async () => {
  await connectDB();
  const hashedDefaultPassword = await bcrypt.hash('pass1234', 10);

  await Promise.all([
    User.deleteMany({}),
    Event.deleteMany({}),
    Ticket.deleteMany({}),
    Checkin.deleteMany({}),
    EventRequest.deleteMany({}),
    Feedback.deleteMany({})
  ]);

  const admin = await User.create({
    name: 'Admin',
    email: 'admin@test.com',
    password: 'pass1234',
    role: 'admin',
    age: 30,
    gender: 'male',
    volunteerStatus: 'na'
  });

  const volunteers = await User.insertMany(
    Array.from({ length: 12 }).map((_, i) => ({
      name: `Volunteer ${i + 1}`,
      email: `volunteer${i + 1}@test.com`,
      password: hashedDefaultPassword,
      role: 'volunteer',
      age: rand(20, 36),
      gender: genders[i % genders.length],
      volunteerStatus: i < 7 ? 'accepted' : 'pending'
    }))
  );

  const users = await User.insertMany(
    Array.from({ length: 120 }).map((_, i) => {
      const [min, max] = ageRanges[i % ageRanges.length];
      return {
        name: `User ${i + 1}`,
        email: `user${i + 1}@test.com`,
        password: hashedDefaultPassword,
        role: 'user',
        age: rand(min, max),
        gender: genders[i % genders.length],
        volunteerStatus: 'na'
      };
    })
  );

  const events = await Event.insertMany(
    categories.flatMap((category) =>
      Array.from({ length: 4 }).map((_, i) => ({
        title: `${category} Event ${i + 1}`,
        description: `Premium ${category} showcase event`,
        date: new Date(Date.now() + rand(2, 60) * 24 * 60 * 60 * 1000),
        venue: i % 2 ? 'Main Arena' : 'Virtual Hall',
        mode: i % 2 ? 'live' : 'virtual',
        category,
        price: rand(20, 120),
        capacity: rand(120, 350),
        image: getCategoryImage(category),
        createdBy: volunteers[i % volunteers.length]._id
      }))
    )
  );

  const ticketsPayload = Array.from({ length: 320 }).map((_, i) => {
    const event = pickWeighted(events, (item) => categoryDemandWeights[item.category] || 0.05);
    const user = users[rand(0, users.length - 1)];
    const checkedIn = Math.random() > 0.35;
    const createdAt = new Date(Date.now() - rand(0, 45) * 24 * 60 * 60 * 1000);
    return {
      ticketId: generateTicketId(),
      userId: user._id,
      eventId: event._id,
      qrCode: '',
      checkedIn,
      checkInTime: checkedIn ? new Date(createdAt.getTime() + rand(0, 5) * 24 * 60 * 60 * 1000) : null,
      createdAt,
      updatedAt: createdAt
    };
  });
  for (const ticket of ticketsPayload) {
    const payload = JSON.stringify({ t: ticket.ticketId, e: String(ticket.eventId), ts: Date.now() });
    ticket.qrCode = await QRCode.toDataURL(payload);
  }

  const tickets = await Ticket.insertMany(ticketsPayload);

  await Checkin.insertMany(
    tickets
      .filter((ticket) => ticket.checkedIn)
      .slice(0, 200)
      .map((ticket) => ({
        ticketId: ticket._id,
        checkInTime: ticket.checkInTime || new Date(),
        verifiedBy: volunteers[rand(0, volunteers.length - 1)]._id
      }))
  );

  await EventRequest.insertMany(
    volunteers.slice(0, 8).map((volunteer, i) => ({
      volunteerId: volunteer._id,
      title: `Requested Event ${i + 1}`,
      description: 'Volunteer submitted event request',
      date: new Date(Date.now() + rand(5, 80) * 24 * 60 * 60 * 1000),
      venue: 'Community Hall',
      mode: i % 2 ? 'physical' : 'virtual',
      price: rand(10, 90),
      category: categories[i % categories.length],
      image: getCategoryImage(categories[i % categories.length]),
      status: i < 4 ? 'approved' : 'pending',
      reviewedBy: i < 4 ? admin._id : null,
      reviewedAt: i < 4 ? new Date() : null
    }))
  );

  await Feedback.insertMany(
    Array.from({ length: 25 }).map((_, i) => ({
      eventId: events[rand(0, events.length - 1)]._id,
      userId: users[rand(0, users.length - 1)]._id,
      rating: rand(3, 5),
      comment: `Great event experience ${i + 1}`
    }))
  );
  await resetAndSeedRoleCollections([admin, ...volunteers, ...users]);

  // eslint-disable-next-line no-console
  console.log('Seed complete with role collections: admin@test.com / pass1234');
  process.exit(0);
};

run().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Seed failed:', error.message);
  process.exit(1);
});
