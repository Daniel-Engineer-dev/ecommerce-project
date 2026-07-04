const express = require('express');
const router = express.Router();
const auth = require('../../middleware/authMiddleware');
const { ADMIN_SCOPES, requireAdmin, requireScope } = require('../../middleware/adminScope');
const adminController = require('./adminController');

// Quản lý người dùng & phân quyền admin: chỉ SuperAdmin (requireScope() không tham số).
router.get('/admins', auth, requireScope(), adminController.getAdmins);
router.post('/admins', auth, requireScope(), adminController.createAdmin);
router.patch('/admins/:id/toggle-lock', auth, requireScope(), adminController.toggleAdminLock);
router.patch('/users/:id/admin-scope', auth, requireScope(), adminController.setAdminScope);

// Duyệt đối tác → PartnerModerator
router.get('/partners/pending', auth, requireScope(ADMIN_SCOPES.PARTNER_MODERATOR), adminController.getPendingPartners);
router.post('/partners/approve/:id', auth, requireScope(ADMIN_SCOPES.PARTNER_MODERATOR), adminController.approvePartner);
router.post('/partners/reject/:id', auth, requireScope(ADMIN_SCOPES.PARTNER_MODERATOR), adminController.rejectPartner);

// Quản lý người dùng (xem, khóa/mở, đổi role) → chỉ SuperAdmin
router.get('/users/stats', auth, requireScope(), adminController.getUserStats);
router.get('/users', auth, requireScope(), adminController.getAllUsers);
router.get('/users/:id', auth, requireScope(), adminController.getUserById);
router.patch('/users/:id/toggle-lock', auth, requireScope(), adminController.toggleUserLock);
router.patch('/users/:id/role', auth, requireScope(), adminController.changeUserRole);

// Đơn hàng → OrderManager
router.get('/orders', auth, requireScope(ADMIN_SCOPES.ORDER_MANAGER), adminController.getOrders);
router.get('/orders/:id', auth, requireScope(ADMIN_SCOPES.ORDER_MANAGER), adminController.getOrderDetail);
router.patch('/orders/:id/status', auth, requireScope(ADMIN_SCOPES.ORDER_MANAGER), adminController.updateOrderStatus);

// Khiếu nại → SupportAgent
router.get('/complaints', auth, requireScope(ADMIN_SCOPES.SUPPORT_AGENT), adminController.getComplaints);
router.patch('/complaints/:id/status', auth, requireScope(ADMIN_SCOPES.SUPPORT_AGENT), adminController.updateComplaintStatus);
router.post('/complaints/:id/issue-voucher', auth, requireScope(ADMIN_SCOPES.SUPPORT_AGENT), adminController.issueComplaintVoucher);
router.post('/complaints/:id/mark-refund-pending', auth, requireScope(ADMIN_SCOPES.SUPPORT_AGENT), adminController.markComplaintRefundPending);
router.post('/complaints/:id/mark-refunded', auth, requireScope(ADMIN_SCOPES.SUPPORT_AGENT), adminController.markComplaintRefunded);

// Nhật ký hệ thống → chỉ SuperAdmin
router.get('/logs', auth, requireScope(), adminController.getSystemLogs);

// Quản lý nội dung → ContentEditor
router.get('/content', auth, requireScope(ADMIN_SCOPES.CONTENT_EDITOR), adminController.getContentItems);
router.post('/content', auth, requireScope(ADMIN_SCOPES.CONTENT_EDITOR), adminController.upsertContentItem);
router.get('/content/templates', auth, requireScope(ADMIN_SCOPES.CONTENT_EDITOR), adminController.getContentTemplates);
router.get('/content/:contentKey/revisions', auth, requireScope(ADMIN_SCOPES.CONTENT_EDITOR), adminController.getContentRevisions);
router.get('/content/:contentKey', auth, requireScope(ADMIN_SCOPES.CONTENT_EDITOR), adminController.getContentItemByKey);
router.put('/content/:contentKey', auth, requireScope(ADMIN_SCOPES.CONTENT_EDITOR), adminController.updateContentItemByKey);
router.post('/content/:contentKey/publish', auth, requireScope(ADMIN_SCOPES.CONTENT_EDITOR), adminController.publishContentItem);
router.post('/content/:contentKey/archive', auth, requireScope(ADMIN_SCOPES.CONTENT_EDITOR), adminController.archiveContentItem);
router.post('/content/:contentKey/reset', auth, requireScope(ADMIN_SCOPES.CONTENT_EDITOR), adminController.resetContentItem);

// ── Dashboard tổng hợp (mọi Admin đều xem được trang chủ) ────────────────────
// GET /admin/dashboard/stats    → active_vouchers + pending_complaints
router.get('/dashboard/stats', auth, requireAdmin, adminController.getVoucherAndComplaintStats);
// GET /admin/dashboard/chart?unit=month|quarter|year  → dữ liệu biểu đồ
router.get('/dashboard/chart', auth, requireAdmin, adminController.getDashboardChartData);

router.get('/public/content/:key', adminController.getContentByKey);
module.exports = router;
