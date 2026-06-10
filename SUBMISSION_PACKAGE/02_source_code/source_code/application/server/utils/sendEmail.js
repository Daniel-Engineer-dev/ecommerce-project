const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const defaultFrom =
  process.env.EMAIL_FROM || `Dealzy Support <${process.env.EMAIL_USER || 'support@dealzy.vn'}>`;

const buildEmailTemplate = ({
  title = "Thông báo từ Dealzy",
  intro = "",
  body = "",
  buttonText,
  buttonUrl,
  footer = "Nếu bạn cần trợ giúp thêm, hãy liên hệ với chúng tôi.",
}) => {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#eef2f7;font-family:Inter, 'Segoe UI', Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#eef2f7;padding:32px 16px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;max-width:600px;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 18px 45px rgba(15, 23, 42, 0.08);">
                    <tr>
                        <td style="background:#0f4c81;color:#ffffff;padding:30px 32px;text-align:center;">
                            <div style="font-size:28px;font-weight:800;letter-spacing:0.2px;">Dealzy</div>
                            <div style="margin-top:6px;font-size:13px;color:#dbeafe;font-weight:500;">Nền tảng ưu đãi dành cho đối tác và khách hàng</div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:38px 40px 34px;line-height:1.7;color:#1f2937;font-size:16px;">
                            <h1 style="margin:0 0 16px;color:#102a43;font-size:26px;line-height:1.3;font-weight:800;">${title}</h1>
                            ${intro ? `<p style="margin:0 0 22px;color:#475569;font-size:16px;">${intro}</p>` : ""}
                            <div style="margin:0 0 30px;color:#334155;">${body}</div>
                            ${buttonUrl ? `<table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto 30px;"><tr><td align="center" style="border-radius:999px;background:#0f4c81;"><a href="${buttonUrl}" style="display:inline-block;padding:14px 28px;color:#ffffff;border-radius:999px;text-decoration:none;font-weight:700;font-size:15px;">${buttonText || "Xem chi tiết"}</a></td></tr></table>` : ""}
                            <p style="margin:0;color:#64748b;font-size:14px;border-top:1px solid #e5e7eb;padding-top:18px;">${footer}</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background:#f8fafc;padding:20px 32px;text-align:center;color:#64748b;font-size:12px;line-height:1.6;">
                            © ${new Date().getFullYear()} Dealzy. Mọi quyền được bảo lưu.<br />
                            Email này được gửi tự động, vui lòng không trả lời trực tiếp.
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
};

const stripHtml = (html) =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

let testAccount = null;
let etherealTransporter = null;
const EMAIL_SEND_TIMEOUT_MS = Number(process.env.EMAIL_SEND_TIMEOUT_MS || 20000);

const withTimeout = (promise, timeoutMs, message) => {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(message)), timeoutMs);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
};

const getEtherealTransporter = async () => {
  if (!etherealTransporter) {
    testAccount = await nodemailer.createTestAccount();
    etherealTransporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log(`[EMAIL] Khởi tạo tài khoản kiểm thử Ethereal thành công: user=${testAccount.user}`);
  }
  return etherealTransporter;
};

const sendEtherealEmail = async (mailOptions) => {
  try {
    const transport = await getEtherealTransporter();
    const info = await withTimeout(transport.sendMail(mailOptions), EMAIL_SEND_TIMEOUT_MS, "Email test delivery timed out");
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`\n========================================`);
    console.log(`[EMAIL MOCK] Email đã được gửi thành công qua Ethereal!`);
    console.log(`Người nhận: ${mailOptions.to}`);
    console.log(`Tiêu đề: ${mailOptions.subject}`);
    console.log(`Đường dẫn xem thử Email (Preview URL): ${previewUrl}`);
    console.log(`========================================\n`);
  } catch (err) {
    console.error(`[EMAIL] Lỗi khi gửi email kiểm thử qua Ethereal:`, err.message);
  }
};

const sendEmail = async (options) => {
  const { email, subject, html, text, template } = options;

  if (!email) throw new Error("Email người nhận không được để trống");
  if (!subject) throw new Error("Tiêu đề email không được để trống");

  let htmlContent = html;
  if (!htmlContent && template) {
    htmlContent = buildEmailTemplate(template);
  }

  if (!htmlContent) {
    throw new Error(
      "Nội dung email chưa được cung cấp. Hãy truyền `html` hoặc `template`.",
    );
  }

  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  const useRealEmail = user && pass && user.trim() !== "" && pass.trim() !== "";

  const mailOptions = {
    from: useRealEmail ? defaultFrom : `"Dealzy Support (Demo)" <support@dealzy.vn>`,
    to: email,
    subject,
    html: htmlContent,
    text: text || stripHtml(htmlContent),
  };

  if (useRealEmail) {
    try {
      await withTimeout(transporter.sendMail(mailOptions), EMAIL_SEND_TIMEOUT_MS, "Email delivery timed out");
      console.log(`[EMAIL] Đã gửi email thực tế đến: ${email}`);
    } catch (error) {
      if (process.env.NODE_ENV === "production") {
        console.error(`[EMAIL] Lỗi gửi email thực tế: ${error.message}`);
        throw new Error("Khong the gui email OTP. Vui long thu lai sau.");
      }
      console.error(`[EMAIL] Lỗi gửi email thực tế: ${error.message}. Chuyển hướng sang Ethereal...`);
      await withTimeout(sendEtherealEmail(mailOptions), EMAIL_SEND_TIMEOUT_MS, "Email fallback timed out");
    }
  } else {
    console.log(`[EMAIL] EMAIL_USER/EMAIL_PASS chưa cấu hình. Gửi email qua Ethereal...`);
    if (process.env.NODE_ENV === "production") {
      throw new Error("Email service is not configured.");
    }
    await withTimeout(sendEtherealEmail(mailOptions), EMAIL_SEND_TIMEOUT_MS, "Email fallback timed out");
  }
};

module.exports = { sendEmail, buildEmailTemplate };
