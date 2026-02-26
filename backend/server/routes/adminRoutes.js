const express = require('express');
const {
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
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect, allowRoles('admin'));

router.get('/events', listEvents);
router.post('/events', createEvent);
router.put('/events/:id', updateEvent);
router.delete('/events/:id', deleteEvent);
router.get('/event-requests', listEventRequests);
router.patch('/event-requests/:id/approve', approveEventRequest);
router.patch('/event-requests/:id/reject', rejectEventRequest);
router.get('/sales', ticketSales);
router.get('/checkins', checkinStats);
router.get('/analytics/overview', analyticsOverview);
router.get('/analytics/charts', analyticsCharts);
router.get('/export/sales.csv', exportSalesCsv);

module.exports = router;
