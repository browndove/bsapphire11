const fetch = require('node-fetch');

async function testLogin() {
  try {
    console.log('Testing login API...');
    
    const response = await fetch('http://localhost:3003/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@bsapphire.com',
        password: 'admin123'
      }),
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));

  } catch (error) {
    console.error('Test error:', error);
  }
}

testLogin();
