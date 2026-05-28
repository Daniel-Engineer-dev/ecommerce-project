const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const defaultFrom =
  process.env.EMAIL_FROM || `Dealzy Support <${process.env.EMAIL_USER}>`;

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
<body style="margin:0;padding:0;background-color:#f4f6fb;font-family:Inter, 'Segoe UI', sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f4f6fb;padding:30px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.07);">
                    <tr>
                        <td style="background:#0f4c81;color:#ffffff;padding:28px 32px;text-align:center;font-size:24px;font-weight:700;">
                            Dealzy
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:32px;line-height:1.7;color:#1d2630;font-size:16px;">
                            <h2 style="margin-top:0;color:#102a43;">${title}</h2>
                            <p style="margin:0 0 20px;color:#475569;">${intro}</p>
                            <div style="margin-bottom:28px;color:#334e68;">${body}</div>
                            ${buttonUrl ? `<p style="text-align:center;"><a href="${buttonUrl}" style="display:inline-block;padding:12px 24px;background:#0f4c81;color:#ffffff;border-radius:999px;text-decoration:none;font-weight:600;">${buttonText || "Xem chi tiết"}</a></p>` : ""}
                            <p style="margin:0;color:#64748b;font-size:14px;">${footer}</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background:#f8fafc;padding:20px 32px;text-align:center;color:#64748b;font-size:13px;">
                            © ${new Date().getFullYear()} Dealzy. Mọi quyền được bảo lưu.
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

  const mailOptions = {
    from: defaultFrom,
    to: email,
    subject,
    html: htmlContent,
    text: text || stripHtml(htmlContent),
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendEmail, buildEmailTemplate };
