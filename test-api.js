const axios = require('axios');

async function testAPI() {
  try {
    // First log in to get a token
    console.log('Attempting to log in...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@example.com',  // Replace with a valid admin email
      password: 'password123'      // Replace with the correct password
    });
    
    const token = loginResponse.data.token;
    console.log('Login successful, got token');
    
    // Now try the payment/pending endpoint with authentication
    const response = await axios.get('http://localhost:5000/payment/pending', {
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      }
    });
    
    console.log('Server response:', response.status);
    console.log('Pending orders:', response.data.length);
    
    if (response.data.length === 0) {
      console.log('No pending orders found, will try to create some');
      
      // Create test pending orders
      const createResponse = await axios.post('http://localhost:5000/payment/ensure-pending-orders', {}, {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      });
      
      console.log('Create test orders response:', createResponse.data);
    }
  } catch (error) {
    console.error('Error details:');
    
    // Log the error response information
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
      console.log('Headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.log('No response received. Request details:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error message:', error.message);
    }
  }
}

testAPI(); 