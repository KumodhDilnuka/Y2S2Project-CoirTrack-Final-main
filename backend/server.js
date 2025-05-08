const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require("body-parser");
const morgan = require('morgan');
require('dotenv').config();

// Manually load environment variables from env-config.txt file
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
  console.log("Environment variables loaded manually from env-config.txt");
} catch (error) {
  console.error("Error manually loading env-config.txt file:", error);
}

// Log environment variables for debugging
console.log("Environment variables:", {
  PORT: process.env.PORT,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET ? 'Set correctly' : 'Missing',
  EMAIL_USER: process.env.EMAIL_USER ? 'Set correctly' : 'Missing',
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? 'Set correctly' : 'Missing'
});

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// Middleware
app.use(express.json());
app.use(cors()); // Allow all origins for now, you can configure it more restrictively
app.use(bodyParser.json());
app.use('/images', express.static('images'));
app.use(morgan('dev'));

// Import routes
const ItemRouter = require("./routes/Item");
const paymentRoutes = require('./routes/payments');
const contactRoutes = require('./routes/contactRoutes');
const trackingRoutes = require('./routes/deliveryrout');
const authRoutes = require('./routes/authRoutes');
const feedbackRoutes = require('./routes/feedback');
const inquiryRoutes = require('./routes/inquiries');
const supplierRoutes = require('./routes/supplierRoutes');
const stockRoutes = require('./routes/stockRoutes');

// Use Routes
app.use("/item", ItemRouter);
app.use('/payment', paymentRoutes);
app.use('/api', contactRoutes);
app.use('/apii', trackingRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/stocks', stockRoutes);

// Connect to MongoDB
if (!MONGODB_URI) {
  console.error("MONGODB_URI is undefined. Please check your .env file.");
} else {
  mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      console.log("Connected to MongoDB");
      // Start the server after successful database connection
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    })
    .catch(error => {
      console.error("Error connecting to MongoDB:", error);
    });
}

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}
