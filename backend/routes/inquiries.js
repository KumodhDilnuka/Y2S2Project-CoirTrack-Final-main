const express = require('express');
const router = express.Router();
const Inquiry = require('../models/Inquiry');
const { protect } = require('../middleware/auth');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

// Ensure environment variables are loaded correctly
console.log('EMAIL_USER in inquiries route:', process.env.EMAIL_USER);
console.log('EMAIL_PASSWORD length in inquiries route:', process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.length : 0);

// Configure nodemailer exactly like in the test script
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.trim() : ''
  },
  tls: {
    rejectUnauthorized: false
  },
  secure: true
});

// Test connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP server connection error in inquiries route:', error);
  } else {
    console.log('SMTP server connection established in inquiries route');
  }
});

// Utility function for sending emails - copied from test-email.js pattern
async function sendEmail(to, subject, htmlContent) {
  return new Promise((resolve, reject) => {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      html: htmlContent
    };
    
    console.log(`Attempting to send email to: ${to}`);
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Email sending error:', error);
        reject(error);
      } else {
        console.log(`Email sent: ${info.response}`);
        resolve(info);
      }
    });
  });
}

// Get all inquiries
router.get('/', async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    res.status(200).json(inquiries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get inquiries for the current user
router.get('/user', protect, async (req, res) => {
  try {
    // Get inquiries where the email matches the logged in user's email
    const inquiries = await Inquiry.find({ email: req.user.email }).sort({ createdAt: -1 });
    res.status(200).json(inquiries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single inquiry
router.get('/:id', async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }
    res.status(200).json(inquiry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new inquiry
router.post('/', async (req, res) => {
  const inquiry = new Inquiry({
    ...req.body,
    status: 'New'  // Set default status to 'New'
  });
  
  try {
    const newInquiry = await inquiry.save();
    
    // Send confirmation email using the new utility function
    const emailSubject = `Your inquiry has been received: ${inquiry.title}`;
    const emailHtml = `
      <h2>Thank you for your inquiry</h2>
      <p>Dear ${inquiry.name},</p>
      <p>We have received your inquiry with the following details:</p>
      <p><strong>Title:</strong> ${inquiry.title}</p>
      <p><strong>Category:</strong> ${inquiry.category}</p>
      <p><strong>Status:</strong> New</p>
      <p>We will respond to your inquiry as soon as possible.</p>
      <p>You can track the status of your inquiry by visiting our portal.</p>
      <p>Thank you for contacting us!</p>
      <p>Best regards,<br>CoirTrack Team</p>
    `;
    
    try {
      await sendEmail(inquiry.email, emailSubject, emailHtml);
      console.log(`Confirmation email sent to ${inquiry.email}`);
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
      // Continue with the response, don't fail the API call if email fails
    }
    
    res.status(201).json(newInquiry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update an inquiry
router.put('/:id', async (req, res) => {
  try {
    // Don't allow users to update status or responses
    const { status, responses, ...updateData } = req.body;
    
    const updatedInquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      { ...updateData, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!updatedInquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }

    res.status(200).json(updatedInquiry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete an inquiry
router.delete('/:id', protect, async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }
    
    // Check if user is admin or if this is their own inquiry (comparing emails)
    const isAdmin = req.user.role === 'admin';
    const isOwner = inquiry.email === req.user.email;
    
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Not authorized to delete this inquiry' });
    }
    
    await Inquiry.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: 'Inquiry deleted successfully' });
  } catch (error) {
    console.error('Delete inquiry error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update inquiry status
router.patch('/:id/status', async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }
    
    const oldStatus = inquiry.status;
    inquiry.status = req.body.status;
    inquiry.updatedAt = Date.now();
    
    const updatedInquiry = await inquiry.save();
    
    // Send status update email to client
    const emailSubject = `Status update on your inquiry: ${inquiry.title}`;
    const emailHtml = `
      <h2>Inquiry Status Update</h2>
      <p>Dear ${inquiry.name},</p>
      <p>The status of your inquiry has been updated:</p>
      <p><strong>Title:</strong> ${inquiry.title}</p>
      <p><strong>Previous Status:</strong> ${oldStatus}</p>
      <p><strong>New Status:</strong> ${inquiry.status}</p>
      <p>You can check the details of your inquiry by visiting our portal.</p>
      <p>Thank you for your patience!</p>
      <p>Best regards,<br>CoirTrack Team</p>
    `;
    
    try {
      await sendEmail(inquiry.email, emailSubject, emailHtml);
      console.log(`Status update email sent to ${inquiry.email}`);
    } catch (emailError) {
      console.error('Error sending status update email:', emailError);
      // Continue with the response, don't fail the API call if email fails
    }
    
    res.status(200).json(updatedInquiry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add response to an inquiry
router.post('/:id/responses', async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }
    
    // Initialize responses array if it doesn't exist
    if (!inquiry.responses) {
      inquiry.responses = [];
    }
    
    // Create a new response object
    const newResponse = {
      message: req.body.message,
      responder: req.body.responder,
      isInternal: req.body.isInternal || false,
      createdAt: Date.now()
    };
    
    // Add response to inquiry
    inquiry.responses.push(newResponse);
    inquiry.updatedAt = Date.now();
    
    // If this is a customer-visible response, update status to "Pending Client Response"
    if (!req.body.isInternal && inquiry.status !== 'Resolved' && inquiry.status !== 'Closed') {
      inquiry.status = 'Pending Client Response';
    }
    
    // Save updated inquiry
    const updatedInquiry = await inquiry.save();
    
    // If not an internal note, send email notification to client
    if (!req.body.isInternal) {
      const emailSubject = `New response to your inquiry: ${inquiry.title}`;
      const emailHtml = `
        <h2>New Response to Your Inquiry</h2>
        <p>Dear ${inquiry.name},</p>
        <p>We have added a new response to your inquiry:</p>
        <p><strong>Title:</strong> ${inquiry.title}</p>
        <p><strong>Response:</strong> ${req.body.message}</p>
        <p><strong>From:</strong> ${req.body.responder}</p>
        <p>You can view the full conversation by visiting our portal.</p>
        <p>Thank you for your patience!</p>
        <p>Best regards,<br>CoirTrack Team</p>
      `;
      
      try {
        await sendEmail(inquiry.email, emailSubject, emailHtml);
        console.log(`Response notification email sent to ${inquiry.email}`);
      } catch (emailError) {
        console.error('Error sending response notification email:', emailError);
        // Continue with the response, don't fail the API call if email fails
      }
    }
    
    res.status(200).json(updatedInquiry);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 