const orderService = require('./orderService');
const vnpay = require('../../utils/vnpay');
const momo = require('../../utils/momo');
const vietqr = require('../../utils/vietqr');
const paypal = require('../../utils/paypal');

class OrderController {
    async validateCart(req, res) {
        try {
            const result = await orderService.validateCart(req.body.items || []);
            return res.status(result.valid ? 200 : 400).json(result);
        } catch (error) {
            return res.status(400).json({ valid: false, message: error.message });
        }
    }

    async checkout(req, res) {
        try {
            const customerId = req.user.id;
            const { shippingInfo, items, paymentMethod } = req.body;

            if (!shippingInfo || !items || items.length === 0 || !paymentMethod) {
                return res.status(400).json({ message: 'Missing order or payment information.' });
            }

            const { orderId, totalAmount } = await orderService.createOrder(
                customerId,
                shippingInfo,
                items,
                paymentMethod
            );

            if (paymentMethod === 'VNPay') {
                const ipAddr = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
                const paymentUrl = vnpay.createPaymentUrl(orderId, totalAmount, ipAddr);
                return res.json({ success: true, orderId, totalAmount, paymentUrl });
            }

            if (paymentMethod === 'MoMo') {
                const paymentUrl = await momo.createPaymentUrl(orderId, totalAmount);
                return res.json({ success: true, orderId, totalAmount, paymentUrl });
            }

            if (paymentMethod === 'VietQR') {
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
                        content: `DEALZY ORDER ${orderId}`,
                    },
                });
            }

            if (paymentMethod === 'PayPal') {
                const paymentUrl = await paypal.createPaymentUrl(orderId, totalAmount);
                return res.json({ success: true, orderId, totalAmount, paymentUrl });
            }

            return res.status(400).json({ message: 'Invalid payment method.' });
        } catch (error) {
            console.error('Checkout error:', error);
            return res.status(400).json({
                message: error.message || 'Could not process checkout.',
            });
        }
    }

    async paypalReturn(req, res) {
        const { token, orderId, demo } = req.query;
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

        try {
            if (!orderId) {
                return res.redirect(`${frontendUrl}/payment/status?status=fail&payment=paypal`);
            }

            if (demo === 'true' || token === 'MOCK_PAYPAL_TOKEN') {
                await orderService.completeOrder(orderId, `PAYPAL_DEMO_${Date.now()}`);
                return res.redirect(`${frontendUrl}/payment/status?status=success&orderId=${orderId}&payment=paypal`);
            }

            if (!token) {
                return res.redirect(`${frontendUrl}/payment/status?status=fail&orderId=${orderId}&payment=paypal`);
            }

            const captureResult = await paypal.capturePayment(token);
            if (captureResult.success) {
                await orderService.completeOrder(orderId, captureResult.transactionId);
                return res.redirect(`${frontendUrl}/payment/status?status=success&orderId=${orderId}&payment=paypal`);
            }

            return res.redirect(`${frontendUrl}/payment/status?status=fail&orderId=${orderId}&payment=paypal`);
        } catch (error) {
            console.error('paypalReturn error:', error);
            return res.redirect(`${frontendUrl}/payment/status?status=fail&orderId=${orderId}&payment=paypal`);
        }
    }

    async vnpayReturn(req, res) {
        const queryParams = req.query;
        const orderId = queryParams.vnp_TxnRef;
        const responseCode = queryParams.vnp_ResponseCode;
        const transactionRef = queryParams.vnp_TransactionNo;
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

        try {
            const isValid = vnpay.verifyReturnUrl(queryParams);
            if (isValid && responseCode === '00') {
                await orderService.completeOrder(orderId, transactionRef);
                return res.redirect(`${frontendUrl}/payment/status?status=success&orderId=${orderId}&payment=vnpay`);
            }

            return res.redirect(`${frontendUrl}/payment/status?status=fail&orderId=${orderId}&payment=vnpay`);
        } catch (error) {
            console.error('vnpayReturn error:', error);
            return res.redirect(`${frontendUrl}/payment/status?status=fail&orderId=${orderId}&payment=vnpay`);
        }
    }

    async vnpayIpn(req, res) {
        const queryParams = req.query;
        const orderId = queryParams.vnp_TxnRef;
        const responseCode = queryParams.vnp_ResponseCode;
        const transactionRef = queryParams.vnp_TransactionNo;

        try {
            const isValid = vnpay.verifyReturnUrl(queryParams);
            if (!isValid) {
                return res.status(400).json({ RspCode: '97', Message: 'Invalid Checksum' });
            }

            if (responseCode === '00') {
                await orderService.completeOrder(orderId, transactionRef);
            }
            return res.json({ RspCode: '00', Message: 'Confirm Success' });
        } catch (error) {
            console.error('vnpayIpn error:', error);
            return res.status(500).json({ RspCode: '99', Message: 'Internal Error' });
        }
    }

    async momoIpn(req, res) {
        const body = req.body;

        try {
            const isValid = momo.verifySignature(body);
            if (isValid && Number(body.resultCode) === 0) {
                await orderService.completeOrder(momo.getInternalOrderId(body), body.transId);
                return res.status(204).send();
            }
            return res.status(400).json({ message: 'Signature verification failed or payment unsuccessful.' });
        } catch (error) {
            console.error('momoIpn error:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    async momoReturn(req, res) {
        const queryParams = req.query;

        try {
            const isValid = momo.verifySignature(queryParams);
            if (isValid && Number(queryParams.resultCode) === 0) {
                await orderService.completeOrder(momo.getInternalOrderId(queryParams), queryParams.transId);
            }

            if (!isValid) {
                console.warn('MoMo return signature verification failed:', queryParams);
                return res.redirect(momo.buildFrontendRedirect({
                    ...queryParams,
                    resultCode: queryParams.resultCode ?? -1,
                }));
            }

            return res.redirect(momo.buildFrontendRedirect(queryParams));
        } catch (error) {
            console.error('momoReturn error:', error);
            return res.redirect(momo.buildFrontendRedirect({
                ...queryParams,
                resultCode: -1,
            }));
        }
    }

    async confirmVietQR(req, res) {
        try {
            const { orderId } = req.body;
            if (!orderId) {
                return res.status(400).json({ message: 'Missing order id.' });
            }

            await orderService.completeOrder(orderId, `VIETQR_${Date.now()}`, req.user.id);
            return res.json({ success: true, message: 'Payment confirmed.' });
        } catch (error) {
            console.error('confirmVietQR error:', error);
            return res.status(error.statusCode || 400).json({ message: error.message || 'Could not confirm payment.' });
        }
    }

    async cancelOrder(req, res) {
        try {
            await orderService.cancelOrder(req.params.orderId, req.user.id, req.body?.reason);
            return res.json({ success: true, message: 'Order cancelled.' });
        } catch (error) {
            return res.status(error.statusCode || 400).json({ message: error.message || 'Cannot cancel order.' });
        }
    }

    async markOrderFailed(req, res) {
        try {
            await orderService.markOrderFailed(req.params.orderId, req.user.id, req.body?.transactionRef);
            return res.json({ success: true, message: 'Order marked as failed.' });
        } catch (error) {
            return res.status(error.statusCode || 400).json({ message: error.message || 'Cannot mark order as failed.' });
        }
    }

    async getOrderEVouchers(req, res) {
        try {
            const evouchers = await orderService.getOrderEVouchers(req.params.orderId, req.user.id);
            return res.json({ success: true, evouchers });
        } catch (error) {
            console.error('getOrderEVouchers error:', error);
            return res.status(error.statusCode || 500).json({ message: error.message || 'Could not load e-vouchers.' });
        }
    }

    async getCustomerEVouchers(req, res) {
        try {
            const evouchers = await orderService.getCustomerEVouchers(req.user.id);
            return res.json({ success: true, evouchers });
        } catch (error) {
            console.error('getCustomerEVouchers error:', error);
            return res.status(500).json({ message: 'Could not load e-vouchers.' });
        }
    }

    async getMyOrders(req, res) {
        try {
            const orders = await orderService.getCustomerOrders(req.user.id);
            return res.json({ success: true, orders });
        } catch (error) {
            return res.status(500).json({ message: error.message || 'Could not load orders.' });
        }
    }

    async getOrderDetail(req, res) {
        try {
            const order = await orderService.getCustomerOrderDetail(req.params.orderId, req.user.id);
            return res.json({ success: true, order });
        } catch (error) {
            return res.status(error.statusCode || 500).json({ message: error.message || 'Could not load order.' });
        }
    }

    async createReview(req, res) {
        try {
            const { voucherId, rating, comment } = req.body;
            const ratingVal = Number(rating);

            if (!voucherId || !Number.isInteger(ratingVal) || ratingVal < 1 || ratingVal > 5) {
                return res.status(400).json({ message: 'Rating must be from 1 to 5.' });
            }

            const review = await orderService.createReview(req.user.id, voucherId, ratingVal, comment);
            return res.json({ success: true, message: 'Review submitted.', review });
        } catch (error) {
            console.error('createReview error:', error);
            return res.status(400).json({ message: error.message || 'Could not submit review.' });
        }
    }
}

module.exports = new OrderController();
