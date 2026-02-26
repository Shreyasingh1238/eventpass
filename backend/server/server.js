const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const adminAuthRoutes = require('./routes/adminAuthRoutes');
const eventRoutes = require('./routes/eventRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const checkinRoutes = require('./routes/checkinRoutes');
const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const volunteerRoutes = require('./routes/volunteerRoutes');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

const allowedOrigins = (process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
  : ['http://localhost:5173', 'http://127.0.0.1:5173']);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('CORS origin not allowed'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(apiLimiter);
app.use(cookieParser());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/admin/auth', authLimiter, adminAuthRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/checkin', checkinRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/volunteer', volunteerRoutes);

app.use(notFound);
app.use(errorHandler);

const start = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

start();
