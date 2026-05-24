const crypto = require('crypto');

/**
 * Sắp xếp các key của object theo bảng chữ cái alphabet (Bắt buộc theo chuẩn VNPay)
 */
function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
    }
    return sorted;
}

module.exports = {
    /**
     * Tạo URL thanh toán VNPay gửi đi
     */
    createPaymentUrl(orderId, amount, ipAddr) {
        const tmnCode = process.env.VNPAY_TMN_CODE || '2QXFAH13';
        const secretKey = process.env.VNPAY_HASH_SECRET || 'GET8N1Z53R9I2O3Y4C5X6V7B8N9M0L';
        let vnpUrl = process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
        const returnUrl = process.env.VNPAY_RETURN_URL || 'http://localhost:5173/payment/status';
        
        const date = new Date();
        const pad = (num) => String(num).padStart(2, '0');
        const createDate = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
        
        let vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = tmnCode;
        vnp_Params['vnp_Locale'] = 'vn';
        vnp_Params['vnp_CurrCode'] = 'VND';
        vnp_Params['vnp_TxnRef'] = orderId;
        vnp_Params['vnp_OrderInfo'] = 'Thanh toan don hang #' + orderId;
        vnp_Params['vnp_OrderType'] = 'other';
        vnp_Params['vnp_Amount'] = amount * 100; // VNPay quy định nhân 100 (đơn vị xu)
        vnp_Params['vnp_ReturnUrl'] = returnUrl;
        vnp_Params['vnp_IpAddr'] = ipAddr || '127.0.0.1';
        vnp_Params['vnp_CreateDate'] = createDate;
        
        vnp_Params = sortObject(vnp_Params);
        
        const signData = Object.keys(vnp_Params)
            .map(key => `${key}=${vnp_Params[key]}`)
            .join('&');
            
        const hmac = crypto.createHmac('sha512', secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
        
        vnp_Params['vnp_SecureHash'] = signed;
        
        const query = Object.keys(vnp_Params)
            .map(key => `${key}=${vnp_Params[key]}`)
            .join('&');
            
        return vnpUrl + '?' + query;
    },
    
    /**
     * Xác thực chữ ký phản hồi bảo mật (Checksum) từ VNPay gửi về
     */
    verifyReturnUrl(queryParams) {
        const secretKey = process.env.VNPAY_HASH_SECRET || 'GET8N1Z53R9I2O3Y4C5X6V7B8N9M0L';
        const secureHash = queryParams['vnp_SecureHash'];
        
        let vnp_Params = { ...queryParams };
        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];
        
        vnp_Params = sortObject(vnp_Params);
        
        const signData = Object.keys(vnp_Params)
            .map(key => `${key}=${vnp_Params[key]}`)
            .join('&');
            
        const hmac = crypto.createHmac('sha512', secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
        
        return secureHash === signed;
    }
};
