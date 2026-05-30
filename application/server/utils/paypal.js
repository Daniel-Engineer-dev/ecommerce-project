const axios = require('axios');

module.exports = {
    /**
     * Lấy Access Token từ PayPal API
     */
    async getAccessToken() {
        const clientId = process.env.PAYPAL_CLIENT_ID;
        const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
        const apiUrl = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';

        if (!clientId || !clientSecret) {
            throw new Error('Chưa cấu hình PAYPAL_CLIENT_ID hoặc PAYPAL_CLIENT_SECRET.');
        }

        const auth = Buffer.from(`${clientId.trim()}:${clientSecret.trim()}`).toString('base64');
        
        const response = await axios({
            url: `${apiUrl}/v1/oauth2/token`,
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Accept-Language': 'en_US',
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: 'grant_type=client_credentials',
            timeout: 5000
        });

        return response.data.access_token;
    },

    /**
     * Tạo URL thanh toán qua PayPal
     */
    async createPaymentUrl(orderId, totalAmountVnd) {
        const clientId = process.env.PAYPAL_CLIENT_ID;
        const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
        const apiUrl = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';
        const returnUrl = process.env.PAYPAL_RETURN_URL || 'http://localhost:5000/api/orders/paypal-return';
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

        // Quy đổi VND sang USD (Tỷ giá giả định 1 USD = 25,000 VND)
        const usdAmount = (totalAmountVnd / 25000).toFixed(2);

        // Chế độ Demo Giả lập tự động khi chưa cấu hình Client ID / Secret
        if (!clientId || !clientSecret || clientId.trim() === '' || clientSecret.trim() === '') {
            console.warn('PayPal Client ID/Secret chưa được cấu hình đầy đủ. Kích hoạt URL thanh toán PayPal Demo...');
            return `${returnUrl}?token=MOCK_PAYPAL_TOKEN&orderId=${orderId}&demo=true`;
        }

        try {
            const accessToken = await this.getAccessToken();
            
            const response = await axios({
                url: `${apiUrl}/v2/checkout/orders`,
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                data: {
                    intent: 'CAPTURE',
                    purchase_units: [
                        {
                            reference_id: String(orderId),
                            custom_id: String(orderId),
                            amount: {
                                currency_code: 'USD',
                                value: usdAmount
                            },
                            description: `Dealzy - Thanh toán đơn hàng #${orderId}`
                        }
                    ],
                    application_context: {
                        return_url: `${returnUrl}?orderId=${orderId}`,
                        cancel_url: `${frontendUrl}/payment/status?status=fail&orderId=${orderId}&payment=paypal`,
                        brand_name: 'Dealzy E-Commerce',
                        user_action: 'PAY_NOW'
                    }
                },
                timeout: 5000
            });

            if (response.data && response.data.links) {
                const approveLink = response.data.links.find(link => link.rel === 'approve');
                if (approveLink) {
                    return approveLink.href;
                }
            }
            throw new Error('Không tìm thấy link approve từ PayPal.');

        } catch (error) {
            console.error('Không thể kết nối đến PayPal Sandbox API. Kích hoạt chế độ demo giả lập:', error.message);
            return `${returnUrl}?token=MOCK_PAYPAL_TOKEN&orderId=${orderId}&demo=true`;
        }
    },

    /**
     * Capture (Khớp giao dịch) nhận tiền từ PayPal
     */
    async capturePayment(paypalOrderId) {
        const apiUrl = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';
        
        try {
            const accessToken = await this.getAccessToken();
            
            const response = await axios({
                url: `${apiUrl}/v2/checkout/orders/${paypalOrderId}/capture`,
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                data: {},
                timeout: 5000
            });

            const status = response.data.status;
            if (status === 'COMPLETED') {
                const captureId = response.data.purchase_units[0].payments.captures[0].id;
                return {
                    success: true,
                    transactionId: captureId
                };
            }
            return { success: false, message: `Trạng thái giao dịch PayPal là: ${status}` };
        } catch (error) {
            const errorMsg = error.response ? JSON.stringify(error.response.data) : error.message;
            console.error('Lỗi capture thanh toán PayPal:', errorMsg);
            return { success: false, message: error.message };
        }
    }
};
