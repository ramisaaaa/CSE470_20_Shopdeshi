const nodemailer = require('nodemailer');

function getMailer() {
  if (!nodemailer) return null;

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    if (process.env.SMTP_SERVICE && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        return nodemailer.createTransport({
          service: process.env.SMTP_SERVICE,
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        });
      } catch (_) { return null; }
    }
    return null;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: String(process.env.SMTP_PORT) === '465',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      tls: { rejectUnauthorized: false }
    });
    transporter.verify(() => {});
    return transporter;
  } catch (e) {
    return null;
  }
}

async function sendOrderEmail(email, subject, html) {
  const transporter = getMailer();
  if (!transporter) return false;
  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject,
    html
  });
  return info;
}

module.exports = { getMailer, sendOrderEmail };


