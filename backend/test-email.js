const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

// Load environment variables
try {
  const envFile = fs.readFileSync(path.resolve(__dirname, 'env-config.txt'), 'utf8');
  envFile.split('\n').forEach(line => {
    if (line && !line.startsWith('#')) {
      const [key, value] = line.split('=');
      if (key && value) {
        process.env[key.trim()] = value.trim();
      }
    }
  });
  console.log("Environment variables loaded");
} catch (error) {
  console.error("Error loading env-config.txt file:", error);
}

console.log('Email settings:');
console.log('- Email user:', process.env.EMAIL_USER);
console.log('- Password length:', process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.length : 0);

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  },
  secure: true
});

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP server connection error:', error);
  } else {
    console.log('SMTP server connection established successfully');
    
    // Send test email
    sendTestEmail();
  }
});

async function sendTestEmail() {
  try {
    const testMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to self for testing
      subject: 'CoirTrack Email Test',
      html: `
        <h2>Email Test</h2>
        <p>This is a test email to verify the email sending functionality is working.</p>
        <p>If you received this email, your email configuration is correct.</p>
        <p>Time sent: ${new Date().toLocaleString()}</p>
      `
    };
    
    console.log('Sending test email...');
    const info = await transporter.sendMail(testMailOptions);
    console.log('Test email sent successfully:', info.response);
  } catch (error) {
    console.error('Error sending test email:', error);
  }
} 