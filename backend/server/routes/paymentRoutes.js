const express = require('express');
const { createOrder, verifyAndIssueTicket } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/create-order', protect, allowRoles('user', 'admin'), createOrder);
router.post('/verify', protect, allowRoles('user', 'admin'), verifyAndIssueTicket);

module.exports = router;

