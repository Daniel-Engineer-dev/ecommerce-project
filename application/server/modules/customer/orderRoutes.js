const express = require('express');
const router = express.Router();
const OrderController = require('./orderController');
const auth = require('../../middleware/authMiddleware');

// Route xử lý đặt hàng & thanh toán (Yêu cầu đăng nhập)
router.post('/checkout', auth, OrderController.checkout);

// Route xử lý phản hồi chuyển hướng thanh toán từ VNPay
router.get('/vnpay-return', OrderController.vnpayReturn);

// Route xử lý phản hồi chuyển hướng thanh toán từ PayPal
router.get('/paypal-return', OrderController.paypalReturn);

// Route IPN ngầm nhận cuộc gọi từ VNPay và MoMo (Public do các Server cổng thanh toán gọi đến)
router.get('/vnpay-ipn', OrderController.vnpayIpn);
router.post('/momo-ipn', OrderController.momoIpn);

// Route xác nhận chuyển khoản ngân hàng giả lập (Yêu cầu đăng nhập)
router.post('/confirm-vietqr', auth, OrderController.confirmVietQR);

// Route lấy danh sách E-Vouchers đã mua sau thanh toán (Yêu cầu đăng nhập)
router.get('/evouchers/:orderId', auth, OrderController.getOrderEVouchers);

// Route lấy toàn bộ E-Vouchers đã mua của khách hàng đăng nhập
router.get('/my-evouchers', auth, OrderController.getCustomerEVouchers);

// Route tạo đánh giá voucher đã mua
router.post('/reviews', auth, OrderController.createReview);

module.exports = router;
