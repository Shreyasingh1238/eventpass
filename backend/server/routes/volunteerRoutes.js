const express = require('express');
const {
  createEventRequest,
  listMyRequests,
  getVolunteerDashboard
} = require('../controllers/volunteerController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect, allowRoles('volunteer'));

router.post('/event-requests', createEventRequest);
router.get('/event-requests/me', listMyRequests);
router.get('/dashboard', getVolunteerDashboard);

module.exports = router;

