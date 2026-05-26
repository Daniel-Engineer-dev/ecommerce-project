const crypto = require('crypto');
const axios = require('axios');

const getConfig = () => ({
    partnerCode: process.env.MOMO_PARTNER_CODE || 'MOMOBKUN20180529',
    accessKey: process.env.MOMO_ACCESS_KEY || 'F8B687493259',
    secretKey: process.env.MOMO_SECRET_KEY || 'U3479B51',
    momoUrl: process.env.MOMO_URL || 'https://test-payment.momo.vn/v2/gateway/api/create',
    redirectUrl: process.env.MOMO_REDIRECT_URL || 'http://localhost:5000/api/orders/momo-return',
    ipnUrl: process.env.MOMO_IPN_URL || 'http://localhost:5000/api/orders/momo-ipn',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
});

const sign = (rawSignature, secretKey) =>
    crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

const encodeExtraData = (data) =>
    Buffer.from(JSON.stringify(data), 'utf8').toString('base64');

const decodeExtraData = (extraData) => {
    if (!extraData) return {};
    try {
        return JSON.parse(Buffer.from(extraData, 'base64').toString('utf8'));
    } catch {
        return {};
    }
};

module.exports = {
    async createPaymentUrl(orderId, amount) {
        const {
            partnerCode,
            accessKey,
            secretKey,
            momoUrl,
            redirectUrl,
            ipnUrl,
        } = getConfig();

        const timestamp = Date.now();
        const momoOrderId = `DEALZY-${orderId}-${timestamp}`;
        const requestId = `${partnerCode}${timestamp}`;
        const orderInfo = `Thanh toan don hang #${orderId}`;
        const requestType = 'captureWallet';
        const extraData = encodeExtraData({ orderId: String(orderId) });

        const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${momoOrderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
        const signature = sign(rawSignature, secretKey);

        const requestBody = {
            partnerCode,
            partnerName: 'Dealzy',
            storeId: 'DealzyStore',
            requestId,
            amount: Number(amount),
            orderId: momoOrderId,
            orderInfo,
            redirectUrl,
            ipnUrl,
            lang: 'vi',
            requestType,
            extraData,
            signature,
        };

        try {
            console.log('Creating MoMo payment URL...');
            const response = await axios.post(momoUrl, requestBody, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 30000,
            });

            if (response.data?.payUrl) {
                return response.data.payUrl;
            }

            console.error('MoMo did not return payUrl:', response.data);
            throw new Error(response.data?.message || 'MoMo did not return a payment URL.');
        } catch (error) {
            console.error('Could not create MoMo payment URL:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Could not create MoMo payment URL.');
        }
    },

    verifySignature(payload) {
        const { accessKey, secretKey } = getConfig();
        const {
            partnerCode,
            orderId,
            requestId,
            amount,
            orderInfo,
            orderType,
            message,
            transId,
            resultCode,
            payType,
            responseTime,
            extraData = '',
            signature,
        } = payload;

        if (!signature) return false;

        const rawSignature = orderType
            ? `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`
            : `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&paymentCode=${payload.paymentCode || ''}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;

        return sign(rawSignature, secretKey) === signature;
    },

    buildFrontendRedirect(payload) {
        const { frontendUrl } = getConfig();
        const status = Number(payload.resultCode) === 0 ? 'success' : 'fail';
        const orderId = this.getInternalOrderId(payload);
        return `${frontendUrl}/payment/status?status=${status}&orderId=${encodeURIComponent(orderId)}&payment=momo`;
    },

    getInternalOrderId(payload) {
        return decodeExtraData(payload.extraData).orderId || payload.orderId || '';
    },
};
