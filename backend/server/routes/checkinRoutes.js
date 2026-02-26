const express = require('express');
const { verifyCheckin } = require('../controllers/checkinController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/verify', protect, allowRoles('volunteer', 'admin'), verifyCheckin);

module.exports = router;

