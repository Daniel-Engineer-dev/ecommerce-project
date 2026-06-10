// modules/admin/adminOrder/adminOrderRoute.js
const express = require('express');
const router = express.Router();
const auth = require('../../../middleware/authMiddleware');
const adminOrderController = require('./adminOrderController');

// Middleware xác thực phân quyền nội bộ dành riêng cho Admin
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'Admin') {
        next();
    } else {
        res.status(403).json({ message: 'Quyền truy cập bị từ chối. Yêu cầu quyền Quản trị viên.' });
    }
};

// Khai báo quần thể các API Endpoint quản lý đơn hàng
router.get('/', auth, adminOnly, adminOrderController.getAllOrders);
router.get('/:id', auth, adminOnly, adminOrderController.getOrderDetails);
router.patch('/:id/confirm-payment', auth, adminOnly, adminOrderController.confirmPayment);
router.post('/:id/refund', auth, adminOnly, adminOrderController.refundOrder);

module.exports = router;