const crypto = require('crypto');

/**
 * Sắp xếp các key của object theo bảng chữ cái (Bắt buộc theo chuẩn VNPay).
 * Trả về object với keys đã sắp xếp, VALUES vẫn là raw (chưa encode).
 */
function sortObjectRaw(obj) {
    const sorted = {};
    const keys = Object.keys(obj).sort();
    for (const key of keys) {
        sorted[key] = obj[key];
    }
    return sorted;
}

module.exports = {
    /**
     * Tạo URL thanh toán VNPay gửi đi.
     *
     * Luồng đúng chuẩn VNPay:
     *   1. Tập hợp tất cả tham số với giá trị RAW (không encode).
     *   2. Sắp xếp key theo alphabet.
     *   3. Nối thành chuỗi key=value&key=value (dùng giá trị RAW) → ký HMAC-SHA512.
     *   4. Thêm vnp_SecureHash vào params.
     *   5. Build query string bằng encodeURIComponent chỉ ở bước này.
     */
    createPaymentUrl(orderId, amount, ipAddr) {
        const tmnCode    = process.env.VNPAY_TMN_CODE    || '2QXFAH13';
        const secretKey  = process.env.VNPAY_HASH_SECRET || 'GET8N1Z53R9I2O3Y4C5X6V7B8N9M0L';
        const vnpUrl     = process.env.VNPAY_URL         || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
        // Return URL phải trỏ về server backend để server xử lý kết quả rồi redirect về frontend
        const returnUrl  = process.env.VNPAY_RETURN_URL  || 'http://localhost:5000/api/orders/vnpay-return';

        const date = new Date();
        const pad  = (n) => String(n).padStart(2, '0');
        const createDate = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;

        // --- Bước 1: Tập hợp params với giá trị RAW ---
        let vnp_Params = {
            vnp_Version:   '2.1.0',
            vnp_Command:   'pay',
            vnp_TmnCode:   tmnCode,
            vnp_Locale:    'vn',
            vnp_CurrCode:  'VND',
            vnp_TxnRef:    String(orderId),
            vnp_OrderInfo: `Thanh toan don hang #${orderId}`,
            vnp_OrderType: 'other',
            vnp_Amount:    amount * 100,   // VNPay quy định nhân 100 (đơn vị xu)
            vnp_ReturnUrl: returnUrl,
            vnp_IpAddr:    ipAddr || '127.0.0.1',
            vnp_CreateDate: createDate,
        };

        // --- Bước 2: Sắp xếp key alphabet (giá trị vẫn RAW) ---
        vnp_Params = sortObjectRaw(vnp_Params);

        // --- Bước 3: Build signData từ giá trị RAW → ký ---
        const signData = Object.entries(vnp_Params)
            .map(([k, v]) => `${k}=${v}`)
            .join('&');

        const hmac   = crypto.createHmac('sha512', secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

        // --- Bước 4: Thêm hash vào params ---
        vnp_Params['vnp_SecureHash'] = signed;

        // --- Bước 5: Build URL — encode giá trị chỉ ở đây ---
        const queryString = Object.entries(vnp_Params)
            .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
            .join('&');

        return `${vnpUrl}?${queryString}`;
    },

    /**
     * Xác thực chữ ký phản hồi (Checksum) từ VNPay gửi về.
     *
     * Express/qs đã decode các query params trước khi ta nhận được,
     * nên ta ký từ giá trị RAW (đã decode) — không encode lại.
     */
    verifyReturnUrl(queryParams) {
        const secretKey  = process.env.VNPAY_HASH_SECRET || 'GET8N1Z53R9I2O3Y4C5X6V7B8N9M0L';
        const secureHash = queryParams['vnp_SecureHash'];

        // Loại bỏ các trường hash khỏi params
        const params = { ...queryParams };
        delete params['vnp_SecureHash'];
        delete params['vnp_SecureHashType'];

        // Sắp xếp key alphabet, giữ giá trị RAW
        const sorted = sortObjectRaw(params);

        // Build signData từ giá trị RAW (Express đã decode rồi)
        const signData = Object.entries(sorted)
            .map(([k, v]) => `${k}=${v}`)
            .join('&');

        const hmac   = crypto.createHmac('sha512', secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

        return secureHash === signed;
    },
};
