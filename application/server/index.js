const express = require('express');
const cors = require('cors');
require('dotenv').config();

const voucherRoutes = require('./modules/shared/voucherRoutes');
const authRoutes = require('./modules/auth/authRoutes');
const adminRoutes = require('./modules/admin/adminRoutes');
const partnerRoutes = require('./modules/partner/partnerRoutes');
const adminVoucherRoutes = require('./modules/admin/Voucher/adminVoucherRoute');
const orderRoutes = require('./modules/customer/orderRoutes');
const complaintRoutes = require('./modules/customer/complaintRoutes');
const adminOrderRoutes = require('./modules/admin/Order/adminOrderRoute');
const chatbotRoutes = require('./modules/shared/chatbotRoutes');
const eventRoutes = require('./modules/shared/eventRoutes');
const contentRoutes = require('./modules/shared/contentRoutes');
const orderService = require('./modules/customer/orderService');
const pool = require('./config/db');

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

app.set('trust proxy', 1);

app.use(helmet());

const parseOrigins = (value) => (
  value
    ? value.split(',').map((origin) => origin.trim()).filter(Boolean)
    : []
);

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  ...parseOrigins(process.env.ALLOWED_ORIGINS),
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const allowVercelPreviews = process.env.ALLOW_VERCEL_PREVIEWS === 'true';
    if (allowedOrigins.includes(origin) || (allowVercelPreviews && origin.endsWith('.vercel.app'))) {
      return callback(null, true);
    }
    return callback(new Error(`CORS: Origin ${origin} not allowed`));
  },
  credentials: true,
}));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  skip: (req) => req.originalUrl.startsWith('/api/events'),
  message: {
    message: 'Tan suat gui yeu cau qua lon. Vui long thu lai sau 15 phut.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', apiLimiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use('/api/vouchers', voucherRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/partner', partnerRoutes);
app.use('/api/admin/vouchers', adminVoucherRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin/orders', adminOrderRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/content', contentRoutes);

app.get('/', (req, res) => res.send('API TMDT Voucher is running...'));

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'dealzy-api',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health/db', async (req, res) => {
  const timeoutMs = Number(process.env.DB_HEALTH_TIMEOUT_MS) || 5000;
  const timeout = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Database health check timed out')), timeoutMs);
  });

  try {
    await Promise.race([pool.query('SELECT 1'), timeout]);
    res.status(200).json({
      status: 'ok',
      service: 'dealzy-api',
      database: 'ok',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      service: 'dealzy-api',
      database: 'unavailable',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

const expiryIntervalMs = Number(process.env.PENDING_ORDER_EXPIRY_SCAN_MS || 60000);
const expiryTimer = setInterval(() => {
  orderService.expirePendingOrders().catch((error) => {
    console.error('Pending order expiry failed:', error);
  });
}, expiryIntervalMs);
expiryTimer.unref();

module.exports = { app, server };
