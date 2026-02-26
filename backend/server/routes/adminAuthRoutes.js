const express = require('express');
const { adminLogin } = require('../controllers/authController');

const router = express.Router();

router
  .route('/login')
  .post(adminLogin)
  .all((_req, res) => {
    res.status(405).json({
      success: false,
      message: 'Method not allowed. Use POST /api/admin/auth/login'
    });
  });

module.exports = router;
