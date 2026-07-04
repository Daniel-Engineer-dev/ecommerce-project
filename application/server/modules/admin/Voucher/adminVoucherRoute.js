const express = require('express');
const router = express.Router();
const auth = require('../../../middleware/authMiddleware');
const { ADMIN_SCOPES, requireScope } = require('../../../middleware/adminScope');
const adminVoucherController = require('./adminVoucherController');

// Duyệt/kiểm soát voucher → VoucherModerator (SuperAdmin luôn được phép)
const voucherScope = requireScope(ADMIN_SCOPES.VOUCHER_MODERATOR);

// Khai báo các tuyến đường (Endpoints) theo đặc tả
router.get('/', auth, voucherScope, adminVoucherController.getAdminVouchers);
router.patch('/:id/approve', auth, voucherScope, adminVoucherController.approveVoucher);
router.patch('/:id/reject', auth, voucherScope, adminVoucherController.rejectVoucher);
router.patch('/:id/toggle-visibility', auth, voucherScope, adminVoucherController.toggleVisibility);
router.get('/count/:partnerId', auth, voucherScope, adminVoucherController.getPartnerVoucherCount);
module.exports = router;