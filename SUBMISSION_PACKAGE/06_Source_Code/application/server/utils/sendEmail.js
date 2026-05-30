const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // 1. Tạo transporter (Dùng Gmail làm ví dụ)
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    // 2. Định nghĩa mail options
    const mailOptions = {
        from: `Dealzy Support <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        html: options.html
    };

    // 3. Gửi mail thực tế
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
