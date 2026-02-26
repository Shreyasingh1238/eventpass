const express = require('express');
const { buyTicket, listMyTickets, checkInTicket, refreshMyTicketQr } = require('../controllers/ticketController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/buy', protect, allowRoles('user', 'admin'), buyTicket);
router.get('/my', protect, allowRoles('user', 'admin'), listMyTickets);
router.patch('/:ticketId/refresh-qr', protect, allowRoles('user', 'admin'), refreshMyTicketQr);
router.post('/check-in', protect, allowRoles('volunteer', 'admin'), checkInTicket);

module.exports = router;
