// D:\TMDT Software plan\server\utils\sendSms.js

const axios = require('axios');

const sendSms = async ({ phone, content }) => {
    const apiKey = process.env.SPEEDSMS_API_KEY;

    if (!apiKey) {
        console.log(`--- [MOCK SMS] ---`);
        console.log(`Gửi đến: ${phone}`);
        console.log(`Nội dung: ${content}`);
        console.log(`------------------`);
        return true;
    }

    try {
        // Gọi API thật của SpeedSMS
        const response = await axios.get(`https://api.speedsms.vn/index.php/sms/send`, {
            params: {
                access_token: apiKey,
                to: phone,
                content: content,
                type: 2 // Type 2 là tin nhắn CSKH / OTP
            }
        });

        if (response.data.status === 'success') {
            console.log(`[SpeedSMS] Gửi thành công tới ${phone}`);
            return true;
        } else {
            console.error(`[SpeedSMS] Lỗi từ nhà cung cấp:`, response.data.message);
            return false;
        }
    } catch (error) {
        console.error("Lỗi kết nối SpeedSMS API:", error.message);
        return false;
    }
};

module.exports = sendSms;
