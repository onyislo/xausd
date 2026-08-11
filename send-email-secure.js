require('dotenv').config();
const nodemailer = require('nodemailer');

// Using Resend SMTP with environment variable
const transporter = nodemailer.createTransport({
  host: 'smtp.resend.com',
  port: 465,
  secure: true,
  auth: {
    user: 'resend',
    pass: process.env.RESEND_API_KEY // Stored in .env file
  }
});

// Email options
const mailOptions = {
  from: process.env.FROM_EMAIL || 'Maya <onboarding@resend.dev>',
  to: 'rodneyoching5@gmail.com',
  subject: 'Hello from Maya',
  text: 'This is a test email sent using Nodemailer with Resend.',
  html: '<p>This is a <strong>test email</strong> sent using Nodemailer with Resend.</p>'
};

// Send email
async function sendEmail() {
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
  }
}

// Execute
sendEmail();
