const orderService = require('./orderService');
const vnpay = require('../../utils/vnpay');
const momo = require('../../utils/momo');
const vietqr = require('../../utils/vietqr');
const paypal = require('../../utils/paypal');

class OrderController {
    /**
     * Xử lý gửi yêu cầu thanh toán & khởi tạo đơn hàng
     */
    async checkout(req, res) {
        try {
            const customerId = req.user.id; // Lấy từ authMiddleware giải mã JWT (JWT payload dùng 'id')
            const { shippingInfo, items, paymentMethod } = req.body;
            
            if (!shippingInfo || !items || items.length === 0 || !paymentMethod) {
                return res.status(400).json({ message: 'Thiếu thông tin đơn hàng hoặc phương thức thanh toán.' });
            }
            
            // 1. Tạo đơn hàng tạm thời ở DB (Sử dụng Transaction để đảm bảo tính toàn vẹn)
            const { orderId, totalAmount } = await orderService.createOrder(
                customerId, 
                shippingInfo, 
                items, 
                paymentMethod
            );
            
            // 2. Định tuyến theo phương thức thanh toán được chọn
            if (paymentMethod === 'VNPay') {
                const ipAddr = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
                const paymentUrl = vnpay.createPaymentUrl(orderId, totalAmount, ipAddr);
                return res.json({ success: true, orderId, totalAmount, paymentUrl });
            } 
            else if (paymentMethod === 'MoMo') {
                const paymentUrl = await momo.createPaymentUrl(orderId, totalAmount);
                return res.json({ success: true, orderId, totalAmount, paymentUrl });
            } 
            else if (paymentMethod === 'VietQR') {
                const qrUrl = vietqr.generateQrUrl(orderId, totalAmount);
                return res.json({ 
                    success: true, 
                    orderId, 
                    totalAmount, 
                    qrUrl,
                    bankInfo: {
                        bankId: 'MB',
                        accountNo: '999918059999',
                        accountName: 'CONG TY DEALZY',
                        content: `DEALZY ORDER ${orderId}`
                    }
                });
            } else if (paymentMethod === 'PayPal') {
                const paymentUrl = await paypal.createPaymentUrl(orderId, totalAmount);
                return res.json({ success: true, orderId, totalAmount, paymentUrl });
            } else {
                return res.status(400).json({ message: 'Phương thức thanh toán không hợp lệ.' });
            }
            
        } catch (error) {
            console.error('Lỗi khi thanh toán đơn hàng:', error);
            // Bắt các thông báo lỗi tùy biến từ Trigger trong DB (Ví dụ: hết hàng, hết hạn)
            return res.status(400).json({ 
                message: error.message || 'Có lỗi xảy ra trong quá trình xử lý giỏ hàng.' 
            });
        }
    }
    
    /**
     * Nhận phản hồi chuyển hướng từ PayPal sau khi khách hàng thanh toán thành công
     */
    async paypalReturn(req, res) {
        const { token, orderId, demo } = req.query;
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        
        try {
            if (!orderId) {
                console.error('Thiếu thông tin orderId khi nhận phản hồi PayPal');
                return res.redirect(`${frontendUrl}/payment/status?status=fail&payment=paypal`);
            }

            // Chế độ demo / giả lập
            if (demo === 'true' || token === 'MOCK_PAYPAL_TOKEN') {
                console.log(`[PayPal Demo] Chấp nhận thanh toán giả lập cho đơn hàng #${orderId}`);
                await orderService.completeOrder(orderId, 'PAYPAL_DEMO_' + Date.now());
                return res.redirect(`${frontendUrl}/payment/status?status=success&orderId=${orderId}&payment=paypal`);
            }

            // Thực hiện capture giao dịch thật từ PayPal
            if (!token) {
                console.error('Thiếu mã token PayPal để capture giao dịch.');
                return res.redirect(`${frontendUrl}/payment/status?status=fail&orderId=${orderId}&payment=paypal`);
            }

            const captureResult = await paypal.capturePayment(token);
            if (captureResult.success) {
                await orderService.completeOrder(orderId, captureResult.transactionId);
                return res.redirect(`${frontendUrl}/payment/status?status=success&orderId=${orderId}&payment=paypal`);
            } else {
                console.warn(`Capture thanh toán PayPal thất bại cho đơn hàng #${orderId}: ${captureResult.message}`);
                return res.redirect(`${frontendUrl}/payment/status?status=fail&orderId=${orderId}&payment=paypal`);
            }
        } catch (error) {
            console.error('Lỗi xử lý paypalReturn:', error);
            return res.redirect(`${frontendUrl}/payment/status?status=fail&orderId=${orderId}&payment=paypal`);
        }
    }
    
    /**
     * Nhận phản hồi chuyển hướng từ VNPay sau khi khách hàng nhấn "Back to Merchant"
     */
    async vnpayReturn(req, res) {
        const queryParams = req.query;
        const orderId = queryParams['vnp_TxnRef'];
        const responseCode = queryParams['vnp_ResponseCode'];
        const transactionRef = queryParams['vnp_TransactionNo'];
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        
        try {
            const isValid = vnpay.verifyReturnUrl(queryParams);
            if (isValid && responseCode === '00') {
                // Xác thực chữ ký đúng và thanh toán thành công
                await orderService.completeOrder(orderId, transactionRef);
                return res.redirect(`${frontendUrl}/payment/status?status=success&orderId=${orderId}&payment=vnpay`);
            } else {
                console.warn(`Thanh toán VNPay thất bại hoặc lỗi chữ ký cho đơn hàng #${orderId}`);
                return res.redirect(`${frontendUrl}/payment/status?status=fail&orderId=${orderId}&payment=vnpay`);
            }
        } catch (error) {
            console.error('Lỗi xử lý vnpayReturn:', error);
            return res.redirect(`${frontendUrl}/payment/status?status=fail&orderId=${orderId}&payment=vnpay`);
        }
    }
    
    /**
     * Nhận IPN ngầm từ VNPay Server để đảm bảo đơn hàng luôn được cập nhật kể cả khi mất kết nối tab trình duyệt
     */
    async vnpayIpn(req, res) {
        const queryParams = req.query;
        const orderId = queryParams['vnp_TxnRef'];
        const responseCode = queryParams['vnp_ResponseCode'];
        const transactionRef = queryParams['vnp_TransactionNo'];
        
        try {
            const isValid = vnpay.verifyReturnUrl(queryParams);
            if (isValid) {
                if (responseCode === '00') {
                    await orderService.completeOrder(orderId, transactionRef);
                    return res.json({ RspCode: '00', Message: 'Confirm Success' });
                } else {
                    return res.json({ RspCode: '00', Message: 'Confirm Success (Failed Transaction)' });
                }
            } else {
                return res.status(400).json({ RspCode: '97', Message: 'Invalid Checksum' });
            }
        } catch (error) {
            console.error('Lỗi xử lý VNPay IPN:', error);
            return res.status(500).json({ RspCode: '99', Message: 'Internal Error' });
        }
    }
    
    /**
     * Nhận IPN ngầm từ MoMo Server
     */
    async momoIpn(req, res) {
        const body = req.body;
        const orderId = body.orderId;
        const resultCode = body.resultCode;
        const transId = body.transId;
        
        try {
            const isValid = momo.verifySignature(body);
            if (isValid && Number(resultCode) === 0) {
                await orderService.completeOrder(orderId, transId);
                return res.status(204).send();
            } else {
                return res.status(400).json({ message: 'Signature verification failed or payment unsuccessful.' });
            }
        } catch (error) {
            console.error('Lỗi xử lý MoMo IPN:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }
    
    /**
     * API Giả lập xác nhận thanh toán chuyển khoản ngân hàng VietQR
     */
    async confirmVietQR(req, res) {
        try {
            const { orderId } = req.body;
            if (!orderId) {
                return res.status(400).json({ message: 'Thiếu mã đơn hàng.' });
            }
            
            await orderService.completeOrder(orderId, 'VIETQR_' + Date.now());
            return res.json({ success: true, message: 'Thanh toán chuyển khoản đã được xác nhận thành công!' });
        } catch (error) {
            console.error('Lỗi xác nhận chuyển khoản VietQR:', error);
            return res.status(500).json({ message: 'Không thể xác nhận thanh toán.' });
        }
    }
    
    /**
     * Lấy các mã E-Vouchers được phát hành của đơn hàng đã thanh toán thành công
     */
    async getOrderEVouchers(req, res) {
        try {
            const { orderId } = req.params;
            const evouchers = await orderService.getOrderEVouchers(orderId);
            return res.json({ success: true, evouchers });
        } catch (error) {
            console.error('Lỗi khi lấy E-Vouchers:', error);
            return res.status(500).json({ message: 'Không thể lấy thông tin E-Vouchers.' });
        }
    }

    /**
     * Lấy toàn bộ danh sách E-Vouchers đã mua của khách hàng đăng nhập
     */
    async getCustomerEVouchers(req, res) {
        try {
            const customerId = req.user.id; // JWT payload dùng 'id'
            const evouchers = await orderService.getCustomerEVouchers(customerId);
            return res.json({ success: true, evouchers });
        } catch (error) {
            console.error('Lỗi khi lấy E-Vouchers của khách hàng:', error);
            return res.status(500).json({ message: 'Không thể lấy danh sách E-Vouchers.' });
        }
    }

    /**
     * Tạo đánh giá mới cho Voucher
     */
    async createReview(req, res) {
        try {
            const customerId = req.user.id; // JWT payload dùng 'id'
            const { voucherId, rating, comment } = req.body;

            if (!voucherId || !rating) {
                return res.status(400).json({ message: 'Thiếu mã voucher hoặc điểm đánh giá.' });
            }

            const ratingVal = parseInt(rating);
            if (isNaN(ratingVal) || ratingVal < 1 || ratingVal > 5) {
                return res.status(400).json({ message: 'Điểm đánh giá phải từ 1 đến 5 sao.' });
            }

            const review = await orderService.createReview(customerId, voucherId, ratingVal, comment);
            return res.json({ success: true, message: 'Đánh giá thành công!', review });
        } catch (error) {
            console.error('Lỗi khi gửi đánh giá:', error);
            return res.status(400).json({ message: error.message || 'Không thể tạo đánh giá.' });
        }
    }
}

module.exports = new OrderController();
