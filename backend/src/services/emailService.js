// services/emailService.js
// ------------------------------------------------------------
// Sends account-verification / password-reset emails.
//
// EMAIL_MODE=smtp  -> uses nodemailer + real SMTP credentials
//                     (set SMTP_HOST/PORT/USER/PASS in .env)
// EMAIL_MODE=console (default in sandbox) -> logs the link to
//                     the server console instead of sending,
//                     so the flow is fully testable without
//                     real mail credentials.
// ------------------------------------------------------------

const nodemailer = require('nodemailer');

const MODE = process.env.EMAIL_MODE || 'console';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

let transporter = null;
if (MODE === 'smtp') {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function send({ to, subject, html, text }) {
  if (MODE === 'smtp') {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'PartSniper <no-reply@partsniper.app>',
      to,
      subject,
      html,
      text,
    });
  } else {
    // Console mode: print the email so devs/testers can grab the link.
    console.log('\n========== [EMAIL: console mode] ==========');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log(text || html);
    console.log('=============================================\n');
  }
}

async function sendVerificationEmail(toEmail, username, token) {
  const link = `${FRONTEND_URL}/verify-email?token=${token}`;
  await send({
    to: toEmail,
    subject: 'Verify your PartSniper account',
    text: `Hi ${username},\n\nWelcome to PartSniper! Please verify your email by visiting:\n${link}\n\nThis link expires in 24 hours.\n\nIf you didn't sign up, you can ignore this email.`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#0F1115">Welcome to PartSniper, ${username} 🎯</h2>
        <p>Please confirm your email address to activate your account.</p>
        <p style="margin:24px 0">
          <a href="${link}" style="background:#C6FF3A;color:#0F1115;padding:12px 24px;
            border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block">
            Verify Email
          </a>
        </p>
        <p style="color:#8B919C;font-size:13px">Or paste this link into your browser:<br>${link}</p>
        <p style="color:#8B919C;font-size:13px">This link expires in 24 hours.</p>
      </div>
    `,
  });
}

async function sendPasswordResetEmail(toEmail, username, token) {
  const link = `${FRONTEND_URL}/reset-password?token=${token}`;
  await send({
    to: toEmail,
    subject: 'Reset your PartSniper password',
    text: `Hi ${username},\n\nWe received a request to reset your password. Visit:\n${link}\n\nThis link expires in 1 hour. If you didn't request this, ignore this email.`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#0F1115">Password reset request</h2>
        <p>Hi ${username}, click below to set a new password.</p>
        <p style="margin:24px 0">
          <a href="${link}" style="background:#C6FF3A;color:#0F1115;padding:12px 24px;
            border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block">
            Reset Password
          </a>
        </p>
        <p style="color:#8B919C;font-size:13px">This link expires in 1 hour.</p>
      </div>
    `,
  });
}

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
