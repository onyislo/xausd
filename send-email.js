const nodemailer = require('nodemailer');

// Using Resend SMTP (API key-based, no password needed)
// Get your API key from: https://resend.com/api-keys
const transporter = nodemailer.createTransport({
  host: 'smtp.resend.com',
  port: 465,
  secure: true,
  auth: {
    user: 'resend',
    pass: 'YOUR_RESEND_API_KEY_HERE' // Get from https://resend.com
  }
});

// Email options
const mailOptions = {
  from: 'Maya <maya@swift.com>', // Must be a verified domain in Resend
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
