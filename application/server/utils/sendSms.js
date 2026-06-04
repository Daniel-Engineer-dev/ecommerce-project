// D:\TMDT Software plan\server\utils\sendSms.js

const sendSms = async ({ phone, content }) => {
    // Luôn luôn ghi log mã OTP ra console server để test giả lập theo yêu cầu của người dùng
    console.log(`\n========================================`);
    console.log(`[MOCK SMS] Gửi mã OTP đến SĐT: ${phone}`);
    console.log(`[MOCK SMS] Nội dung: ${content}`);
    console.log(`========================================\n`);
    return true;
};

module.exports = sendSms;
