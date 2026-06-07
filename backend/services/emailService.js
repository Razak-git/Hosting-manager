const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendVerificationCode = async (email, code) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Hosting Manager — Your verification code',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #0f0f1a; margin: 0; padding: 0; }
          .container { max-width: 520px; margin: 40px auto; background: #1a1a2e; border-radius: 16px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 32px; text-align: center; }
          .header h1 { color: #fff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
          .header p { color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px; }
          .body { padding: 40px 32px; }
          .body p { color: #94a3b8; font-size: 15px; line-height: 1.6; margin: 0 0 24px; }
          .code-box { background: #0f0f1a; border: 2px solid #6366f1; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }
          .code { font-size: 42px; font-weight: 800; letter-spacing: 12px; color: #6366f1; font-family: monospace; }
          .expire { color: #64748b; font-size: 13px; margin-top: 12px; }
          .footer { border-top: 1px solid #2d2d4e; padding: 24px 32px; text-align: center; }
          .footer p { color: #475569; font-size: 12px; margin: 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚡ Hosting Manager</h1>
            <p>Account Verification</p>
          </div>
          <div class="body">
            <p>Hello,</p>
            <p>We received a request to create an account with this email address. Use the verification code below to continue:</p>
            <div class="code-box">
              <div class="code">${code}</div>
              <div class="expire">Expires in 15 minutes</div>
            </div>
            <p>If you did not request this, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            <p>© 2024 Hosting Manager — Secure Hosting Platform</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendVerificationCode };
