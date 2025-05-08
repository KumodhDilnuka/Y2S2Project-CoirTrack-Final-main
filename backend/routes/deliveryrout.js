const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

// Nodemailer transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',  // You can use other services like SendGrid, Outlook, etc.
  auth: {
    user: process.env.EMAIL_USER,     // Your email
    pass: process.env.EMAIL_PASSWORD  // Your email password or app-specific password
  }
});

router.post('/contact', async (req, res) => {
  const { name, email, message } = req.body;

  const mailOptions = {
    from: process.env.EMAIL_USER,  // Your verified sender email
    to: email,  // Send to the email entered in the form
    subject: 'Your order placed',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Order Confirmation</h2>
        <p>Dear ${name},</p>
        <p>Thank you for your order. We have received your request and will process it shortly.</p>
        <p>Best regards,<br>Coir Track</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send email', error: error.toString() });
  }
});

module.exports = router;