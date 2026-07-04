// modules/admin/adminOrder/adminOrderRoute.js
const express = require('express');
const router = express.Router();
const auth = require('../../../middleware/authMiddleware');
const { ADMIN_SCOPES, requireScope } = require('../../../middleware/adminScope');
const adminOrderController = require('./adminOrderController');

// Quản lý đơn hàng / hoàn tiền → OrderManager (SuperAdmin luôn được phép)
const orderScope = requireScope(ADMIN_SCOPES.ORDER_MANAGER);

// Khai báo quần thể các API Endpoint quản lý đơn hàng
router.get('/', auth, orderScope, adminOrderController.getAllOrders);
router.get('/:id', auth, orderScope, adminOrderController.getOrderDetails);
router.patch('/:id/confirm-payment', auth, orderScope, adminOrderController.confirmPayment);
router.post('/:id/refund', auth, orderScope, adminOrderController.refundOrder);

module.exports = router;