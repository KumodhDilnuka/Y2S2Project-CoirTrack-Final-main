const axios = require('axios');

async function testAuth() {
  try {
    console.log('Attempting to log in...');
    // Try different credential combinations
    const credentials = [
      { email: 'admin@coirtrack.com', password: 'admin123' },
      { email: 'admin@example.com', password: 'password123' },
      { email: 'admin@admin.com', password: 'admin' }
    ];
    
    let loginSuccess = false;
    let loginResponse;
    
    for (const cred of credentials) {
      try {
        console.log(`Trying login with email: ${cred.email}`);
        loginResponse = await axios.post('http://localhost:5000/api/auth/login', cred);
        loginSuccess = true;
        console.log('Login successful with these credentials!');
        break;
      } catch (err) {
        console.log(`Failed login with ${cred.email}: ${err.response?.data?.msg || err.message}`);
      }
    }
    
    if (!loginSuccess) {
      console.log('All login attempts failed. Please check your admin credentials.');
      return;
    }
    
    console.log('User:', loginResponse.data.user);
    console.log('Token:', loginResponse.data.token);
    
    // Store token for further use
    const token = loginResponse.data.token;
    
    // Test the auth endpoint to verify token works
    console.log('\nTesting authentication endpoint...');
    const authTestResponse = await axios.get('http://localhost:5000/payment/auth-test', {
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      }
    });
    
    console.log('Auth test successful:');
    console.log(authTestResponse.data);
    
    return token;
  } catch (error) {
    console.error('Authentication Error:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    } else {
      console.log('Error message:', error.message);
    }
  }
}

testAuth(); 