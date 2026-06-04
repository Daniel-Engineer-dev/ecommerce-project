const express = require('express');
const router = express.Router();
const OrderController = require('./orderController');
const auth = require('../../middleware/authMiddleware');

router.post('/validate-cart', auth, OrderController.validateCart);
router.post('/checkout', auth, OrderController.checkout);

router.get('/paypal-return', OrderController.paypalReturn);
router.get('/momo-return', OrderController.momoReturn);
router.post('/momo-ipn', OrderController.momoIpn);

router.post('/confirm-vietqr', auth, OrderController.confirmVietQR);
router.post('/:orderId/cancel', auth, OrderController.cancelOrder);
router.post('/:orderId/fail', auth, OrderController.markOrderFailed);

router.get('/my-orders', auth, OrderController.getMyOrders);
router.get('/my-evouchers', auth, OrderController.getCustomerEVouchers);
router.get('/evouchers/:orderId', auth, OrderController.getOrderEVouchers);
router.get('/:orderId', auth, OrderController.getOrderDetail);

router.post('/reviews', auth, OrderController.createReview);

module.exports = router;
