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
    from: email,  // Sender's email
    to: process.env.SUPPLIER_EMAIL,  // Your supplier's email
    subject: `Contact from Shop: Message from ${name}`,
    text: `
      Name: ${name}
      Email: ${email}

      Message:
      ${message}
    `,
    replyTo: email
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