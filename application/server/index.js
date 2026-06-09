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
const pool = require('./config/db');

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// 1. Kích hoạt bảo mật HTTP Headers với Helmet
app.use(helmet());

// 2. Giới hạn tần suất yêu cầu (Rate Limiting) để tránh DDoS & Brute force
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 300, // Tối đa 300 requests từ mỗi IP trong 15 phút
  message: {
    message: 'Tần suất gửi yêu cầu quá lớn. Vui lòng thử lại sau 15 phút.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Chỉ áp dụng Rate Limit lên các endpoint API
app.use('/api', apiLimiter);

// Cho phép request từ frontend (localhost dev + Vercel production)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  process.env.FRONTEND_URL,           // Vercel URL hoặc bất kỳ origin nào trong .env
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Cho phép request không có origin (Postman, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    callback(new Error(`CORS: Origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));


// Routes
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
// Health check
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
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
