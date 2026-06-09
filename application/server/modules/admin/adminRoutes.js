const express = require('express');
const router = express.Router();
const auth = require('../../middleware/authMiddleware');
const adminController = require('./adminController');

const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'Admin') {
        return next();
    }
    return res.status(403).json({ message: 'Admin permission required.' });
};

router.get('/partners/pending', auth, adminOnly, adminController.getPendingPartners);
router.post('/partners/approve/:id', auth, adminOnly, adminController.approvePartner);
router.post('/partners/reject/:id', auth, adminOnly, adminController.rejectPartner);

router.get('/users/stats', auth, adminOnly, adminController.getUserStats);
router.get('/users', auth, adminOnly, adminController.getAllUsers);
router.get('/users/:id', auth, adminOnly, adminController.getUserById);
router.patch('/users/:id/toggle-lock', auth, adminOnly, adminController.toggleUserLock);
router.patch('/users/:id/role', auth, adminOnly, adminController.changeUserRole);

router.get('/orders', auth, adminOnly, adminController.getOrders);
router.get('/orders/:id', auth, adminOnly, adminController.getOrderDetail);
router.patch('/orders/:id/status', auth, adminOnly, adminController.updateOrderStatus);

router.get('/complaints', auth, adminOnly, adminController.getComplaints);
router.patch('/complaints/:id/status', auth, adminOnly, adminController.updateComplaintStatus);
router.post('/complaints/:id/issue-voucher', auth, adminOnly, adminController.issueComplaintVoucher);
router.post('/complaints/:id/mark-refund-pending', auth, adminOnly, adminController.markComplaintRefundPending);
router.post('/complaints/:id/mark-refunded', auth, adminOnly, adminController.markComplaintRefunded);

router.get('/logs', auth, adminOnly, adminController.getSystemLogs);

router.get('/content', auth, adminOnly, adminController.getContentItems);
router.post('/content', auth, adminOnly, adminController.upsertContentItem);
router.get('/content/templates', auth, adminOnly, adminController.getContentTemplates);
router.get('/content/:contentKey/revisions', auth, adminOnly, adminController.getContentRevisions);
router.get('/content/:contentKey', auth, adminOnly, adminController.getContentItemByKey);
router.put('/content/:contentKey', auth, adminOnly, adminController.updateContentItemByKey);
router.post('/content/:contentKey/publish', auth, adminOnly, adminController.publishContentItem);
router.post('/content/:contentKey/archive', auth, adminOnly, adminController.archiveContentItem);
router.post('/content/:contentKey/reset', auth, adminOnly, adminController.resetContentItem);

// ── Dashboard tổng hợp ───────────────────────────────────────────────────────
// GET /admin/dashboard/stats    → active_vouchers + pending_complaints
router.get('/dashboard/stats', auth, adminOnly, adminController.getVoucherAndComplaintStats);
// GET /admin/dashboard/chart?unit=month|quarter|year  → dữ liệu biểu đồ
router.get('/dashboard/chart', auth, adminOnly, adminController.getDashboardChartData);

router.get('/public/content/:key', adminController.getContentByKey);
module.exports = router;
