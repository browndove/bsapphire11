const fetch = require('node-fetch');

async function testAPIEndpoint() {
  try {
    console.log('🔍 Testing /api/candidates endpoint...');

    const testData = {
      firstName: 'API',
      lastName: 'Test',
      middleName: 'User',
      email: 'apitest@example.com',
      location: 'greater-accra',        // Form value (will be mapped)
      framework: 'react',               // Form value (will be mapped)
      uiStructure: 'small-components',  // Form value (will be mapped)
      gitUsage: 'own-repos',            // Form value (will be mapped)
      designTools: 'figma',             // Form value (will be mapped)
      cvFileId: 1                       // Existing CV file ID
    };

    console.log('Sending data:', testData);

    const response = await fetch('http://localhost:3000/api/candidates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ API call successful!');
      console.log('Result:', result);
    } else {
      console.log('❌ API call failed!');
      console.log('Status:', response.status);
      console.log('Error:', result);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAPIEndpoint();
