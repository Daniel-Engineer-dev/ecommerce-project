module.exports = {
    /**
     * Tạo URL ảnh QR chuyển khoản Ngân hàng tự động theo chuẩn VietQR
     */
    generateQrUrl(orderId, amount) {
        const bankId = process.env.BANK_ID || 'MB'; // MB Bank
        const accountNo = process.env.BANK_ACCOUNT_NO || '999918059999'; // Số tài khoản mẫu
        const accountName = process.env.BANK_ACCOUNT_NAME || 'CONG TY DEALZY';
        const template = 'compact2'; // Mẫu compact2 hiển thị kèm thông tin chuyển khoản ở đáy ảnh
        
        // Tạo nội dung chuyển khoản thống nhất không dấu
        const rawAddInfo = `DEALZY ORDER ${orderId}`;
        const addInfo = encodeURIComponent(rawAddInfo);
        const nameEncoded = encodeURIComponent(accountName);
        
        return `https://img.vietqr.io/image/${bankId}-${accountNo}-${template}.png?amount=${amount}&addInfo=${addInfo}&accountName=${nameEncoded}`;
    }
};
