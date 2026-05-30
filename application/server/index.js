const express = require('express');
const cors = require('cors');
require('dotenv').config();

const voucherRoutes = require('./modules/shared/voucherRoutes');
const authRoutes = require('./modules/auth/authRoutes');
const adminRoutes = require('./modules/admin/adminRoutes');
const partnerRoutes = require('./modules/partner/partnerRoutes');
const adminVoucherRoutes = require('./modules/admin/adminVoucher/adminVoucherRoute');
const orderRoutes = require('./modules/customer/orderRoutes');
const complaintRoutes = require('./modules/customer/complaintRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/vouchers', voucherRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/partner', partnerRoutes);
app.use('/api/admin/vouchers', adminVoucherRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/complaints', complaintRoutes);

// Health check
app.get('/', (req, res) => res.send('API TMDT Voucher is running...'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
