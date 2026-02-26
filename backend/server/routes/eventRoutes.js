const express = require('express');
const {
  listEvents,
  getEventById,
  createEvent,
  listEventAttendees,
  listEventFeedback,
  addEventFeedback
} = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', listEvents);
router.get('/:id', getEventById);
router.get('/:id/attendees', protect, allowRoles('volunteer', 'admin'), listEventAttendees);
router.post('/', protect, allowRoles('admin'), createEvent);
router.get('/:id/feedback', listEventFeedback);
router.post('/:id/feedback', protect, allowRoles('user'), addEventFeedback);

module.exports = router;
