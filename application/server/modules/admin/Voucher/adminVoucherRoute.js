const express = require('express');
const router = express.Router();
const auth = require('../../../middleware/authMiddleware');
const adminVoucherController = require('./adminVoucherController');

// Middleware kiểm tra quyền Admin
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'Admin') {
        next();
    } else {
        res.status(403).json({ message: "Quyền truy cập bị từ chối. Yêu cầu quyền Quản trị viên." });
    }
};

// Khai báo các tuyến đường (Endpoints) theo đặc tả
router.get('/', auth, adminOnly, adminVoucherController.getAdminVouchers);
router.patch('/:id/approve', auth, adminOnly, adminVoucherController.approveVoucher);
router.patch('/:id/reject', auth, adminOnly, adminVoucherController.rejectVoucher);
router.patch('/:id/toggle-visibility', auth, adminOnly, adminVoucherController.toggleVisibility);
router.get('/count/:partnerId', auth, adminOnly, adminVoucherController.getPartnerVoucherCount);
module.exports = router;