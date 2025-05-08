const axios = require('axios');

async function createPendingOrders() {
  try {
    // First log in to get a token
    console.log('Logging in as admin...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@coirtrack.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('Login successful, got token');
    
    // Create test pending orders
    console.log('Creating test pending orders...');
    const response = await axios.post('http://localhost:5000/payment/ensure-pending-orders', {}, {
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      }
    });
    
    console.log('Success! Response:', response.data);
    
    // Check pending orders
    console.log('\nFetching pending orders...');
    const ordersResponse = await axios.get('http://localhost:5000/payment/pending', {
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      }
    });
    
    console.log(`Found ${ordersResponse.data.length} pending orders`);
    ordersResponse.data.forEach((order, index) => {
      console.log(`Order ${index + 1}:`, {
        id: order._id,
        totalAmount: order.totalAmount,
        status: order.approvalStatus
      });
    });
    
  } catch (error) {
    console.error('Error:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    } else {
      console.log('Error message:', error.message);
    }
  }
}

createPendingOrders(); 