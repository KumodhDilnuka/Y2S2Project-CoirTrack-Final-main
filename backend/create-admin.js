const mongoose = require('mongoose');
const User = require('./models/User');
const path = require('path');
const fs = require('fs');

// Manually load environment variables from .env file
try {
  const envFile = fs.readFileSync(path.resolve(__dirname, '.env'), 'utf8');
  envFile.split('\n').forEach(line => {
    if (line && !line.startsWith('#')) {
      const [key, value] = line.split('=');
      if (key && value) {
        process.env[key.trim()] = value.trim();
      }
    }
  });
  console.log("Environment variables loaded manually");
} catch (error) {
  console.error("Error manually loading .env file:", error);
}

const MONGODB_URI = process.env.MONGODB_URI;

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    // Admin user details
    const adminData = {
      name: 'Admin User',
      email: 'admin@coirtrack.com',
      password: 'admin123',
      role: 'admin'
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log('Admin user already exists');
      await mongoose.connection.close();
      return;
    }

    // Create new admin user
    const admin = new User(adminData);
    await admin.save();
    console.log('Admin user created successfully:');
    console.log('Email:', adminData.email);
    console.log('Password:', adminData.password);

    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

createAdminUser(); 